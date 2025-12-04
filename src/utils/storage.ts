import { CameraMetadata, createEmptyCameraMetadata } from "../types/CameraMetadata";
import { ShutterReading, createDefaultReadings } from "../types/ShutterReading";

const STORAGE_KEY = "shutterSpeedReport";
const CURRENT_VERSION = 1;

export interface StoredCamera {
  id: string;
  metadata: CameraMetadata;
  readings: ShutterReading[];
  actions: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredData {
  version: number;
  currentCameraId: string;
  cameras: Record<string, StoredCamera>;
}

export function createDefaultStoredData(): StoredData {
  const defaultId = generateCameraId();
  const now = new Date().toISOString();
  return {
    version: CURRENT_VERSION,
    currentCameraId: defaultId,
    cameras: {
      [defaultId]: {
        id: defaultId,
        metadata: createEmptyCameraMetadata(),
        readings: createDefaultReadings(),
        actions: [],
        notes: "",
        createdAt: now,
        updatedAt: now,
      },
    },
  };
}

export function generateCameraId(): string {
  return `camera-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultStoredData();
    }
    const parsed = JSON.parse(raw);
    if (!isValidStoredData(parsed)) {
      return createDefaultStoredData();
    }
    return migrateData(parsed);
  } catch {
    return createDefaultStoredData();
  }
}

function migrateData(data: StoredData): StoredData {
  // Add missing fields to cameras for backwards compatibility
  for (const cameraId of Object.keys(data.cameras)) {
    const camera = data.cameras[cameraId];
    if (!camera.actions) {
      camera.actions = [];
    }
    if (camera.notes === undefined) {
      camera.notes = "";
    }
  }
  return data;
}

export function saveData(data: StoredData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentCamera(data: StoredData): StoredCamera {
  return data.cameras[data.currentCameraId];
}

export function updateCurrentCamera(
  data: StoredData,
  updates: Partial<Pick<StoredCamera, "metadata" | "readings" | "actions" | "notes">>
): StoredData {
  const camera = data.cameras[data.currentCameraId];
  return {
    ...data,
    cameras: {
      ...data.cameras,
      [data.currentCameraId]: {
        ...camera,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    },
  };
}

function isValidStoredData(data: unknown): data is StoredData {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.version !== "number") return false;
  if (typeof obj.currentCameraId !== "string") return false;
  if (typeof obj.cameras !== "object" || obj.cameras === null) return false;
  // Check that currentCameraId exists in cameras
  const cameras = obj.cameras as Record<string, unknown>;
  if (!(obj.currentCameraId in cameras)) return false;
  return true;
}
