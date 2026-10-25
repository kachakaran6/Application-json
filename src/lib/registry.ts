import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import {
  AppItem,
  WebsiteItem,
  RegistryData,
  RegistrySchema,
  AppItemSchema,
  WebsiteItemSchema,
} from "./schemas";
import {
  isGitHubMode,
  getFileFromGitHub,
  commitFileToGitHub,
  getFileShaFromGitHub,
} from "./github";

const APP_JSON_PATH = path.join(process.cwd(), "app.json");
const BACKUPS_DIR = path.join(process.cwd(), ".backups");

async function ensureBackupDir() {
  if (!fsSync.existsSync(BACKUPS_DIR)) {
    try {
      await fs.mkdir(BACKUPS_DIR, { recursive: true });
    } catch {}
  }
}

export async function createBackup(): Promise<string | null> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `app-${timestamp}.json`;

  // Local filesystem backup
  try {
    await ensureBackupDir();
    if (fsSync.existsSync(APP_JSON_PATH)) {
      const backupFilePath = path.join(BACKUPS_DIR, backupFileName);
      await fs.copyFile(APP_JSON_PATH, backupFilePath);

      const files = await fs.readdir(BACKUPS_DIR);
      const jsonBackups = files
        .filter((f) => f.startsWith("app-") && f.endsWith(".json"))
        .sort()
        .reverse();

      if (jsonBackups.length > 30) {
        for (const oldFile of jsonBackups.slice(30)) {
          await fs.unlink(path.join(BACKUPS_DIR, oldFile)).catch(() => {});
        }
      }
    }
  } catch (err) {
    // Read-only filesystem on Vercel is expected
  }

  return backupFileName;
}

export async function getRegistryData(): Promise<RegistryData> {
  // If GitHub token is provided (e.g. deployed on Vercel), fetch latest version from GitHub repo
  if (isGitHubMode()) {
    try {
      const { content } = await getFileFromGitHub("app.json");
      const parsed = JSON.parse(content);
      return RegistrySchema.parse(parsed);
    } catch (err) {
      console.warn("Failed fetching from GitHub API, checking local file fallback:", err);
    }
  }

  // Local filesystem fallback
  if (fsSync.existsSync(APP_JSON_PATH)) {
    const content = await fs.readFile(APP_JSON_PATH, "utf-8");
    const parsed = JSON.parse(content);
    return RegistrySchema.parse(parsed);
  }

  throw new Error("app.json not found in GitHub or local filesystem.");
}

export async function saveRegistryData(
  data: RegistryData,
  commitMessage: string = "feat(registry): update app.json via Registry Studio"
): Promise<void> {
  const validated = RegistrySchema.parse(data);
  validated.updatedAt = new Date().toISOString().split("T")[0];
  const formatted = JSON.stringify(validated, null, 2) + "\n";

  // If on Vercel with GitHub Token, commit directly to the repository!
  if (isGitHubMode()) {
    // 1. Commit backup snapshot to .backups/
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `.backups/app-${timestamp}.json`;
    await commitFileToGitHub(
      backupPath,
      formatted,
      `chore(backup): snapshot ${backupPath}`
    ).catch((err) => {
      console.warn("Failed to create remote backup snapshot:", err);
    });

    // 2. Commit updated app.json to GitHub main branch
    await commitFileToGitHub("app.json", formatted, commitMessage);
  }

  // Also write to local filesystem if writable (for localhost development)
  try {
    await createBackup();
    const tempPath = `${APP_JSON_PATH}.tmp.${Date.now()}`;
    await fs.writeFile(tempPath, formatted, "utf-8");
    await fs.rename(tempPath, APP_JSON_PATH);
  } catch (err) {
    // On Vercel, read-only filesystem throws here, which is completely normal since changes are already committed to GitHub!
  }
}

// --- App CRUD operations ---
export async function addApp(appData: AppItem): Promise<RegistryData> {
  const validatedApp = AppItemSchema.parse(appData);
  const registry = await getRegistryData();

  if (registry.apps.some((a) => a.id === validatedApp.id)) {
    throw new Error(`An app with ID "${validatedApp.id}" already exists.`);
  }

  registry.apps.unshift(validatedApp);
  await saveRegistryData(
    registry,
    `feat(app): add "${validatedApp.appName}" (${validatedApp.id}) to registry`
  );
  return registry;
}

export async function updateApp(id: string, appData: AppItem): Promise<RegistryData> {
  const validatedApp = AppItemSchema.parse(appData);
  const registry = await getRegistryData();

  const index = registry.apps.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error(`App with ID "${id}" not found.`);
  }

  if (id !== validatedApp.id && registry.apps.some((a) => a.id === validatedApp.id)) {
    throw new Error(`An app with ID "${validatedApp.id}" already exists.`);
  }

  registry.apps[index] = validatedApp;
  await saveRegistryData(
    registry,
    `feat(app): update "${validatedApp.appName}" (${validatedApp.id})`
  );
  return registry;
}

