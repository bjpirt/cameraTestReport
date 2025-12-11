import { getTodayDateString } from "../utils/date";

// Re-export the type from the Zod schema
export type { CameraMetadata } from "../schemas/reportSchema";
import type { CameraMetadata } from "../schemas/reportSchema";

export function createEmptyCameraMetadata(): CameraMetadata {
  return {
    make: "",
    model: "",
    serialNumber: "",
    customerName: "",
    serviceDate: getTodayDateString(),
    createdTimestamp: new Date().toISOString(),
  };
}
