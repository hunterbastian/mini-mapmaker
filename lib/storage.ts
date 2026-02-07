import { MapProjectV1, parseProject, serializeProject } from "@/lib/project";

export const STORAGE_KEY = "mini-mapmaker.project.v1";

let saveTimer: number | null = null;

export function loadProject(): MapProjectV1 | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const result = parseProject(raw);
  if (!result.ok) {
    return null;
  }

  return result.project;
}

export function saveProject(project: MapProjectV1): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, serializeProject(project));
}

export function scheduleSaveProject(project: MapProjectV1, delay = 200): void {
  if (typeof window === "undefined") {
    return;
  }

  if (saveTimer) {
    window.clearTimeout(saveTimer);
  }

  saveTimer = window.setTimeout(() => {
    saveProject(project);
    saveTimer = null;
  }, delay);
}
