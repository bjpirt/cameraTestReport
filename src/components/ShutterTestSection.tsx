import React, { forwardRef } from "react";
import { ShutterReading } from "../types/ShutterReading";
import { ShutterReadingsTable } from "./ShutterReadingsTable";
import { ShutterGraph, ShutterGraphRef } from "./ShutterGraph";

interface ShutterTestSectionProps {
  readings: ShutterReading[];
  onChange: (readings: ShutterReading[]) => void;
}

export const ShutterTestSection = forwardRef<
  ShutterGraphRef,
  ShutterTestSectionProps
>(function ShutterTestSection({ readings, onChange }, ref) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Shutter Speed Readings
        </h2>
        <ShutterReadingsTable readings={readings} onChange={onChange} />
      </div>
      <ShutterGraph ref={ref} readings={readings} />
    </div>
  );
});
