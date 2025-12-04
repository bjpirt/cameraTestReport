import { CameraMetadata } from "../types/CameraMetadata";
import { ShutterReading } from "../types/ShutterReading";

export interface ReportData {
  metadata: CameraMetadata;
  readings: ShutterReading[];
  actions: string[];
  notes: string;
  exportedAt: string;
}

export function downloadReportAsJson(
  metadata: CameraMetadata,
  readings: ShutterReading[],
  actions: string[],
  notes: string
): void {
  const reportData: ReportData = {
    metadata,
    readings,
    actions,
    notes,
    exportedAt: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const filename = generateFilename(metadata);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateFilename(metadata: CameraMetadata): string {
  const parts: string[] = [];

  if (metadata.make) {
    parts.push(sanitizeForFilename(metadata.make));
  }
  if (metadata.model) {
    parts.push(sanitizeForFilename(metadata.model));
  }
  if (metadata.serialNumber) {
    parts.push(sanitizeForFilename(metadata.serialNumber));
  }

  if (parts.length === 0) {
    parts.push("camera-report");
  }

  if (metadata.serviceDate) {
    parts.push(metadata.serviceDate);
  }

  return `${parts.join("-")}.json`;
}

function sanitizeForFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
