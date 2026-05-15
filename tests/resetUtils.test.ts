import { describe, it, expect } from "vitest";
import { shouldResetTask, resetTask, resetTasks } from "../src/renderer/utils/resetUtils";
import { Task } from "../src/shared/types";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "test-1",
    title: "Test Task",
    completed: false,
    type: "daily",
    priority: "medium",
    reminderEnabled: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    order: 0,
    archived: false,
    ...overrides,
  };
}

describe("shouldResetTask", () => {
  it("should reset daily task if lastResetDate is not today", () => {
    const task = makeTask({ lastResetDate: "2025-01-01" });
    expect(shouldResetTask(task, "2025-01-02")).toBe(true);
  });

  it("should not reset daily task if lastResetDate is today", () => {
    const task = makeTask({ lastResetDate: "2025-01-02" });
    expect(shouldResetTask(task, "2025-01-02")).toBe(false);
  });

  it("should not reset one-time task", () => {
    const task = makeTask({ type: "one-time", lastResetDate: "2025-01-01" });
    expect(shouldResetTask(task, "2025-01-02")).toBe(false);
  });

  it("should not reset archived task", () => {
    const task = makeTask({ archived: true, lastResetDate: "2025-01-01" });
    expect(shouldResetTask(task, "2025-01-02")).toBe(false);
  });

  it("should reset weekly task when week changes", () => {
    // Monday Jan 6 2025 to Monday Jan 13 2025
    const task = makeTask({ type: "weekly", lastResetDate: "2025-01-06" });
    expect(shouldResetTask(task, "2025-01-13")).toBe(true);
  });

  it("should not reset weekly task within same week", () => {
    const task = makeTask({ type: "weekly", lastResetDate: "2025-01-06" });
    expect(shouldResetTask(task, "2025-01-08")).toBe(false);
  });

  it("should reset monthly task when month changes", () => {
    const task = makeTask({ type: "monthly", lastResetDate: "2025-01-15" });
    expect(shouldResetTask(task, "2025-02-01")).toBe(true);
  });

  it("should not reset monthly task within same month", () => {
    const task = makeTask({ type: "monthly", lastResetDate: "2025-01-15" });
    expect(shouldResetTask(task, "2025-01-20")).toBe(false);
  });
});

describe("resetTask", () => {
  it("should set completed to false and update lastResetDate", () => {
    const task = makeTask({
      completed: true,
      completedAt: "2025-01-01T12:00:00.000Z",
      lastResetDate: "2025-01-01",
    });
    const result = resetTask(task, "2025-01-02");
    expect(result.completed).toBe(false);
    expect(result.completedAt).toBeUndefined();
    expect(result.lastResetDate).toBe("2025-01-02");
  });

  it("should return same task if no reset needed", () => {
    const task = makeTask({ lastResetDate: "2025-01-02" });
    const result = resetTask(task, "2025-01-02");
    expect(result).toBe(task);
  });
});

describe("resetTasks", () => {
  it("should reset all tasks that need resetting", () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const tasks = [
      makeTask({ id: "1", lastResetDate: yesterdayStr }),
      makeTask({ id: "2", lastResetDate: today }),
      makeTask({ id: "3", type: "one-time", lastResetDate: yesterdayStr }),
    ];
    const { tasks: result } = resetTasks(tasks);
    expect(result[0].lastResetDate).toBe(today);
    expect(result[1].lastResetDate).toBe(today); // no change
    expect(result[2].lastResetDate).toBe(yesterdayStr); // one-time, no reset
  });
});
