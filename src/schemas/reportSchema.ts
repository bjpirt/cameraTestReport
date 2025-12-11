import { z } from "zod";

// Camera Metadata Schema
export const CameraMetadataSchema = z.object({
  make: z.string(),
  model: z.string(),
  serialNumber: z.string(),
  customerName: z.string(),
  serviceDate: z.string(),
  createdTimestamp: z.string(),
});

export type CameraMetadata = z.infer<typeof CameraMetadataSchema>;

// Shutter Reading Schema (current format)
export const ShutterReadingSchema = z.object({
  id: z.string(),
  expectedTime: z.string(),
  beforeSamples: z.array(z.number()),
  measurementSamples: z.array(z.number()),
});

export type ShutterReading = z.infer<typeof ShutterReadingSchema>;

// Legacy Reading Schema (for importing old format files with beforeMs/measuredMs)
export const LegacyReadingSchema = z.object({
  id: z.string(),
  expectedTime: z.string(),
  beforeMs: z.number().nullable().optional(),
  measuredMs: z.number().nullable().optional(),
  beforeSamples: z.array(z.number()).optional(),
  measurementSamples: z.array(z.number()).optional(),
});

export type LegacyReading = z.infer<typeof LegacyReadingSchema>;

// Report Schema - the core report data structure used for both JSON export/import and localStorage
// Uses LegacyReadingSchema to support importing old format files
export const ReportSchema = z.object({
  metadata: CameraMetadataSchema,
  readings: z.array(LegacyReadingSchema),
  actions: z.array(z.string()).default([]),
  notes: z.string().default(""),
  showBeforeColumn: z.boolean().optional(),
  showMultipleMeasurements: z.boolean().optional(),
  exportedAt: z.string().optional(),
});

export type Report = z.infer<typeof ReportSchema>;

// Stored Camera Schema (for localStorage)
export const StoredCameraSchema = z.object({
  id: z.string(),
  metadata: CameraMetadataSchema,
  readings: z.array(ShutterReadingSchema),
  actions: z.array(z.string()),
  notes: z.string(),
  showBeforeColumn: z.boolean(),
  showMultipleMeasurements: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type StoredCamera = z.infer<typeof StoredCameraSchema>;

// Stored Data Schema (full localStorage structure)
export const StoredDataSchema = z.object({
  version: z.number(),
  currentCameraId: z.string(),
  cameras: z.record(z.string(), StoredCameraSchema),
});

export type StoredData = z.infer<typeof StoredDataSchema>;

// Helper function to migrate a legacy reading to the current format
export function migrateReading(reading: LegacyReading): ShutterReading {
  // Check if already in new format
  if (Array.isArray(reading.beforeSamples) && Array.isArray(reading.measurementSamples)) {
    return {
      id: reading.id,
      expectedTime: reading.expectedTime,
      beforeSamples: reading.beforeSamples,
      measurementSamples: reading.measurementSamples,
    };
  }
  // Migrate from old format
  const beforeSamples: number[] = reading.beforeMs != null ? [reading.beforeMs] : [];
  const measurementSamples: number[] = reading.measuredMs != null ? [reading.measuredMs] : [];
  return {
    id: reading.id,
    expectedTime: reading.expectedTime,
    beforeSamples,
    measurementSamples,
  };
}

// Parse and validate a report
export function parseReport(data: unknown): Report {
  return ReportSchema.parse(data);
}

// Safe parse that returns a result object instead of throwing
export function safeParseReport(data: unknown) {
  return ReportSchema.safeParse(data);
}
