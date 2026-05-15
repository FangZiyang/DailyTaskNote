import { useEffect, useRef } from "react";
import { getTodayStr } from "../utils/dateUtils";

export function useDailyReset(onReset: () => void) {
  const lastDateRef = useRef(getTodayStr());

  useEffect(() => {
    // Check for date change every minute
    const interval = setInterval(() => {
      const today = getTodayStr();
      if (today !== lastDateRef.current) {
        lastDateRef.current = today;
        onReset();
      }
    }, 60000);

    // Listen for manual reset from tray
    window.electronAPI.onResetToday(() => {
      onReset();
    });

    return () => clearInterval(interval);
  }, [onReset]);
}
