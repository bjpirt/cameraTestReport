import { jest } from "@jest/globals";
import {
  loadData,
  saveData,
  clearData,
  createDefaultStoredData,
  getCurrentCamera,
  updateCurrentCamera,
  deleteCamera,
  importCamera,
  StoredData,
} from "./storage";

// Mock localStorage
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => mockStorage[key] ?? null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  }),
};

Object.defineProperty(global, "localStorage", { value: localStorageMock });

describe("storage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe("createDefaultStoredData", () => {
    it("creates data with version 1", () => {
      const data = createDefaultStoredData();
      expect(data.version).toBe(1);
    });

    it("creates data with a current camera id", () => {
      const data = createDefaultStoredData();
      expect(data.currentCameraId).toBeDefined();
      expect(data.currentCameraId.startsWith("camera-")).toBe(true);
    });

    it("creates data with the current camera in cameras", () => {
      const data = createDefaultStoredData();
      expect(data.cameras[data.currentCameraId]).toBeDefined();
    });

    it("creates camera with empty metadata", () => {
      const data = createDefaultStoredData();
      const camera = data.cameras[data.currentCameraId];
      expect(camera.metadata.make).toBe("");
      expect(camera.metadata.model).toBe("");
    });

    it("creates camera with default readings", () => {
      const data = createDefaultStoredData();
      const camera = data.cameras[data.currentCameraId];
      expect(camera.readings.length).toBe(11);
      expect(camera.readings[0].expectedTime).toBe("1"); // Slowest speed first
    });

    it("creates camera with timestamps", () => {
      const data = createDefaultStoredData();
      const camera = data.cameras[data.currentCameraId];
      expect(camera.createdAt).toBeDefined();
      expect(camera.updatedAt).toBeDefined();
    });
  });

  describe("loadData", () => {
    it("returns default data when localStorage is empty", () => {
      const data = loadData();
      expect(data.version).toBe(1);
      expect(data.currentCameraId).toBeDefined();
    });

    it("returns stored data when valid", () => {
      const stored: StoredData = {
        version: 1,
        currentCameraId: "test-camera",
        cameras: {
          "test-camera": {
            id: "test-camera",
            metadata: {
              make: "Nikon",
              model: "F3",
              serialNumber: "12345",
              customerName: "Test User",
              serviceDate: "2024-01-15",
              createdTimestamp: "2024-01-15T10:00:00.000Z",
            },
            readings: [{ id: "r1", expectedTime: "1/1000", beforeSamples: [], measurementSamples: [1.1] }],
            actions: ["Cleaned shutter"],
            notes: "Test notes",
            showBeforeColumn: false,
            showMultipleMeasurements: false,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-15T00:00:00.000Z",
          },
        },
      };
      mockStorage["cameraTestReport"] = JSON.stringify(stored);

      const data = loadData();
      expect(data.cameras["test-camera"].metadata.make).toBe("Nikon");
    });

    it("migrates old data without actions or notes fields", () => {
      const oldData = {
        version: 1,
        currentCameraId: "old-camera",
        cameras: {
          "old-camera": {
            id: "old-camera",
            metadata: {
              make: "Canon",
              model: "AE-1",
              serialNumber: "999",
              customerName: "Old User",
              serviceDate: "2023-01-01",
            },
            readings: [],
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockStorage["cameraTestReport"] = JSON.stringify(oldData);

      const data = loadData();
      expect(data.cameras["old-camera"].actions).toEqual([]);
      expect(data.cameras["old-camera"].notes).toBe("");
    });

    it("returns default data when stored data is invalid JSON", () => {
      mockStorage["cameraTestReport"] = "not valid json{";
      const data = loadData();
      expect(data.version).toBe(1);
    });

    it("returns default data when stored data is missing version", () => {
      mockStorage["cameraTestReport"] = JSON.stringify({ cameras: {} });
      const data = loadData();
      expect(data.version).toBe(1);
    });

    it("returns default data when currentCameraId not in cameras", () => {
      mockStorage["cameraTestReport"] = JSON.stringify({
        version: 1,
        currentCameraId: "missing",
        cameras: {},
      });
      const data = loadData();
      expect(data.cameras[data.currentCameraId]).toBeDefined();
    });
  });

  describe("saveData", () => {
    it("saves data to localStorage", () => {
      const data = createDefaultStoredData();
      saveData(data);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "cameraTestReport",
        JSON.stringify(data)
      );
    });
  });

  describe("clearData", () => {
    it("removes data from localStorage", () => {
      clearData();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "cameraTestReport"
      );
    });
  });

  describe("getCurrentCamera", () => {
    it("returns the current camera", () => {
      const data = createDefaultStoredData();
      const camera = getCurrentCamera(data);
      expect(camera.id).toBe(data.currentCameraId);
    });
  });

  describe("updateCurrentCamera", () => {
    it("updates metadata", () => {
      const data = createDefaultStoredData();
      const updated = updateCurrentCamera(data, {
        metadata: {
          make: "Canon",
          model: "AE-1",
          serialNumber: "999",
          customerName: "John",
          serviceDate: "2024-06-01",
          createdTimestamp: "2024-06-01T10:00:00.000Z",
        },
      });
      expect(getCurrentCamera(updated).metadata.make).toBe("Canon");
    });

    it("updates readings", () => {
      const data = createDefaultStoredData();
      const newReadings = [
        { id: "r1", expectedTime: "1/2000", beforeSamples: [], measurementSamples: [0.5] },
      ];
      const updated = updateCurrentCamera(data, { readings: newReadings });
      expect(getCurrentCamera(updated).readings).toEqual(newReadings);
    });

    it("updates the updatedAt timestamp", () => {
      const data = createDefaultStoredData();
      // Force the original timestamp to be in the past
      data.cameras[data.currentCameraId].updatedAt = "2020-01-01T00:00:00.000Z";

      const updated = updateCurrentCamera(data, {
        metadata: { ...getCurrentCamera(data).metadata, make: "Sony" },
      });

      expect(getCurrentCamera(updated).updatedAt).not.toBe(
        "2020-01-01T00:00:00.000Z"
      );
    });

    it("preserves other camera properties", () => {
      const data = createDefaultStoredData();
      const originalCreatedAt = getCurrentCamera(data).createdAt;
      const updated = updateCurrentCamera(data, {
        metadata: { ...getCurrentCamera(data).metadata, make: "Sony" },
      });
      expect(getCurrentCamera(updated).createdAt).toBe(originalCreatedAt);
    });
  });

  describe("deleteCamera", () => {
    it("deletes a camera when multiple exist", () => {
      const data = createDefaultStoredData();
      const firstCameraId = data.currentCameraId;

      // Add a second camera
      const secondCamera = {
        id: "camera-2",
        metadata: {
          make: "Canon",
          model: "AE-1",
          serialNumber: "999",
          customerName: "User 2",
          serviceDate: "2024-02-01",
          createdTimestamp: "2024-02-01T10:00:00.000Z",
        },
        readings: [],
        actions: [],
        notes: "",
        showBeforeColumn: false,
        showMultipleMeasurements: false,
        createdAt: "2024-02-01T00:00:00.000Z",
        updatedAt: "2024-02-01T00:00:00.000Z",
      };
      data.cameras["camera-2"] = secondCamera;

      const updated = deleteCamera(data, firstCameraId);

      expect(Object.keys(updated.cameras)).toHaveLength(1);
      expect(updated.cameras[firstCameraId]).toBeUndefined();
      expect(updated.cameras["camera-2"]).toBeDefined();
    });

    it("switches to another camera when deleting the current one", () => {
      const data = createDefaultStoredData();
      const firstCameraId = data.currentCameraId;

      // Add a second camera
      data.cameras["camera-2"] = {
        id: "camera-2",
        metadata: {
          make: "Canon",
          model: "AE-1",
          serialNumber: "999",
          customerName: "User 2",
          serviceDate: "2024-02-01",
          createdTimestamp: "2024-02-01T10:00:00.000Z",
        },
        readings: [],
        actions: [],
        notes: "",
        showBeforeColumn: false,
        showMultipleMeasurements: false,
        createdAt: "2024-02-01T00:00:00.000Z",
        updatedAt: "2024-02-01T00:00:00.000Z",
      };

      const updated = deleteCamera(data, firstCameraId);

      expect(updated.currentCameraId).toBe("camera-2");
    });

    it("creates a new empty camera when deleting the last one", () => {
      const data = createDefaultStoredData();
      const originalCameraId = data.currentCameraId;

      const updated = deleteCamera(data, originalCameraId);

      expect(Object.keys(updated.cameras)).toHaveLength(1);
      expect(updated.cameras[originalCameraId]).toBeUndefined();
      expect(updated.currentCameraId).not.toBe(originalCameraId);
      expect(updated.cameras[updated.currentCameraId]).toBeDefined();
      expect(updated.cameras[updated.currentCameraId].metadata.make).toBe("");
    });

    it("preserves non-current camera when deleting another", () => {
      const data = createDefaultStoredData();
      const firstCameraId = data.currentCameraId;

      // Add a second camera
      data.cameras["camera-2"] = {
        id: "camera-2",
        metadata: {
          make: "Canon",
          model: "AE-1",
          serialNumber: "999",
          customerName: "User 2",
          serviceDate: "2024-02-01",
          createdTimestamp: "2024-02-01T10:00:00.000Z",
        },
        readings: [],
        actions: [],
        notes: "",
        showBeforeColumn: false,
        showMultipleMeasurements: false,
        createdAt: "2024-02-01T00:00:00.000Z",
        updatedAt: "2024-02-01T00:00:00.000Z",
      };

      const updated = deleteCamera(data, "camera-2");

      expect(updated.currentCameraId).toBe(firstCameraId);
      expect(updated.cameras[firstCameraId]).toBeDefined();
      expect(updated.cameras["camera-2"]).toBeUndefined();
    });
  });

  describe("importCamera", () => {
    it("creates a new camera with imported data", () => {
      const data = createDefaultStoredData();
      const importedData = {
        metadata: {
          make: "Leica",
          model: "M6",
          serialNumber: "ABC123",
          customerName: "Import User",
          serviceDate: "2024-03-15",
          createdTimestamp: "2024-03-15T10:00:00.000Z",
        },
        readings: [{ id: "r1", expectedTime: "1/1000", beforeSamples: [], measurementSamples: [1.05] }],
        actions: ["CLA performed"],
        notes: "Imported from backup",
      };

      const updated = importCamera(data, importedData);

      const newCamera = getCurrentCamera(updated);
      expect(newCamera.metadata.make).toBe("Leica");
      expect(newCamera.metadata.model).toBe("M6");
      expect(newCamera.readings).toHaveLength(1);
      expect(newCamera.actions).toEqual(["CLA performed"]);
      expect(newCamera.notes).toBe("Imported from backup");
    });

    it("switches to the imported camera", () => {
      const data = createDefaultStoredData();
      const originalCameraId = data.currentCameraId;

      const updated = importCamera(data, {
        metadata: {
          make: "Pentax",
          model: "K1000",
          serialNumber: "999",
          customerName: "Test",
          serviceDate: "2024-01-01",
          createdTimestamp: "2024-01-01T10:00:00.000Z",
        },
        readings: [],
        actions: [],
        notes: "",
      });

      expect(updated.currentCameraId).not.toBe(originalCameraId);
      expect(getCurrentCamera(updated).metadata.make).toBe("Pentax");
    });

    it("preserves existing cameras", () => {
      const data = createDefaultStoredData();
      const originalCameraId = data.currentCameraId;

      const updated = importCamera(data, {
        metadata: {
          make: "Olympus",
          model: "OM-1",
          serialNumber: "111",
          customerName: "Test",
          serviceDate: "2024-01-01",
          createdTimestamp: "2024-01-01T10:00:00.000Z",
        },
        readings: [],
        actions: [],
        notes: "",
      });

      expect(Object.keys(updated.cameras)).toHaveLength(2);
      expect(updated.cameras[originalCameraId]).toBeDefined();
    });

    it("generates new timestamps for imported camera", () => {
      const data = createDefaultStoredData();

      const updated = importCamera(data, {
        metadata: {
          make: "Minolta",
          model: "X-700",
          serialNumber: "222",
          customerName: "Test",
          serviceDate: "2024-01-01",
          createdTimestamp: "2024-01-01T10:00:00.000Z",
        },
        readings: [],
        actions: [],
        notes: "",
      });

      const newCamera = getCurrentCamera(updated);
      expect(newCamera.createdAt).toBeDefined();
      expect(newCamera.updatedAt).toBeDefined();
    });

    it("generates a unique camera id", () => {
      const data = createDefaultStoredData();

      const updated = importCamera(data, {
        metadata: {
          make: "Yashica",
          model: "FX-3",
          serialNumber: "333",
          customerName: "Test",
          serviceDate: "2024-01-01",
          createdTimestamp: "2024-01-01T10:00:00.000Z",
        },
        readings: [],
        actions: [],
        notes: "",
      });

      expect(updated.currentCameraId).toMatch(/^camera-/);
      expect(updated.cameras[updated.currentCameraId].id).toBe(
        updated.currentCameraId
      );
    });
  });
});
