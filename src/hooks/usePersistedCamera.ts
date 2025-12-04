import { useState, useEffect, useCallback, useRef } from "react";
import { CameraMetadata } from "../types/CameraMetadata";
import { ShutterReading } from "../types/ShutterReading";
import {
  loadData,
  saveData,
  getCurrentCamera,
  updateCurrentCamera,
  addCamera,
  deleteCamera,
  switchCamera,
  getAllCameras,
  importCamera,
  StoredData,
  StoredCamera,
} from "../utils/storage";

interface UsePersistedCameraResult {
  metadata: CameraMetadata;
  readings: ShutterReading[];
  actions: string[];
  notes: string;
  setMetadata: (metadata: CameraMetadata) => void;
  setReadings: (readings: ShutterReading[]) => void;
  setActions: (actions: string[]) => void;
  setNotes: (notes: string) => void;
  isLoaded: boolean;
  // Multi-camera support
  cameras: StoredCamera[];
  currentCameraId: string;
  onAddCamera: () => void;
  onDeleteCamera: (id: string) => void;
  onSelectCamera: (id: string) => void;
  onImportCamera: (data: {
    metadata: CameraMetadata;
    readings: ShutterReading[];
    actions: string[];
    notes: string;
  }) => void;
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

  const setActions = useCallback((actions: string[]) => {
    setData((prev) => updateCurrentCamera(prev, { actions }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setData((prev) => updateCurrentCamera(prev, { notes }));
  }, []);

  const onAddCamera = useCallback(() => {
    setData((prev) => addCamera(prev));
  }, []);

  const onDeleteCamera = useCallback((id: string) => {
    setData((prev) => deleteCamera(prev, id));
  }, []);

  const onSelectCamera = useCallback((id: string) => {
    setData((prev) => switchCamera(prev, id));
  }, []);

  const onImportCamera = useCallback(
    (importedData: {
      metadata: CameraMetadata;
      readings: ShutterReading[];
      actions: string[];
      notes: string;
    }) => {
      setData((prev) => importCamera(prev, importedData));
    },
    []
  );

  const camera = getCurrentCamera(data);
  return {
    metadata: camera.metadata,
    readings: camera.readings,
    actions: camera.actions,
    notes: camera.notes,
    setMetadata,
    setReadings,
    setActions,
    setNotes,
    isLoaded: true,
    cameras: getAllCameras(data),
    currentCameraId: data.currentCameraId,
    onAddCamera,
    onDeleteCamera,
    onSelectCamera,
    onImportCamera,
  };
}
