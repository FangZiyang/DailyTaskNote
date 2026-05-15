import { useState, useEffect, useCallback } from "react";
import { AppSettings, DEFAULT_SETTINGS } from "../../shared/types";
import { loadAppData, saveAppData, getCachedData } from "../services/storageService";

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadAppData().then((data) => {
      setSettingsState(data.settings);
      applyTheme(data.settings.theme);
      applyFontSize(data.settings.fontSize);
      applyAccentColor(data.settings.accentColor);
    });

    // Listen for settings changes from main process (tray menu)
    window.electronAPI.onSettingsChanged((newSettings) => {
      setSettingsState(newSettings);
      applyTheme(newSettings.theme);
      applyFontSize(newSettings.fontSize);
      applyAccentColor(newSettings.accentColor);
    });
  }, []);

  const setSettings = useCallback(
    async (updater: (prev: AppSettings) => AppSettings) => {
      setSettingsState((prev) => {
        const next = updater(prev);
        applyTheme(next.theme);
        applyFontSize(next.fontSize);
        applyAccentColor(next.accentColor);
        applyOpacity(next.opacity);
        applyAlwaysOnTop(next.alwaysOnTop);

        // Persist
        const cached = getCachedData();
        if (cached) {
          saveAppData({ ...cached, settings: next }).catch(console.error);
        }
        return next;
      });
    },
    []
  );

  return { settings, setSettings };
}

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(prefersDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
}

function applyFontSize(size: "small" | "medium" | "large") {
  const root = document.documentElement;
  root.style.setProperty(
    "--font-size-base",
    size === "small" ? "0.75rem" : size === "large" ? "1rem" : "0.875rem"
  );
}

function applyAccentColor(color: string) {
  document.documentElement.style.setProperty("--accent-color", color);
}

function applyOpacity(opacity: number) {
  window.electronAPI.setOpacity(opacity);
}

function applyAlwaysOnTop(flag: boolean) {
  window.electronAPI.setAlwaysOnTop(flag);
}
