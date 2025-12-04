import { ShutterReading } from "../types/ShutterReading";

interface ShutterGraphProps {
  readings: ShutterReading[];
}

export function ShutterGraph({ readings }: ShutterGraphProps) {
  const measuredCount = readings.filter((r) => r.measuredMs !== null).length;

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Shutter Speed Graph
      </h2>
      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Graph Placeholder</p>
          <p className="text-sm mt-1">
            {measuredCount} of {readings.length} readings
          </p>
        </div>
      </div>
    </div>
  );
}