export async function deleteApp(id: string): Promise<RegistryData> {
  const registry = await getRegistryData();
  const target = registry.apps.find((a) => a.id === id);
  const initialLength = registry.apps.length;
  registry.apps = registry.apps.filter((a) => a.id !== id);

  if (registry.apps.length === initialLength) {
    throw new Error(`App with ID "${id}" not found.`);
  }

  await saveRegistryData(
    registry,
    `feat(app): remove "${target?.appName || id}" from registry`
  );
  return registry;
}

export async function reorderApps(apps: AppItem[]): Promise<RegistryData> {
  const registry = await getRegistryData();
  if (apps.length !== registry.apps.length) {
    throw new Error("Reorder payload count mismatch.");
  }
  registry.apps = apps;
  await saveRegistryData(registry, `chore(registry): reorder mobile applications`);
  return registry;
}

// --- Website CRUD operations ---
export async function addWebsite(webData: WebsiteItem): Promise<RegistryData> {
  const validatedWeb = WebsiteItemSchema.parse(webData);
  const registry = await getRegistryData();

  if (registry.websites.some((w) => w.id === validatedWeb.id)) {
    throw new Error(`A website with ID "${validatedWeb.id}" already exists.`);
  }

  registry.websites.unshift(validatedWeb);
  await saveRegistryData(
    registry,
    `feat(website): add "${validatedWeb.name}" (${validatedWeb.id}) to registry`
  );
  return registry;
}

export async function updateWebsite(id: string, webData: WebsiteItem): Promise<RegistryData> {
  const validatedWeb = WebsiteItemSchema.parse(webData);
  const registry = await getRegistryData();

  const index = registry.websites.findIndex((w) => w.id === id);
  if (index === -1) {
    throw new Error(`Website with ID "${id}" not found.`);
  }

  if (id !== validatedWeb.id && registry.websites.some((w) => w.id === validatedWeb.id)) {
    throw new Error(`A website with ID "${validatedWeb.id}" already exists.`);
  }

  registry.websites[index] = validatedWeb;
  await saveRegistryData(
    registry,
    `feat(website): update "${validatedWeb.name}" (${validatedWeb.id})`
  );
  return registry;
}

export async function deleteWebsite(id: string): Promise<RegistryData> {
  const registry = await getRegistryData();
  const target = registry.websites.find((w) => w.id === id);
  const initialLength = registry.websites.length;
  registry.websites = registry.websites.filter((w) => w.id !== id);

  if (registry.websites.length === initialLength) {
    throw new Error(`Website with ID "${id}" not found.`);
  }

  await saveRegistryData(
    registry,
    `feat(website): remove "${target?.name || id}" from registry`
  );
  return registry;
}

export async function reorderWebsites(websites: WebsiteItem[]): Promise<RegistryData> {
  const registry = await getRegistryData();
  if (websites.length !== registry.websites.length) {
    throw new Error("Reorder payload count mismatch.");
  }
  registry.websites = websites;
  await saveRegistryData(registry, `chore(registry): reorder website platforms`);
  return registry;
}

// --- Backups operations ---
export interface BackupFileItem {
  filename: string;
  size: number;
  createdAt: string;
}

export async function listBackups(): Promise<BackupFileItem[]> {
  const results: BackupFileItem[] = [];

  // 1. Try reading local directory
  try {
    await ensureBackupDir();
    if (fsSync.existsSync(BACKUPS_DIR)) {
      const files = await fs.readdir(BACKUPS_DIR);
      const jsonBackups = files.filter((f) => f.startsWith("app-") && f.endsWith(".json"));
      for (const filename of jsonBackups) {
        const stat = await fs.stat(path.join(BACKUPS_DIR, filename));
        results.push({
          filename,
          size: stat.size,
          createdAt: stat.mtime.toISOString(),
        });
      }
    }
  } catch (err) {}

  // 2. If GitHub mode and local backups are empty, list from GitHub repository contents
  if (results.length === 0 && isGitHubMode()) {
    try {
      const { getGitHubConfig } = await import("./github");
      const { owner, repo, branch } = getGitHubConfig();
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/.backups?ref=${branch}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "Samyukt-Registry-Studio",
          },
          cache: "no-store",
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item.name.endsWith(".json")) {
              results.push({
                filename: item.name,
                size: item.size || 0,
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    } catch {}
  }

  return results.sort((a, b) => b.filename.localeCompare(a.filename));
}

export async function restoreBackup(filename: string): Promise<RegistryData> {
  const sanitized = path.basename(filename);

  // 1. Check local backup
  const backupPath = path.join(BACKUPS_DIR, sanitized);
  if (fsSync.existsSync(backupPath)) {
    const content = await fs.readFile(backupPath, "utf-8");
    const parsed = JSON.parse(content);
    const validated = RegistrySchema.parse(parsed);
    await saveRegistryData(validated, `chore(registry): restore from backup ${sanitized}`);
    return validated;
  }

  // 2. If not local, try fetching from GitHub .backups/
  if (isGitHubMode()) {
    const { content } = await getFileFromGitHub(`.backups/${sanitized}`);
    const parsed = JSON.parse(content);
    const validated = RegistrySchema.parse(parsed);
    await saveRegistryData(validated, `chore(registry): restore from backup ${sanitized}`);
    return validated;
  }

  throw new Error(`Backup file ${sanitized} not found.`);
}
