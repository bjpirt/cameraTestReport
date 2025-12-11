// Re-export the type from the Zod schema
export type { ShutterReading } from "../schemas/reportSchema";
import type { ShutterReading } from "../schemas/reportSchema";

export const STANDARD_SHUTTER_SPEEDS = [
  "1/1000",
  "1/500",
  "1/250",
  "1/125",
  "1/60",
  "1/30",
  "1/15",
  "1/8",
  "1/4",
  "1/2",
  "1",
];

export function createDefaultReadings(): ShutterReading[] {
  return STANDARD_SHUTTER_SPEEDS.map((speed, index) => ({
    id: `reading-${index}`,
    expectedTime: speed,
    beforeSamples: [],
    measurementSamples: [],
  }));
}
