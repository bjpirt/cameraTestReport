export interface ShutterReading {
  id: string;
  expectedTime: string; // fraction like "1/1000" or seconds like "1"
  beforeSamples: number[]; // Empty array when no samples
  measurementSamples: number[]; // "Actual" or "After" depending on mode
}

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
