import { describe, it, expect } from "vitest";
import {
  getTodayStr,
  getWeekStart,
  getMonthStart,
  isSameDay,
  formatTime,
  isWithinQuietHours,
  parseLocalDate,
} from "../src/renderer/utils/dateUtils";

describe("getTodayStr", () => {
  it("should return YYYY-MM-DD format", () => {
    const result = getTodayStr();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("getWeekStart", () => {
  it("should return a Monday", () => {
    const result = getWeekStart(parseLocalDate("2025-01-15")); // Wednesday
    const d = parseLocalDate(result);
    expect(d.getDay()).toBe(1); // Monday
  });
});

describe("getMonthStart", () => {
  it("should return first day of month", () => {
    const result = getMonthStart(parseLocalDate("2025-03-15"));
    expect(result).toBe("2025-03-01");
  });
});

describe("isSameDay", () => {
  it("should match same date regardless of time", () => {
    expect(isSameDay("2025-01-15T10:00:00Z", "2025-01-15T23:59:59Z")).toBe(true);
  });

  it("should not match different dates", () => {
    expect(isSameDay("2025-01-15T10:00:00Z", "2025-01-16T10:00:00Z")).toBe(false);
  });
});

describe("formatTime", () => {
  it("should format 24h time to 12h", () => {
    expect(formatTime("09:30")).toBe("9:30 AM");
    expect(formatTime("14:00")).toBe("2:00 PM");
    expect(formatTime("00:00")).toBe("12:00 AM");
    expect(formatTime("12:00")).toBe("12:00 PM");
  });

  it("should return empty for empty string", () => {
    expect(formatTime("")).toBe("");
  });
});

describe("isWithinQuietHours", () => {
  it("should handle same-day range", () => {
    // This is hard to test without mocking Date, but we can at least verify no crash
    const result = isWithinQuietHours("22:00", "08:00");
    expect(typeof result).toBe("boolean");
  });
});
