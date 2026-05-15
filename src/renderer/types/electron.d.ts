import { AppData, AppSettings } from "../../shared/types";

export interface ElectronAPI {
  getAppData: () => Promise<AppData>;
  saveAppData: (data: AppData) => Promise<void>;
  getDataPath: () => Promise<string>;
  minimize: () => void;
  close: () => void;
  setAlwaysOnTop: (flag: boolean) => void;
  setOpacity: (opacity: number) => void;
  getBounds: () => Promise<{ x: number; y: number; width: number; height: number }>;
  showNotification: (title: string, body: string, taskId?: string) => void;
  setAutostart: (enabled: boolean) => void;
  getAutostart: () => Promise<boolean>;
  quitApp: () => void;
  updateTrayTooltip: (text: string) => void;
  setStartupHide: (hide: boolean) => void;
  onSettingsChanged: (callback: (settings: AppSettings) => void) => void;
  onResetToday: (callback: () => void) => void;
  onFocusAddInput: (callback: () => void) => void;
  onOpenSettings: (callback: () => void) => void;
  onCheckReminders: (callback: () => void) => void;
  onHighlightTask: (callback: (taskId: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
