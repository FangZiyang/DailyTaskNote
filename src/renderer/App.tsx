import { useState, useEffect, useRef, useCallback } from "react";
import { FilterType, ViewMode, AppData } from "../shared/types";
import { getCachedData } from "./services/storageService";
import { useTasks } from "./hooks/useTasks";
import { useSettings } from "./hooks/useSettings";
import { useWindowState } from "./hooks/useWindowState";
import { useDailyReset } from "./hooks/useDailyReset";
import { useReminders } from "./hooks/useReminders";
import { Header } from "./components/Header";
import { ProgressBar } from "./components/ProgressBar";
import { FilterBar } from "./components/FilterBar";
import { TaskList } from "./components/TaskList";
import { QuickAdd, QuickAddHandle } from "./components/QuickAdd";
import { SettingsPanel } from "./components/SettingsPanel";
import { ManagementView } from "./components/ManagementView";
import { HistoryView } from "./components/HistoryView";

export default function App() {
  const { settings, setSettings } = useSettings();
  const taskHook = useTasks();
  const { handleMinimize, handleClose } = useWindowState();
  const quickAddRef = useRef<QuickAddHandle>(null);

  const [view, setView] = useState<ViewMode>("main");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);

  // Daily reset
  const handleReset = useCallback(() => {
    taskHook.resetToday();
  }, [taskHook]);
  useDailyReset(handleReset);

  // Reminders
  const handleReminderUpdate = useCallback(
    (updatedTasks: typeof taskHook.tasks) => {
      const cached = getCachedData();
      if (cached) {
        window.electronAPI.saveAppData({ ...cached, tasks: updatedTasks });
      }
    },
    []
  );
  useReminders(taskHook.tasks, settings, handleReminderUpdate);

  // Keyboard shortcuts
  useEffect(() => {
    const handlers: Record<string, () => void> = {
      "open-settings": () => setView("settings"),
      "focus-add-input": () => quickAddRef.current?.focus(),
      "focus-search": () => document.getElementById("search-input")?.focus(),
      "toggle-completed": () =>
        setSettings((s) => ({ ...s, showCompletedTasks: !s.showCompletedTasks })),
      "close-panel": () => {
        if (view !== "main") setView("main");
      },
    };

    const listeners = Object.entries(handlers).map(([event, handler]) => {
      const listener = () => handler();
      document.addEventListener(event, listener);
      return { event, listener };
    });

    return () =>
      listeners.forEach(({ event, listener }) =>
        document.removeEventListener(event, listener)
      );
  }, [view, setSettings]);

  // Highlight task from notification
  useEffect(() => {
    window.electronAPI.onHighlightTask((taskId) => {
      setHighlightTaskId(taskId);
      setTimeout(() => setHighlightTaskId(null), 3000);
    });
  }, []);

  // IPC: open settings from tray
  useEffect(() => {
    window.electronAPI.onOpenSettings(() => setView("settings"));
  }, []);

  const filteredTasks = taskHook.getFilteredTasks(
    filter,
    searchQuery
  );

  const visibleTasks = settings.showCompletedTasks
    ? filteredTasks
    : filteredTasks.filter((t) => !t.completed);

  const activeTasks = taskHook.tasks.filter((t) => !t.archived);
  const completedCount = activeTasks.filter((t) => t.completed).length;

  const handleImportData = async (data: AppData) => {
    await taskHook.importTasks(data.tasks, data.history, data.categories);
    if (data.settings) {
      setSettings(() => data.settings);
    }
  };

  const handleResetAll = async () => {
    const defaultData: AppData = {
      version: 1,
      tasks: [],
      settings: { ...settings },
      history: [],
      categories: [],
    };
    await taskHook.replaceAll(defaultData.tasks, defaultData.history, defaultData.categories);
  };

  // Apply transparency readability class
  const bgClass =
    settings.transparencyReadability && settings.opacity < 0.8
      ? "backdrop-blur-sm bg-white/90 dark:bg-gray-900/90"
      : "bg-white dark:bg-gray-900";

  return (
    <div
      className={`h-screen flex flex-col rounded-xl overflow-hidden shadow-2xl border border-gray-200/20 dark:border-gray-700/30 ${bgClass}`}
      style={{ fontSize: "var(--font-size-base, 0.875rem)" }}
    >
      <Header
        compactMode={settings.compactMode}
        completedCount={completedCount}
        totalCount={activeTasks.length}
        onToggleCompact={() => setSettings((s) => ({ ...s, compactMode: !s.compactMode }))}
        onOpenSettings={() => setView("settings")}
        onOpenManagement={() => setView("management")}
        onMinimize={handleMinimize}
        onClose={handleClose}
      />

      <ProgressBar
        completed={completedCount}
        total={activeTasks.length}
        className="px-3"
      />

      <FilterBar
        activeFilter={filter}
        searchQuery={searchQuery}
        showCompleted={settings.showCompletedTasks}
        onFilterChange={setFilter}
        onSearchChange={setSearchQuery}
        onToggleCompleted={() =>
          setSettings((s) => ({ ...s, showCompletedTasks: !s.showCompletedTasks }))
        }
        onOpenHistory={() => setView("history")}
      />

      <TaskList
        tasks={visibleTasks}
        compactMode={settings.compactMode}
        highlightTaskId={highlightTaskId}
        onToggle={taskHook.toggle}
        onUpdateTitle={taskHook.updateTitle}
        onUpdateTask={taskHook.updateTask}
        onDelete={taskHook.remove}
        onArchive={taskHook.archive}
        onReorder={taskHook.reorder}
      />

      <QuickAdd
        ref={quickAddRef}
        onAdd={(title) => taskHook.addTask(title)}
      />

      {/* Overlays */}
      {view === "settings" && (
        <SettingsPanel
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setView("main")}
          onImportData={handleImportData}
          onResetAll={handleResetAll}
        />
      )}

      {view === "management" && (
        <ManagementView
          tasks={taskHook.tasks}
          history={taskHook.history}
          categories={taskHook.categories}
          onClose={() => setView("main")}
          onUpdateTask={taskHook.updateTask}
          onDelete={taskHook.remove}
          onArchive={taskHook.archive}
          onUnarchive={taskHook.unarchive}
          onBatchDeleteCompleted={taskHook.batchDeleteCompleted}
          onBatchArchiveCompleted={taskHook.batchArchiveCompleted}
          onAddCategory={taskHook.addCategory}
          onRemoveCategory={taskHook.removeCategory}
        />
      )}

      {view === "history" && (
        <HistoryView
          tasks={taskHook.tasks}
          history={taskHook.history}
          onClose={() => setView("main")}
        />
      )}
    </div>
  );
}
