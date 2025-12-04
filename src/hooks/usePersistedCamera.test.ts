import { jest } from "@jest/globals";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePersistedCamera } from "./usePersistedCamera";

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

describe("usePersistedCamera", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it("starts with isLoaded true after initial load", async () => {
    const { result } = renderHook(() => usePersistedCamera());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
  });

  it("loads default metadata when storage is empty", async () => {
    const { result } = renderHook(() => usePersistedCamera());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.metadata.make).toBe("");
    expect(result.current.metadata.model).toBe("");
  });

  it("loads default readings when storage is empty", async () => {
    const { result } = renderHook(() => usePersistedCamera());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.readings.length).toBe(11);
    expect(result.current.readings[0].expectedTime).toBe("1/1000");
  });

  it("persists metadata changes to localStorage", async () => {
    const { result } = renderHook(() => usePersistedCamera());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    const newMetadata = {
      make: "Canon",
      model: "AE-1",
      serialNumber: "12345",
      customerName: "John",
      serviceDate: "2024-06-01",
      createdTimestamp: "2024-06-01T10:00:00.000Z",
    };

    act(() => {
      result.current.setMetadata(newMetadata);
    });

    await waitFor(() => {
      expect(result.current.metadata.make).toBe("Canon");
    });

    // Check localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const savedData = JSON.parse(mockStorage["shutterSpeedReport"]);
    const cameraId = savedData.currentCameraId;
    expect(savedData.cameras[cameraId].metadata.make).toBe("Canon");
  });

  it("persists reading changes to localStorage", async () => {
    const { result } = renderHook(() => usePersistedCamera());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    const newReadings = [
      { id: "custom", expectedTime: "1/2000", measuredMs: 0.5 },
    ];

    act(() => {
      result.current.setReadings(newReadings);
    });

    await waitFor(() => {
      expect(result.current.readings).toHaveLength(1);
    });

    // Check localStorage was updated
    const savedData = JSON.parse(mockStorage["shutterSpeedReport"]);
    const cameraId = savedData.currentCameraId;
    expect(savedData.cameras[cameraId].readings[0].expectedTime).toBe("1/2000");
  });

  it("loads previously saved data on remount", async () => {
    // First render - set some data
    const { result: firstResult, unmount } = renderHook(() =>
      usePersistedCamera()
    );

    await waitFor(() => {
      expect(firstResult.current.isLoaded).toBe(true);
    });

    act(() => {
      firstResult.current.setMetadata({
        make: "Nikon",
        model: "F3",
        serialNumber: "999",
        customerName: "Test",
        serviceDate: "2024-01-01",
        createdTimestamp: "2024-01-01T10:00:00.000Z",
      });
    });

    await waitFor(() => {
      expect(firstResult.current.metadata.make).toBe("Nikon");
    });

    unmount();

    // Second render - should load the saved data
    const { result: secondResult } = renderHook(() => usePersistedCamera());

    await waitFor(() => {
      expect(secondResult.current.isLoaded).toBe(true);
    });

    expect(secondResult.current.metadata.make).toBe("Nikon");
    expect(secondResult.current.metadata.model).toBe("F3");
  });
});
