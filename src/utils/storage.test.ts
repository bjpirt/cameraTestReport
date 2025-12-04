import { jest } from "@jest/globals";
import {
  loadData,
  saveData,
  clearData,
  createDefaultStoredData,
  getCurrentCamera,
  updateCurrentCamera,
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
      expect(camera.readings[0].expectedTime).toBe("1/1000");
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
            },
            readings: [{ id: "r1", expectedTime: "1/1000", measuredMs: 1.1 }],
            actions: ["Cleaned shutter"],
            notes: "Test notes",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-15T00:00:00.000Z",
          },
        },
      };
      mockStorage["shutterSpeedReport"] = JSON.stringify(stored);

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
      mockStorage["shutterSpeedReport"] = JSON.stringify(oldData);

      const data = loadData();
      expect(data.cameras["old-camera"].actions).toEqual([]);
      expect(data.cameras["old-camera"].notes).toBe("");
    });

    it("returns default data when stored data is invalid JSON", () => {
      mockStorage["shutterSpeedReport"] = "not valid json{";
      const data = loadData();
      expect(data.version).toBe(1);
    });

    it("returns default data when stored data is missing version", () => {
      mockStorage["shutterSpeedReport"] = JSON.stringify({ cameras: {} });
      const data = loadData();
      expect(data.version).toBe(1);
    });

    it("returns default data when currentCameraId not in cameras", () => {
      mockStorage["shutterSpeedReport"] = JSON.stringify({
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
        "shutterSpeedReport",
        JSON.stringify(data)
      );
    });
  });

  describe("clearData", () => {
    it("removes data from localStorage", () => {
      clearData();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "shutterSpeedReport"
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
        },
      });
      expect(getCurrentCamera(updated).metadata.make).toBe("Canon");
    });

    it("updates readings", () => {
      const data = createDefaultStoredData();
      const newReadings = [
        { id: "r1", expectedTime: "1/2000", measuredMs: 0.5 },
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
});
