import { CameraMetadata, createEmptyCameraMetadata } from "../types/CameraMetadata";
import { ShutterReading, createDefaultReadings } from "../types/ShutterReading";

const STORAGE_KEY = "cameraTestReport";
const CURRENT_VERSION = 1;

export interface StoredCamera {
  id: string;
  metadata: CameraMetadata;
  readings: ShutterReading[];
  actions: string[];
  notes: string;
  showBeforeColumn: boolean;
  showMultipleMeasurements: boolean;
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
        showBeforeColumn: false,
        showMultipleMeasurements: false,
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

// Old format for migration
interface LegacyReading {
  id: string;
  expectedTime: string;
  beforeMs?: number | null;
  measuredMs?: number | null;
  beforeSamples?: number[];
  measurementSamples?: number[];
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
    if (camera.showBeforeColumn === undefined) {
      camera.showBeforeColumn = false;
    }
    if (camera.showMultipleMeasurements === undefined) {
      camera.showMultipleMeasurements = false;
    }
    // Add createdTimestamp if missing (use createdAt as fallback)
    if (!camera.metadata.createdTimestamp) {
      camera.metadata.createdTimestamp = camera.createdAt;
    }
    // Migrate readings from old format (beforeMs/measuredMs) to new format (arrays)
    camera.readings = camera.readings.map((reading) => {
      const legacyReading = reading as unknown as LegacyReading;
      // Check if already migrated (has array fields)
      if (Array.isArray(legacyReading.beforeSamples) && Array.isArray(legacyReading.measurementSamples)) {
        return reading;
      }
      // Migrate from old format
      const beforeSamples: number[] = legacyReading.beforeMs != null ? [legacyReading.beforeMs] : [];
      const measurementSamples: number[] = legacyReading.measuredMs != null ? [legacyReading.measuredMs] : [];
      return {
        id: legacyReading.id,
        expectedTime: legacyReading.expectedTime,
        beforeSamples,
        measurementSamples,
      };
    });
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
  updates: Partial<Pick<StoredCamera, "metadata" | "readings" | "actions" | "notes" | "showBeforeColumn" | "showMultipleMeasurements">>
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
        showBeforeColumn: false,
        showMultipleMeasurements: false,
        createdAt: now,
        updatedAt: now,
      },
    },
  };
}

export function deleteCamera(data: StoredData, cameraId: string): StoredData {
  const cameraIds = Object.keys(data.cameras);

  // If deleting the last camera, create a new empty one
  if (cameraIds.length <= 1) {
    const newId = generateCameraId();
    const now = new Date().toISOString();
    return {
      ...data,
      currentCameraId: newId,
      cameras: {
        [newId]: {
          id: newId,
          metadata: createEmptyCameraMetadata(),
          readings: createDefaultReadings(),
          actions: [],
          notes: "",
          showBeforeColumn: false,
          showMultipleMeasurements: false,
          createdAt: now,
          updatedAt: now,
        },
      },
    };
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

export function importCamera(
  data: StoredData,
  importedData: {
    metadata: CameraMetadata;
    readings: LegacyReading[];
    actions: string[];
    notes: string;
  }
): StoredData {
  const newId = generateCameraId();
  const now = new Date().toISOString();

  // Migrate readings from old format if needed
  const migratedReadings: ShutterReading[] = importedData.readings.map((reading) => {
    // Check if already in new format
    if (Array.isArray(reading.beforeSamples) && Array.isArray(reading.measurementSamples)) {
      return {
        id: reading.id,
        expectedTime: reading.expectedTime,
        beforeSamples: reading.beforeSamples,
        measurementSamples: reading.measurementSamples,
      };
    }
    // Migrate from old format
    const beforeSamples: number[] = reading.beforeMs != null ? [reading.beforeMs] : [];
    const measurementSamples: number[] = reading.measuredMs != null ? [reading.measuredMs] : [];
    return {
      id: reading.id,
      expectedTime: reading.expectedTime,
      beforeSamples,
      measurementSamples,
    };
  });

  return {
    ...data,
    currentCameraId: newId,
    cameras: {
      ...data.cameras,
      [newId]: {
        id: newId,
        metadata: importedData.metadata,
        readings: migratedReadings,
        actions: importedData.actions,
        notes: importedData.notes,
        showBeforeColumn: false,
        showMultipleMeasurements: false,
        createdAt: now,
        updatedAt: now,
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
