import { useState, useEffect } from "react";
import { AppSettings, AppData, DEFAULT_SETTINGS } from "../../shared/types";
import { exportData, importData } from "../services/importExportService";
import { getDataPath, getCachedData } from "../services/storageService";

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  onClose: () => void;
  onImportData: (data: AppData) => void;
  onResetAll: () => void;
}

export function SettingsPanel({
  settings,
  onUpdateSettings,
  onClose,
  onImportData,
  onResetAll,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState("window");
  const [dataPath, setDataPath] = useState("");
  const [autostart, setAutostart] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    getDataPath().then(setDataPath);
    window.electronAPI.getAutostart().then(setAutostart);
  }, []);

  const tabs = [
    { id: "window", label: "Window" },
    { id: "task", label: "Task" },
    { id: "reminder", label: "Reminder" },
    { id: "appearance", label: "Appearance" },
    { id: "data", label: "Data" },
    { id: "about", label: "About" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-current text-current"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              style={activeTab === tab.id ? { color: "var(--accent-color, #6366f1)" } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "window" && (
            <>
              <SettingRow label="Opacity">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={Math.round(settings.opacity * 100)}
                    onChange={(e) =>
                      onUpdateSettings((s) => ({ ...s, opacity: parseInt(e.target.value) / 100 }))
                    }
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="text-xs w-8 text-right">{Math.round(settings.opacity * 100)}%</span>
                </div>
              </SettingRow>
              <SettingRow label="Always on Top">
                <Toggle
                  value={settings.alwaysOnTop}
                  onChange={(v) => onUpdateSettings((s) => ({ ...s, alwaysOnTop: v }))}
                />
              </SettingRow>
              <SettingRow label="Default Compact Mode">
                <Toggle
                  value={settings.compactMode}
                  onChange={(v) => onUpdateSettings((s) => ({ ...s, compactMode: v }))}
                />
              </SettingRow>
              <SettingRow label="Remember Window Position">
                <Toggle
                  value={settings.rememberPosition}
                  onChange={(v) => onUpdateSettings((s) => ({ ...s, rememberPosition: v }))}
                />
              </SettingRow>
              <SettingRow label="Start Hidden to Tray">
                <Toggle
                  value={settings.startHiddenToTray}
                  onChange={(v) => {
                    onUpdateSettings((s) => ({ ...s, startHiddenToTray: v }));
                    window.electronAPI.setStartupHide(v);
                  }}
                />
              </SettingRow>
              <SettingRow label="Start with Windows">
                <Toggle
                  value={autostart}
                  onChange={(v) => {
                    setAutostart(v);
                    window.electronAPI.setAutostart(v);
                  }}
                />
              </SettingRow>
            </>
          )}

          {activeTab === "task" && (
            <>
              <SettingRow label="Default Task Type">
                <select
                  value={settings.defaultTaskType}
                  onChange={(e) =>
                    onUpdateSettings((s) => ({
                      ...s,
                      defaultTaskType: e.target.value as AppSettings["defaultTaskType"],
                    }))
                  }
                  className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-sm outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="one-time">One-time</option>
                </select>
              </SettingRow>
              <SettingRow label="Default Priority">
                <select
                  value={settings.defaultPriority}
                  onChange={(e) =>
                    onUpdateSettings((s) => ({
                      ...s,
                      defaultPriority: e.target.value as AppSettings["defaultPriority"],
                    }))
                  }
                  className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-sm outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </SettingRow>
              <SettingRow label="Show Completed Tasks">
                <Toggle
                  value={settings.showCompletedTasks}
                  onChange={(v) => onUpdateSettings((s) => ({ ...s, showCompletedTasks: v }))}
                />
              </SettingRow>
              <SettingRow label="Auto-archive Completed One-time Tasks">
                <Toggle
                  value={settings.autoArchiveOneTime}
                  onChange={(v) => onUpdateSettings((s) => ({ ...s, autoArchiveOneTime: v }))}
                />
              </SettingRow>
            </>
          )}

          {activeTab === "reminder" && (
            <>
              <SettingRow label="Enable Notifications">
                <Toggle
                  value={settings.notificationsEnabled}
                  onChange={(v) => onUpdateSettings((s) => ({ ...s, notificationsEnabled: v }))}
                />
              </SettingRow>
              <SettingRow label="Quiet Hours">
                <Toggle
                  value={settings.quietHoursEnabled}
                  onChange={(v) => onUpdateSettings((s) => ({ ...s, quietHoursEnabled: v }))}
                />
              </SettingRow>
              {settings.quietHoursEnabled && (
                <>
                  <SettingRow label="Quiet Start">
                    <input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) =>
                        onUpdateSettings((s) => ({ ...s, quietHoursStart: e.target.value }))
                      }
                      className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-sm outline-none"
                    />
                  </SettingRow>
                  <SettingRow label="Quiet End">
                    <input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) =>
                        onUpdateSettings((s) => ({ ...s, quietHoursEnd: e.target.value }))
                      }
                      className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-sm outline-none"
                    />
                  </SettingRow>
                </>
              )}
              <SettingRow label="Check Interval (seconds)">
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={settings.reminderCheckInterval}
                  onChange={(e) =>
                    onUpdateSettings((s) => ({
                      ...s,
                      reminderCheckInterval: parseInt(e.target.value) || 60,
                    }))
                  }
                  className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-sm outline-none w-20"
                />
              </SettingRow>
            </>
          )}

          {activeTab === "appearance" && (
            <>
              <SettingRow label="Theme">
                <div className="flex gap-1">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => onUpdateSettings((s) => ({ ...s, theme: t }))}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        settings.theme === t
                          ? "text-white"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                      style={settings.theme === t ? { backgroundColor: "var(--accent-color, #6366f1)" } : {}}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Font Size">
                <div className="flex gap-1">
                  {(["small", "medium", "large"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onUpdateSettings((prev) => ({ ...prev, fontSize: s }))}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        settings.fontSize === s
                          ? "text-white"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                      style={settings.fontSize === s ? { backgroundColor: "var(--accent-color, #6366f1)" } : {}}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Accent Color">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => onUpdateSettings((s) => ({ ...s, accentColor: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </SettingRow>
              <SettingRow label="Transparency Readability">
                <Toggle
                  value={settings.transparencyReadability}
                  onChange={(v) => onUpdateSettings((s) => ({ ...s, transparencyReadability: v }))}
                />
              </SettingRow>
            </>
          )}

          {activeTab === "data" && (
            <>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const cached = getCachedData();
                    if (cached) exportData(cached);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left"
                >
                  Export Data (JSON)
                </button>
                <button
                  onClick={async () => {
                    const data = await importData();
                    if (data) onImportData(data);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left"
                >
                  Import Data (JSON)
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                {showResetConfirm ? (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                      This will delete ALL tasks, history, and settings. This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onResetAll();
                          setShowResetConfirm(false);
                        }}
                        className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Reset Everything
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1.5 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-left"
                  >
                    Reset All Data
                  </button>
                )}
              </div>
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-xs opacity-60 mb-1">Data Location:</p>
                <p className="text-xs font-mono break-all">{dataPath}</p>
              </div>
            </>
          )}

          {activeTab === "about" && (
            <div className="text-center py-4 space-y-3">
              <div
                className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: "var(--accent-color, #6366f1)" }}
              >
                D
              </div>
              <div>
                <h3 className="font-semibold">DailyTaskBar</h3>
                <p className="text-xs opacity-60">Version 1.0.0</p>
              </div>
              <p className="text-sm opacity-70 max-w-xs mx-auto">
                A lightweight desktop task bar for managing your daily routines and habits.
              </p>
              <div className="text-xs opacity-50 space-y-1">
                <p>Built with Electron + React + TypeScript</p>
                <p className="font-mono text-[10px] break-all">{dataPath}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors ${
        value ? "" : "bg-gray-300 dark:bg-gray-600"
      }`}
      style={value ? { backgroundColor: "var(--accent-color, #6366f1)" } : {}}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          value ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
