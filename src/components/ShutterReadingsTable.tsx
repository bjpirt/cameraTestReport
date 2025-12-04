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
  const handleMeasuredChange = (id: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    onChange(
      readings.map((r) =>
        r.id === id ? { ...r, measuredMs: numValue } : r
      )
    );
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
        {readings.map((reading) => {
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
                  value={reading.measuredMs ?? ""}
                  onChange={(e) => handleMeasuredChange(reading.id, e.target.value)}
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
    </table>
  );
}
