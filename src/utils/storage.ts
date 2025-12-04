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
    // Add createdTimestamp if missing (use createdAt as fallback)
    if (!camera.metadata.createdTimestamp) {
      camera.metadata.createdTimestamp = camera.createdAt;
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

export function addCamera(data: StoredData): StoredData {
  const newId = generateCameraId();
  const now = new Date().toISOString();
  return {
    ...data,
    currentCameraId: newId,
    cameras: {
      ...data.cameras,
      [newId]: {
        id: newId,
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

export function deleteCamera(data: StoredData, cameraId: string): StoredData {
  const cameraIds = Object.keys(data.cameras);

  // Don't delete the last camera
  if (cameraIds.length <= 1) {
    return data;
  }

  const { [cameraId]: _deleted, ...remainingCameras } = data.cameras;
  void _deleted; // Intentionally unused - we're removing this camera

  // If deleting the current camera, switch to another one
  let newCurrentId = data.currentCameraId;
  if (cameraId === data.currentCameraId) {
    const remainingIds = Object.keys(remainingCameras);
    newCurrentId = remainingIds[0];
  }

  return {
    ...data,
    currentCameraId: newCurrentId,
    cameras: remainingCameras,
  };
}

export function switchCamera(data: StoredData, cameraId: string): StoredData {
  if (!(cameraId in data.cameras)) {
    return data;
  }
  return {
    ...data,
    currentCameraId: cameraId,
  };
}

export function getAllCameras(data: StoredData): StoredCamera[] {
  return Object.values(data.cameras);
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
