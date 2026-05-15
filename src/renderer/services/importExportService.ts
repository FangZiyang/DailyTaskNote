import { AppData } from "../../shared/types";
import { validateImportData, duplicateIdCheck } from "../utils/validationUtils";

export function exportData(data: AppData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dailytaskbar-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importData(): Promise<AppData | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const text = await file.text();
        const raw = JSON.parse(text);
        const validated = validateImportData(raw);
        if (!validated) {
          alert("Invalid data file format.");
          resolve(null);
          return;
        }
        validated.tasks = duplicateIdCheck(validated.tasks);
        resolve(validated);
      } catch {
        alert("Failed to parse JSON file.");
        resolve(null);
      }
    };
    input.click();
  });
}
