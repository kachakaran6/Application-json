import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import path from "path";
import fs from "fs";
import {
  AppPlayStatus,
  PlayConsoleResponse,
  MONITORED_CATALOG,
  PLAY_STORE_DEFAULT_ICONS,
} from "@/lib/play-console";
import baselineApps from "@/lib/play-console-baseline.json";

export const dynamic = "force-dynamic";

const SERVICE_ACCOUNT_EMAIL = "karan-dev@flutter-applcations.iam.gserviceaccount.com";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

let memoryCache: {
  data: PlayConsoleResponse;
  expiresAt: number;
} | null = null;

// Read icons from app.json if present for nice UI integration
function getAppIconsMap(): Record<string, string> {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    if (fs.existsSync(appJsonPath)) {
      const data = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
      const map: Record<string, string> = {};
      if (Array.isArray(data.apps)) {
        for (const app of data.apps) {
          if (app.packageName && app.iconUrl) {
            map[app.packageName] = app.iconUrl;
          }
        }
      }
      return map;
    }
  } catch {
    // fallback gracefully
  }
  return {};
}

// Helper to query one app through Google Play API with proper session cleanup
async function queryAppSingleAttempt(
  play: any,
  item: { name: string; pkg: string },
  iconsMap: Record<string, string>
): Promise<AppPlayStatus> {
  const result: AppPlayStatus = {
    packageName: item.pkg,
    catalogName: item.name,
    iconUrl: PLAY_STORE_DEFAULT_ICONS[item.pkg] || iconsMap[item.pkg] || "",
    playStoreUrl: `https://play.google.com/store/apps/details?id=${item.pkg}`,
    status: "success",
    isLiveProduction: false,
    isClosedTesting: false,
    isInternalDraft: false,
  };

  let editId: string | null = null;
  try {
    // 1. Initialize Session
    const edit = await play.edits.insert({ packageName: item.pkg });
    editId = edit.data.id;

    // 2. Fetch App Details (Title, etc.)
    try {
      const details = await play.edits.details.get({
        editId,
        packageName: item.pkg,
      });
      if (details.data.title) {
        result.localizedTitle = details.data.title;
      }
    } catch {
      // details query may fail or be empty; non-fatal
    }

    // 2.1 Fetch Real App Icon directly from Google Play Store graphics
    try {
      let playIconUrl: string | null = null;
      try {
        const iconRes = await play.edits.images.list({
          editId,
          packageName: item.pkg,
          imageType: "icon",
          language: "en-US",
        });
        playIconUrl = iconRes.data.images?.[0]?.url || null;
      } catch {
        // language may not be en-US
      }

      if (!playIconUrl) {
        const listings = await play.edits.listings.list({
          editId,
          packageName: item.pkg,
        });
        for (const l of listings.data.listings || []) {
          try {
            const iconRes = await play.edits.images.list({
              editId,
              packageName: item.pkg,
              imageType: "icon",
              language: l.language,
            });
            if (iconRes.data.images?.[0]?.url) {
              playIconUrl = iconRes.data.images[0].url;
              break;
            }
          } catch {
            // continue
          }
        }
      }

      if (playIconUrl) {
        result.iconUrl = playIconUrl;
      }
    } catch {
      // fallback to app.json icon or default
    }

    // 3. Fetch Release Tracks
    const tracksRes = await play.edits.tracks.list({
      editId,
      packageName: item.pkg,
    });
    const tracks = tracksRes.data.tracks || [];

    const prodTrack = tracks.find((t: any) => t.track === "production");
    const alphaTrack = tracks.find((t: any) => t.track === "alpha");
    const internalTrack = tracks.find((t: any) => t.track === "internal");
    const betaTrack = tracks.find((t: any) => t.track === "beta");

    if (prodTrack?.releases?.[0]) {
      result.production = prodTrack.releases[0];
      if (prodTrack.releases[0].status === "completed") {
        result.isLiveProduction = true;
      }
    }

    if (alphaTrack?.releases?.[0]) {
      result.alpha = alphaTrack.releases[0];
      // Closed testing if alpha has releases and not live production
      if (!result.isLiveProduction && alphaTrack.releases[0].status) {
        result.isClosedTesting = true;
      }
    }

    if (internalTrack?.releases?.[0]) {
      result.internal = internalTrack.releases[0];
    }

    if (betaTrack?.releases?.[0]) {
      result.beta = betaTrack.releases[0];
    }

    // Internal / Draft determination
    if (
      !result.isLiveProduction &&
      !result.isClosedTesting &&
      (result.internal || (!result.production && !result.alpha))
    ) {
      result.isInternalDraft = true;
    }
  } catch (err: any) {
    const statusCode = err.code || err.status || 500;
    if (statusCode === 404) {
      result.status = "not_found";
      result.errorMessage =
        "Application not found or not published in this Play Console account.";
      result.isInternalDraft = true;
    } else if (statusCode === 403) {
      result.status = "permission_denied";
      result.errorMessage = `Service account access pending. Ensure ${SERVICE_ACCOUNT_EMAIL} has been granted Viewer/Admin access for this app in Google Play Console.`;
      result.isInternalDraft = true;
    } else {
      result.status = "error";
      result.errorMessage = err.message || "Failed to query Google Play API";
      result.isInternalDraft = true;
    }
  } finally {
    // 4. Always Close Session to prevent edit lockouts
    if (editId) {
      try {
        await play.edits.delete({ editId, packageName: item.pkg });
      } catch {
        // session might already be gone
      }
    }
  }

  return result;
}

