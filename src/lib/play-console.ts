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
  { name: "Luna (Period Tracker)", pkg: "com.luna.application" },
  { name: "VideoDownloader (SaveIt)", pkg: "app.mediaurl.applicaiton" },
];

export const PLAY_STORE_DEFAULT_ICONS: Record<string, string> = {
  "com.arrowz.app": "https://lh3.googleusercontent.com/ipAFngoNLpMAk31CYzbSY_QAXQHkSKYP6C9HA2lOBbW3OmGRpCqaWhM3tNdj4i4pW_NddjLeA6iItv2M_7ysoA",
  "com.snapdocs.app": "https://lh3.googleusercontent.com/ecsB75kg9fAOXst0P76UsVZnZ9-OLz0UE0cjZ1rnoHdsK3AlT84a7qMgKW6qzMv-EtXOl8FkleBNZMnRfPPA",
  "com.noctune.music": "https://lh3.googleusercontent.com/98V7RUO7vxpvbB4SBDce4rjHT-Csj7QIjkJw8fOYqgc_TvEbCtgQ7pa9itFb0IsglIEscWX0d9N0BG2brH2z5w",
  "com.gymbuddy.application": "https://lh3.googleusercontent.com/DlbCa_tBQ8nJKaNVT6s-Pioz0bojQJK5jr7HQip1EPufK-tYEG0dtdzHsTEUHCQsjg-fHivbOquy_nVO25Heejg",
  "com.divinegeeta.app": "https://lh3.googleusercontent.com/ojtX1PCxe_T4yQBdvrjvirKcZKe1AUmZ48jYFTFrtI1LSQ7IVhMfbxZz2FpPOXegWcixNeBcXTdmzzoiLpJY",
  "com.vaultx.vault_x": "https://lh3.googleusercontent.com/5c7TtieiKCLLr47ESQwl6zitDWssUGxvds7wrmVBptP219iBzOaN8DZaFJmPkD70-TjIqO_3kgmIJHmEl0-KUjc",
  "com.taskmitra.application": "https://lh3.googleusercontent.com/DR_kHsnaUh0mfiYYz4bD1VTIB_jhy6BnHr8hdnttGWbt85KZMsPTOqRnJpGx0U8UnncCEgDdugASyr8iiI4i-A",
  "com.samyukt.doit": "https://lh3.googleusercontent.com/UFh0Udg7dJVaR0cLMx7et8s6dopqHPUo5GWzDJ_i0ZiMuwK4K_8ShETgrKeAJKhH4DhegoF8ksP7K8GXMmmQ-Ys",
  "com.playpocket.game": "https://lh3.googleusercontent.com/hr-R4kMjroBUd654eLBGL2LUTHRy_GOLOBz02hxlB8em6jEUaOCxHm1zS7sjsGix53R7k4pK6iKynBOwY0th9Q",
  "com.samyukt.dustline": "https://lh3.googleusercontent.com/jXrsxNIZ_oL0SOPci_A935jk82BSvtfN-hCO0IZpHNT9OLri3ApjKRO-2JRWiZcGhcoPHszZ3en2IEuFfufUhnk",
  "com.equiptrack.com": "https://lh3.googleusercontent.com/R_gHR-K8JtE3IOgJyfnDMp-hnBPP33k5yNBE0m_uEN_9XKsMuimUqlxdBEzrA3rJd2hdBacUbgLvpAs0jNq5",
  "com.finwise.appilcation": "https://lh3.googleusercontent.com/DVrOjdaesO1rF_DMqEXnSgEYfeoWGQo3kAW2diAHdaKXfc1mCi-iRv3DCVgz36AeL_4ELlVWxkd45dt39gkm9Q",
  "app.habitly": "https://lh3.googleusercontent.com/kW4vtkRh7uDYqDpDj9CmMDFRj8DmqajriXkhn0cfFk2cA5LVYwzICGJpRBeT1la4lHBSoP4afISsJCsg4Je0JAI",
  "com.samyukt.jamrush": "https://lh3.googleusercontent.com/UssdbSPZO2FcY_QxWQfb2cZyA_UrkK5jEmrZWnRyCJwtixI8l0WA4ApQ4SG7swE-StMuS-9_IGfen8QNn-5g0A",
  "com.samyukt.kairos": "https://lh3.googleusercontent.com/P39MfcCjSAUkqDVoH2bJ9qX7DPl2eZXWX14zyQ4PTLxWnyE-0E9do9RxRvX14_ueFqI0mTOFSbsdxdv33dCHKA",
  "com.samyukt.mazequest": "https://lh3.googleusercontent.com/YE6Z_w0hNw6Gb6j-EW4e8yC0xbe6YdaRKrDImWWb-EpY-AQGFAn6vIsr2lpuUTyijGEJZAiQbukaAfNjNE29oHQ",
  "com.luna.application": "https://lh3.googleusercontent.com/ipFBSHcYy8hFGqAD9qqqE9RxbpQ5DBAnIIqzO4uf5u86XoULu2EVDMYQb-HsZDjygd9IfrRvCI-4AaZ0W5G27g",
  "app.mediaurl.applicaiton": "https://lh3.googleusercontent.com/caJ5rxQWCGJVchX8fEmNGt4K_3r9vvI47YP1el5d7IN4pB1vfFOvdjJNMBsRFt7m1XRLJopIm9mbDd1QwuMQjnY",
};
