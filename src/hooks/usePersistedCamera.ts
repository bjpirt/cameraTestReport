import { useState, useEffect, useCallback, useRef } from "react";
import { CameraMetadata } from "../types/CameraMetadata";
import { ShutterReading } from "../types/ShutterReading";
import {
  loadData,
  saveData,
  getCurrentCamera,
  updateCurrentCamera,
  StoredData,
} from "../utils/storage";

interface UsePersistedCameraResult {
  metadata: CameraMetadata;
  readings: ShutterReading[];
  setMetadata: (metadata: CameraMetadata) => void;
  setReadings: (readings: ShutterReading[]) => void;
  isLoaded: boolean;
}

export function usePersistedCamera(): UsePersistedCameraResult {
  // Use lazy initialization to load data synchronously on first render
  const [data, setData] = useState<StoredData>(() => loadData());
  const isInitialRender = useRef(true);

  // Save data whenever it changes (skip initial render)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    saveData(data);
  }, [data]);

  const setMetadata = useCallback((metadata: CameraMetadata) => {
    setData((prev) => updateCurrentCamera(prev, { metadata }));
  }, []);

  const setReadings = useCallback((readings: ShutterReading[]) => {
    setData((prev) => updateCurrentCamera(prev, { readings }));
  }, []);

  const camera = getCurrentCamera(data);
  return {
    metadata: camera.metadata,
    readings: camera.readings,
    setMetadata,
    setReadings,
    isLoaded: true,
  };
}
