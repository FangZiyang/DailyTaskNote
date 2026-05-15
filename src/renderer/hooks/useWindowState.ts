import { useEffect, useCallback } from "react";

export function useWindowState() {
  const handleMinimize = useCallback(() => {
    window.electronAPI.minimize();
  }, []);

  const handleClose = useCallback(() => {
    window.electronAPI.close();
  }, []);

  const handleQuit = useCallback(() => {
    window.electronAPI.quitApp();
  }, []);

  useEffect(() => {
    // Prevent default close - hide to tray instead
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+, opens settings
      if (e.ctrlKey && e.key === ",") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("open-settings"));
      }
      // Ctrl+N new task
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("focus-add-input"));
      }
      // Ctrl+F search
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("focus-search"));
      }
      // Ctrl+H toggle completed
      if (e.ctrlKey && e.key === "h") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("toggle-completed"));
      }
      // Esc close panel
      if (e.key === "Escape") {
        document.dispatchEvent(new CustomEvent("close-panel"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { handleMinimize, handleClose, handleQuit };
}
