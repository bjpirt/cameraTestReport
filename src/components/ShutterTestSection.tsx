import React, { forwardRef } from "react";
import { ShutterReading } from "../types/ShutterReading";
import { ShutterReadingsTable } from "./ShutterReadingsTable";
import { ShutterGraph, ShutterGraphRef } from "./ShutterGraph";

interface ShutterTestSectionProps {
  readings: ShutterReading[];
  onChange: (readings: ShutterReading[]) => void;
  showBeforeColumn: boolean;
  onShowBeforeColumnChange: (value: boolean) => void;
  showMultipleMeasurements: boolean;
  onShowMultipleMeasurementsChange: (value: boolean) => void;
}

export const ShutterTestSection = forwardRef<
  ShutterGraphRef,
  ShutterTestSectionProps
>(function ShutterTestSection({
  readings,
  onChange,
  showBeforeColumn,
  onShowBeforeColumnChange,
  showMultipleMeasurements,
  onShowMultipleMeasurementsChange,
}, ref) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Shutter Speed Readings
          </h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showBeforeColumn}
                onChange={(e) => onShowBeforeColumnChange(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Before and After
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showMultipleMeasurements}
                onChange={(e) => onShowMultipleMeasurementsChange(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Multiple Measurements
            </label>
          </div>
        </div>
        <ShutterReadingsTable
          readings={readings}
          onChange={onChange}
          showBeforeColumn={showBeforeColumn}
          showMultipleMeasurements={showMultipleMeasurements}
        />
      </div>
      <ShutterGraph
        ref={ref}
        readings={readings}
        showBeforeColumn={showBeforeColumn}
        showMultipleMeasurements={showMultipleMeasurements}
      />
    </div>
  );
});
