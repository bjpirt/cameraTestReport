import { getTodayDateString } from "../utils/date";

export interface CameraMetadata {
  make: string;
  model: string;
  serialNumber: string;
  customerName: string;
  serviceDate: string;
}

export function createEmptyCameraMetadata(): CameraMetadata {
  return {
    make: "",
    model: "",
    serialNumber: "",
    customerName: "",
    serviceDate: getTodayDateString(),
  };
}
