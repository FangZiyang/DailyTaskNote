import { contextBridge, ipcRenderer } from "electron";
import { AppData, AppSettings } from "../shared/types";

contextBridge.exposeInMainWorld("electronAPI", {
  // Data
  getAppData: (): Promise<AppData> => ipcRenderer.invoke("get-app-data"),
  saveAppData: (data: AppData): Promise<void> => ipcRenderer.invoke("save-app-data", data),
  getDataPath: (): Promise<string> => ipcRenderer.invoke("get-data-path"),

  // Window
  minimize: () => ipcRenderer.send("window-minimize"),
  close: () => ipcRenderer.send("window-close"),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.send("window-set-always-on-top", flag),
  setOpacity: (opacity: number) => ipcRenderer.send("window-set-opacity", opacity),
  getBounds: (): Promise<{ x: number; y: number; width: number; height: number }> =>
    ipcRenderer.invoke("window-get-bounds"),

  // Notifications
  showNotification: (title: string, body: string, taskId?: string) =>
    ipcRenderer.send("show-notification", title, body, taskId),

  // Autostart
  setAutostart: (enabled: boolean) => ipcRenderer.send("set-autostart", enabled),
  getAutostart: (): Promise<boolean> => ipcRenderer.invoke("get-autostart"),

  // Tray
  quitApp: () => ipcRenderer.send("quit-app"),
  updateTrayTooltip: (text: string) => ipcRenderer.send("tray-update-tooltip", text),
  setStartupHide: (hide: boolean) => ipcRenderer.send("set-startup-hide", hide),

  // Events from main
  onSettingsChanged: (callback: (settings: AppSettings) => void) => {
    ipcRenderer.on("settings-changed", (_e, settings) => callback(settings));
  },
  onResetToday: (callback: () => void) => {
    ipcRenderer.on("reset-today", () => callback());
  },
  onFocusAddInput: (callback: () => void) => {
    ipcRenderer.on("focus-add-input", () => callback());
  },
  onOpenSettings: (callback: () => void) => {
    ipcRenderer.on("open-settings", () => callback());
  },
  onCheckReminders: (callback: () => void) => {
    ipcRenderer.on("check-reminders", () => callback());
  },
  onHighlightTask: (callback: (taskId: string) => void) => {
    ipcRenderer.on("highlight-task", (_e, taskId) => callback(taskId));
  },
});
