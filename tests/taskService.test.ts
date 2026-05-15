import { describe, it, expect } from "vitest";
import {
  createTask,
  toggleTask,
  filterTasks,
  sortTasks,
  reorderTasks,
} from "../src/renderer/services/taskService";
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

describe("createTask", () => {
  it("should create a task with given title and defaults", () => {
    const task = createTask("My Task");
    expect(task.title).toBe("My Task");
    expect(task.completed).toBe(false);
    expect(task.type).toBe("daily");
    expect(task.priority).toBe("medium");
    expect(task.id).toBeTruthy();
  });

  it("should trim whitespace", () => {
    const task = createTask("  My Task  ");
    expect(task.title).toBe("My Task");
  });
});

describe("toggleTask", () => {
  it("should toggle from incomplete to complete", () => {
    const task = makeTask({ completed: false });
    const result = toggleTask(task);
    expect(result.completed).toBe(true);
    expect(result.completedAt).toBeTruthy();
  });

  it("should toggle from complete to incomplete", () => {
    const task = makeTask({ completed: true, completedAt: "2025-01-01T00:00:00Z" });
    const result = toggleTask(task);
    expect(result.completed).toBe(false);
    expect(result.completedAt).toBeUndefined();
  });
});

describe("filterTasks", () => {
  const tasks = [
    makeTask({ id: "1", completed: false, priority: "high" }),
    makeTask({ id: "2", completed: true, priority: "low" }),
    makeTask({ id: "3", completed: false, priority: "medium", archived: true }),
    makeTask({ id: "4", completed: false, priority: "medium", title: "Special Task" }),
  ];

  it("should filter all (excluding archived)", () => {
    expect(filterTasks(tasks, "all", "").length).toBe(3);
  });

  it("should filter incomplete", () => {
    expect(filterTasks(tasks, "incomplete", "").length).toBe(2);
  });

  it("should filter completed", () => {
    expect(filterTasks(tasks, "completed", "").length).toBe(1);
  });

  it("should filter high priority", () => {
    expect(filterTasks(tasks, "high-priority", "").length).toBe(1);
  });

  it("should filter by search query", () => {
    expect(filterTasks(tasks, "all", "Special").length).toBe(1);
  });
});

describe("sortTasks", () => {
  it("should put incomplete before completed", () => {
    const tasks = [
      makeTask({ id: "1", completed: true }),
      makeTask({ id: "2", completed: false }),
    ];
    const result = sortTasks(tasks);
    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("1");
  });

  it("should sort by priority within same completion status", () => {
    const tasks = [
      makeTask({ id: "1", priority: "low" }),
      makeTask({ id: "2", priority: "high" }),
      makeTask({ id: "3", priority: "medium" }),
    ];
    const result = sortTasks(tasks);
    expect(result[0].priority).toBe("high");
    expect(result[1].priority).toBe("medium");
    expect(result[2].priority).toBe("low");
  });
});

describe("reorderTasks", () => {
  it("should move task from one position to another", () => {
    const tasks = [
      makeTask({ id: "1", order: 0 }),
      makeTask({ id: "2", order: 1 }),
      makeTask({ id: "3", order: 2 }),
    ];
    const result = reorderTasks(tasks, 0, 2);
    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("3");
    expect(result[2].id).toBe("1");
  });
});
