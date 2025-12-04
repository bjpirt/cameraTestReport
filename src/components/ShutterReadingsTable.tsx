import { useState } from "react";
import { ShutterReading } from "../types/ShutterReading";
import { msToFraction, fractionToMs, calculateEvDifference } from "../utils/shutter";

interface ShutterReadingsTableProps {
  readings: ShutterReading[];
  onChange: (readings: ShutterReading[]) => void;
}

export function ShutterReadingsTable({
  readings,
  onChange,
}: ShutterReadingsTableProps) {
  const [newSpeed, setNewSpeed] = useState("");

  const handleMeasuredChange = (id: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    onChange(
      readings.map((r) =>
        r.id === id ? { ...r, measuredMs: numValue } : r
      )
    );
  };

  const handleAddSpeed = () => {
    const trimmed = newSpeed.trim();
    if (!trimmed) return;

    // Normalize the input (e.g., "1/2000" or "2" for 2 seconds)
    const normalizedSpeed = trimmed.startsWith("1/") || !trimmed.includes("/")
      ? trimmed
      : trimmed;

    // Check if speed already exists
    if (readings.some((r) => r.expectedTime === normalizedSpeed)) {
      return;
    }

    // Create new reading and insert in correct position (sorted by ms, fastest first)
    const newMs = fractionToMs(normalizedSpeed);
    const newReading: ShutterReading = {
      id: `reading-custom-${Date.now()}`,
      expectedTime: normalizedSpeed,
      measuredMs: null,
    };

    // Find insertion point to keep sorted (fastest/smallest ms first)
    const newReadings = [...readings];
    const insertIndex = newReadings.findIndex(
      (r) => fractionToMs(r.expectedTime) > newMs
    );

    if (insertIndex === -1) {
      newReadings.push(newReading);
    } else {
      newReadings.splice(insertIndex, 0, newReading);
    }

    onChange(newReadings);
    setNewSpeed("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSpeed();
    }
  };

  const handleReadingKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
      const nextIndex = index + 1;
      if (nextIndex < readings.length) {
        e.preventDefault();
        const nextInput = document.getElementById(`reading-input-${nextIndex}`);
        nextInput?.focus();
      }
    }
  };

  const formatEvDiff = (ev: number): string => {
    const sign = ev >= 0 ? "+" : "";
    return `${sign}${ev.toFixed(2)}`;
  };

  const getEvColor = (ev: number): string => {
    const absEv = Math.abs(ev);
    if (absEv < 0.25) return "text-green-600";
    if (absEv < 0.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-2 font-medium text-gray-600">Expected</th>
          <th className="text-left py-2 font-medium text-gray-600">Measured (ms)</th>
          <th className="text-left py-2 font-medium text-gray-600">Actual</th>
          <th className="text-left py-2 font-medium text-gray-600">EV Diff</th>
        </tr>
      </thead>
      <tbody>
        {readings.map((reading, index) => {
          const expectedMs = fractionToMs(reading.expectedTime);
          const hasReading = reading.measuredMs !== null;
          const actualFraction = hasReading
            ? msToFraction(reading.measuredMs!)
            : null;
          const evDiff = hasReading
            ? calculateEvDifference(expectedMs, reading.measuredMs!)
            : null;

          return (
            <tr key={reading.id} className="border-b border-gray-100">
              <td className="py-1.5 font-mono">{reading.expectedTime}</td>
              <td className="py-1.5">
                <input
                  type="number"
                  step="0.1"
                  id={`reading-input-${index}`}
                  value={reading.measuredMs ?? ""}
                  onChange={(e) => handleMeasuredChange(reading.id, e.target.value)}
                  onKeyDown={(e) => handleReadingKeyDown(e, index)}
                  className="w-20 px-2 py-0.5 border border-gray-300 rounded text-right font-mono
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="—"
                />
              </td>
              <td className="py-1.5 font-mono">
                {actualFraction ?? "—"}
              </td>
              <td className={`py-1.5 font-mono ${evDiff !== null ? getEvColor(evDiff) : ""}`}>
                {evDiff !== null ? formatEvDiff(evDiff) : "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={4} className="pt-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSpeed}
                onChange={(e) => setNewSpeed(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 1/2000"
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddSpeed}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Add
              </button>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
