import { describe, it, expect } from "vitest";
import { validateImportData, duplicateIdCheck } from "../src/renderer/utils/validationUtils";
import { Task } from "../src/shared/types";

describe("validateImportData", () => {
  it("should return null for invalid data", () => {
    expect(validateImportData(null)).toBeNull();
    expect(validateImportData("string")).toBeNull();
    expect(validateImportData({})).toBeNull();
    expect(validateImportData({ tasks: "not-array" })).toBeNull();
  });

  it("should validate valid data", () => {
    const data = {
      version: 1,
      tasks: [
        {
          id: "1",
          title: "Test",
          completed: false,
          type: "daily",
          priority: "medium",
          reminderEnabled: false,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
          order: 0,
          archived: false,
        },
      ],
      settings: {},
      history: [],
      categories: [],
    };
    const result = validateImportData(data);
    expect(result).not.toBeNull();
    expect(result!.tasks.length).toBe(1);
    expect(result!.tasks[0].title).toBe("Test");
  });

  it("should skip invalid tasks", () => {
    const data = {
      tasks: [
        { title: "" }, // invalid - empty title
        { id: "1", title: "Valid", type: "daily" },
      ],
    };
    const result = validateImportData(data);
    expect(result).not.toBeNull();
    expect(result!.tasks.length).toBe(1);
  });

  it("should use defaults for missing fields", () => {
    const data = {
      tasks: [{ title: "Test" }],
    };
    const result = validateImportData(data);
    expect(result!.tasks[0].type).toBe("daily");
    expect(result!.tasks[0].priority).toBe("medium");
    expect(result!.tasks[0].archived).toBe(false);
  });
});

describe("duplicateIdCheck", () => {
  it("should not modify tasks with unique ids", () => {
    const tasks: Task[] = [
      { id: "1", title: "A", completed: false, type: "daily", priority: "medium", reminderEnabled: false, createdAt: "", updatedAt: "", order: 0, archived: false },
      { id: "2", title: "B", completed: false, type: "daily", priority: "medium", reminderEnabled: false, createdAt: "", updatedAt: "", order: 1, archived: false },
    ];
    const result = duplicateIdCheck(tasks);
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("2");
  });

  it("should reassign duplicate ids", () => {
    const tasks: Task[] = [
      { id: "1", title: "A", completed: false, type: "daily", priority: "medium", reminderEnabled: false, createdAt: "", updatedAt: "", order: 0, archived: false },
      { id: "1", title: "B", completed: false, type: "daily", priority: "medium", reminderEnabled: false, createdAt: "", updatedAt: "", order: 1, archived: false },
    ];
    const result = duplicateIdCheck(tasks);
    expect(result[0].id).toBe("1");
    expect(result[1].id).not.toBe("1");
  });
});
