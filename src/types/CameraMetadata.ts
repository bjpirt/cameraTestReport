import { getTodayDateString } from "../utils/date";

// Re-export the type from the Zod schema
export type { CameraMetadata } from "../schemas/reportSchema";
import type { CameraMetadata } from "../schemas/reportSchema";

export type LiveDataMode = CameraMetadata["liveDataMode"];

export function createEmptyCameraMetadata(liveDataMode?: LiveDataMode): CameraMetadata {
  return {
    make: "",
    model: "",
    serialNumber: "",
    customerName: "",
    serviceDate: getTodayDateString(),
    createdTimestamp: new Date().toISOString(),
    liveDataMode,
  };
}
