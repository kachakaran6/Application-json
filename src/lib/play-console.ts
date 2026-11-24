export interface TrackReleaseInfo {
  name?: string;
  versionCodes?: string[];
  status?: string;
  releaseNotes?: Array<{ language?: string; text?: string }>;
  userFraction?: number;
}

export interface AppPlayStatus {
  packageName: string;
  catalogName: string;
  localizedTitle?: string;
  iconUrl?: string;
  playStoreUrl?: string;
  status: "success" | "permission_denied" | "not_found" | "error";
  errorMessage?: string;
  production?: TrackReleaseInfo;
  alpha?: TrackReleaseInfo;
  internal?: TrackReleaseInfo;
  beta?: TrackReleaseInfo;
  isLiveProduction: boolean;
  isClosedTesting: boolean;
  isInternalDraft: boolean;
}

export interface PlayConsoleResponse {
  success: boolean;
  timestamp: string;
  cached: boolean;
  cacheExpiresInSeconds: number;
  serviceAccount: string;
  notice?: string;
  isBaselineFallback?: boolean;
  metrics: {
    total: number;
    liveProduction: number;
    closedTesting: number;
    internalDraft: number;
  };
  apps: AppPlayStatus[];
}

// 18 Apps Catalog to track
export const MONITORED_CATALOG = [
  { name: "ArrowZ", pkg: "com.arrowz.app" },
  { name: "SnapDocs", pkg: "com.snapdocs.app" },
  { name: "Noctune", pkg: "com.noctune.music" },
  { name: "GymBuddy", pkg: "com.gymbuddy.application" },
  { name: "Bhagwad Gita (Divine Geeta)", pkg: "com.divinegeeta.app" },
  { name: "VaultX", pkg: "com.vaultx.vault_x" },
  { name: "TaskMitra (OrbitTodo)", pkg: "com.taskmitra.application" },
  { name: "DoIt Mobile", pkg: "com.samyukt.doit" },
  { name: "MiniGames (PlayPocket)", pkg: "com.playpocket.game" },
  { name: "Dustline Petrol Bloom", pkg: "com.samyukt.dustline" },
  { name: "EquipTrack", pkg: "com.equiptrack.com" },
  { name: "Finwise", pkg: "com.finwise.appilcation" },
  { name: "Habitly", pkg: "app.habitly" },
  { name: "JamRush", pkg: "com.samyukt.jamrush" },
  { name: "Kairos", pkg: "com.samyukt.kairos" },
  { name: "MazeQuest", pkg: "com.samyukt.mazequest" },
  { name: "VideoDownloader (SaveIt)", pkg: "app.mediaurl.applicaiton" },
];

export const PLAY_STORE_DEFAULT_ICONS: Record<string, string> = {
  "com.arrowz.app": "/images/arrowz.png",
  "com.snapdocs.app": "/images/snapdocs.png",
  "com.noctune.music": "/images/noctune.png",
  "com.gymbuddy.application": "/images/gymbuddy.png",
  "com.divinegeeta.app": "/images/divine-geeta.png",
  "com.vaultx.vault_x": "/images/vaultx.png",
  "com.taskmitra.application": "/images/taskmitra.png",
  "com.samyukt.doit": "/images/doit.png",
  "com.playpocket.game": "/images/playpocket.png",
  "com.samyukt.dustline": "/images/dustline.png",
  "com.equiptrack.com": "/images/equiptrack.png",
  "com.finwise.appilcation": "/images/finwise.png",
  "app.habitly": "/images/habitly.png",
  "com.samyukt.jamrush": "/images/jamrush.png",
  "com.samyukt.kairos": "/images/kairos.png",
  "com.samyukt.mazequest": "/images/mazequest.png",
  "app.mediaurl.applicaiton": "/images/saveit.png",
};
