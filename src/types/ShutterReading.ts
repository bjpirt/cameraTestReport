export interface ShutterReading {
  id: string;
  expectedTime: string; // fraction like "1/1000" or seconds like "1"
  beforeMs: number | null;
  measuredMs: number | null; // "after" measurement
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
    beforeMs: null,
    measuredMs: null,
  }));
}