// Wrapper with automatic retry on transient errors
async function fetchAppPlayStatus(
  play: any,
  item: { name: string; pkg: string },
  iconsMap: Record<string, string>
): Promise<AppPlayStatus> {
  const firstAttempt = await queryAppSingleAttempt(play, item, iconsMap);
  if (firstAttempt.status === "error") {
    // Wait 800ms and retry once if Google returned a transient error
    await new Promise((r) => setTimeout(r, 800));
    return queryAppSingleAttempt(play, item, iconsMap);
  }
  return firstAttempt;
}

// Concurrency pool helper to run batch of promises smoothly without overloading API
async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      results[idx] = await fn(items[idx]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("force_refresh") === "true";

    const now = Date.now();

    // 5. Caching check
    if (!forceRefresh && memoryCache && memoryCache.expiresAt > now) {
      return NextResponse.json({
        ...memoryCache.data,
        cached: true,
        cacheExpiresInSeconds: Math.max(0, Math.round((memoryCache.expiresAt - now) / 1000)),
      });
    }

    // Resolve credentials via Env Var or file mount
    let auth: any = null;

    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.PLAY_CONSOLE_KEY_JSON) {
      try {
        const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.PLAY_CONSOLE_KEY_JSON || "";
        const credentials = JSON.parse(rawJson);
        auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ["https://www.googleapis.com/auth/androidpublisher"],
        });
      } catch (err: any) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON environment variable: ${err.message}`,
          },
          { status: 500 }
        );
      }
    } else {
      const candidates = [
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
        path.resolve(process.cwd(), "api-key.json"),
        "/app/api-key.json",
        path.resolve(process.cwd(), "..", "api-key.json"),
      ].filter(Boolean) as string[];

      const keyPath = candidates.find((p) => fs.existsSync(p));

      if (!keyPath) {
        // Return verified catalog baseline snapshot so dashboard is fully functional out of the box
        const apps = (baselineApps as unknown) as AppPlayStatus[];
        const liveProduction = apps.filter((a) => a.isLiveProduction).length;
        const closedTesting = apps.filter((a) => a.isClosedTesting).length;
        const internalDraft = apps.filter((a) => !a.isLiveProduction && !a.isClosedTesting).length;

        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          cached: true,
          isBaselineFallback: true,
          notice: "Google Play API credentials not configured in environment. Showing verified baseline telemetry snapshot. To enable live auto-sync, add GOOGLE_SERVICE_ACCOUNT_JSON in Coolify.",
          cacheExpiresInSeconds: 3600,
          serviceAccount: SERVICE_ACCOUNT_EMAIL,
          metrics: {
            total: apps.length,
            liveProduction,
            closedTesting,
            internalDraft,
          },
          apps,
        });
      }

      auth = new google.auth.GoogleAuth({
        keyFile: keyPath,
        scopes: ["https://www.googleapis.com/auth/androidpublisher"],
      });
    }

    const play = google.androidpublisher({
      version: "v3",
      auth,
    });

    const iconsMap = getAppIconsMap();

    // Query 18 apps with concurrency limit of 5 (fast, under 3 seconds total)
    const apps = await runWithConcurrency(MONITORED_CATALOG, 5, (item) =>
      fetchAppPlayStatus(play, item, iconsMap)
    );

    // Calculate metrics
    const liveProduction = apps.filter((a) => a.isLiveProduction).length;
    const closedTesting = apps.filter((a) => a.isClosedTesting).length;
    const internalDraft = apps.filter(
      (a) => !a.isLiveProduction && !a.isClosedTesting
    ).length;

    const responseData: PlayConsoleResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      cached: false,
      cacheExpiresInSeconds: Math.round(CACHE_TTL_MS / 1000),
      serviceAccount: SERVICE_ACCOUNT_EMAIL,
      metrics: {
        total: apps.length,
        liveProduction,
        closedTesting,
        internalDraft,
      },
      apps,
    };

    // Update memory cache
    memoryCache = {
      data: responseData,
      expiresAt: now + CACHE_TTL_MS,
    };

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("Play Console API Route Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal server error fetching Play Console status",
      },
      { status: 500 }
    );
  }
}
