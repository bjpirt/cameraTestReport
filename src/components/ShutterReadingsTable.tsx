import React, { useState } from "react";
import { ShutterReading } from "../types/ShutterReading";
import { fractionToMs, calculateEvDifference, msToFraction } from "../utils/shutter";
import {
  calculateAverage,
  formatRange,
  getFirstSample,
} from "../utils/statistics";

interface ShutterReadingsTableProps {
  readings: ShutterReading[];
  onChange: (readings: ShutterReading[]) => void;
  showBeforeColumn: boolean;
  showMultipleMeasurements: boolean;
}

export function ShutterReadingsTable({
  readings,
  onChange,
  showBeforeColumn,
  showMultipleMeasurements,
}: ShutterReadingsTableProps) {
  const [newSpeed, setNewSpeed] = useState("");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [newBeforeSample, setNewBeforeSample] = useState("");
  const [newMeasurementSample, setNewMeasurementSample] = useState("");

  // Single-value mode handlers (edit first sample)
  const handleBeforeChange = (id: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    onChange(
      readings.map((r) =>
        r.id === id
          ? { ...r, beforeSamples: numValue !== null ? [numValue] : [] }
          : r
      )
    );
  };

  const handleAfterChange = (id: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    onChange(
      readings.map((r) =>
        r.id === id
          ? { ...r, measurementSamples: numValue !== null ? [numValue] : [] }
          : r
      )
    );
  };

  // Multi-value mode handlers
  const handleAddSample = (id: string, field: "before" | "measurement") => {
    const value = field === "before" ? newBeforeSample : newMeasurementSample;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    onChange(
      readings.map((r) => {
        if (r.id !== id) return r;
        if (field === "before") {
          return { ...r, beforeSamples: [...r.beforeSamples, numValue] };
        } else {
          return { ...r, measurementSamples: [...r.measurementSamples, numValue] };
        }
      })
    );

    if (field === "before") {
      setNewBeforeSample("");
    } else {
      setNewMeasurementSample("");
    }
  };

  const handleDeleteSample = (
    id: string,
    field: "before" | "measurement",
    sampleIndex: number
  ) => {
    onChange(
      readings.map((r) => {
        if (r.id !== id) return r;
        if (field === "before") {
          return {
            ...r,
            beforeSamples: r.beforeSamples.filter((_, i) => i !== sampleIndex),
          };
        } else {
          return {
            ...r,
            measurementSamples: r.measurementSamples.filter((_, i) => i !== sampleIndex),
          };
        }
      })
    );
  };

  const handleAddSpeed = () => {
    const trimmed = newSpeed.trim();
    if (!trimmed) return;

    const normalizedSpeed =
      trimmed.startsWith("1/") || !trimmed.includes("/") ? trimmed : trimmed;

    if (readings.some((r) => r.expectedTime === normalizedSpeed)) {
      return;
    }

    const newMs = fractionToMs(normalizedSpeed);
    const newReading: ShutterReading = {
      id: `reading-custom-${Date.now()}`,
      expectedTime: normalizedSpeed,
      beforeSamples: [],
      measurementSamples: [],
    };

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

  const handleReadingKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    field: "before" | "after" | "actual"
  ) => {
    if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      const nextIndex = index + 1;
      if (field === "actual") {
        if (nextIndex < readings.length) {
          const nextInput = document.getElementById(`reading-actual-${nextIndex}`);
          nextInput?.focus();
        }
      } else if (field === "before") {
        if (nextIndex < readings.length) {
          const nextInput = document.getElementById(`reading-before-${nextIndex}`);
          nextInput?.focus();
        } else {
          const firstAfter = document.getElementById(`reading-after-0`);
          firstAfter?.focus();
        }
      } else {
        if (nextIndex < readings.length) {
          const nextInput = document.getElementById(`reading-after-${nextIndex}`);
          nextInput?.focus();
        }
      }
    }
  };

  const handleSampleKeyDown = (
    e: React.KeyboardEvent,
    id: string,
    field: "before" | "measurement"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSample(id, field);
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
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

  const formatAvgWithCount = (samples: number[]): string => {
    const avg = calculateAverage(samples);
    if (avg === null) return "—";
    return `${avg.toFixed(1)} (${samples.length})`;
  };

  // Calculate column count for colspan
  const getColSpan = () => {
    if (showMultipleMeasurements) {
      // Chevron + Expected + value cols + range cols + EV Diff
      return showBeforeColumn ? 7 : 4;
    }
    return showBeforeColumn ? 4 : 3;
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          {showMultipleMeasurements && (
            <th className="w-8 py-2"></th>
          )}
          <th className="text-left py-2 font-medium text-gray-600">Expected</th>
          {showBeforeColumn ? (
            <>
              {/* Before columns grouped together */}
              <th className="text-left py-2 font-medium text-gray-600">Before (ms)</th>
              {showMultipleMeasurements && (
                <th className="text-left py-2 font-medium text-gray-600">Range</th>
              )}
              {/* After columns grouped together */}
              <th className="text-left py-2 font-medium text-gray-600">After (ms)</th>
              {showMultipleMeasurements && (
                <th className="text-left py-2 font-medium text-gray-600">Range</th>
              )}
            </>
          ) : (
            <>
              <th className="text-left py-2 font-medium text-gray-600">Actual (ms)</th>
              {showMultipleMeasurements && (
                <th className="text-left py-2 font-medium text-gray-600">Range</th>
              )}
            </>
          )}
          <th className="text-left py-2 font-medium text-gray-600">EV Diff</th>
        </tr>
      </thead>
      <tbody>
        {readings.map((reading, index) => {
          const expectedMs = fractionToMs(reading.expectedTime);
          const measurementAvg = calculateAverage(reading.measurementSamples);
          const evDiff =
            measurementAvg !== null
              ? calculateEvDifference(expectedMs, measurementAvg)
              : null;
          const isExpanded = expandedRowId === reading.id;

          // Single value for non-multi mode
          const beforeValue = getFirstSample(reading.beforeSamples);
          const measurementValue = getFirstSample(reading.measurementSamples);

          return (
            <React.Fragment key={reading.id}>
              {/* Summary Row */}
              <tr
                className={`border-b border-gray-100 ${
                  showMultipleMeasurements ? "cursor-pointer hover:bg-gray-50" : ""
                }`}
                onClick={showMultipleMeasurements ? () => toggleRow(reading.id) : undefined}
              >
                {showMultipleMeasurements && (
                  <td className="py-1.5 text-gray-400">
                    {isExpanded ? "▼" : "▶"}
                  </td>
                )}
                <td className="py-1.5 font-mono">{reading.expectedTime}</td>
                {showBeforeColumn ? (
                  <>
                    {/* Before columns grouped together */}
                    <td className="py-1.5" onClick={showMultipleMeasurements ? undefined : (e) => e.stopPropagation()}>
                      {showMultipleMeasurements ? (
                        <span className="font-mono">
                          {formatAvgWithCount(reading.beforeSamples)}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            id={`reading-before-${index}`}
                            value={beforeValue ?? ""}
                            onChange={(e) => handleBeforeChange(reading.id, e.target.value)}
                            onKeyDown={(e) => handleReadingKeyDown(e, index, "before")}
                            className="w-20 px-2 py-0.5 border border-gray-300 rounded text-right font-mono
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="—"
                          />
                          <span className="text-gray-500 font-mono text-xs w-14">
                            {beforeValue !== null ? msToFraction(beforeValue) : ""}
                          </span>
                        </div>
                      )}
                    </td>
                    {showMultipleMeasurements && (
                      <td className="py-1.5 font-mono text-gray-600">
                        {formatRange(reading.beforeSamples) ?? "—"}
                      </td>
                    )}
                    {/* After columns grouped together */}
                    <td className="py-1.5" onClick={showMultipleMeasurements ? undefined : (e) => e.stopPropagation()}>
                      {showMultipleMeasurements ? (
                        <span className="font-mono">
                          {formatAvgWithCount(reading.measurementSamples)}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            id={`reading-after-${index}`}
                            value={measurementValue ?? ""}
                            onChange={(e) => handleAfterChange(reading.id, e.target.value)}
                            onKeyDown={(e) => handleReadingKeyDown(e, index, "after")}
                            className="w-20 px-2 py-0.5 border border-gray-300 rounded text-right font-mono
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="—"
                          />
                          <span className="text-gray-500 font-mono text-xs w-14">
                            {measurementValue !== null ? msToFraction(measurementValue) : ""}
                          </span>
                        </div>
                      )}
                    </td>
                    {showMultipleMeasurements && (
                      <td className="py-1.5 font-mono text-gray-600">
                        {formatRange(reading.measurementSamples) ?? "—"}
                      </td>
                    )}
                  </>
                ) : (
                  <>
                    <td className="py-1.5" onClick={showMultipleMeasurements ? undefined : (e) => e.stopPropagation()}>
                      {showMultipleMeasurements ? (
                        <span className="font-mono">
                          {formatAvgWithCount(reading.measurementSamples)}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            id={`reading-actual-${index}`}
                            value={measurementValue ?? ""}
                            onChange={(e) => handleAfterChange(reading.id, e.target.value)}
                            onKeyDown={(e) => handleReadingKeyDown(e, index, "actual")}
                            className="w-20 px-2 py-0.5 border border-gray-300 rounded text-right font-mono
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="—"
                          />
                          <span className="text-gray-500 font-mono text-xs w-14">
                            {measurementValue !== null ? msToFraction(measurementValue) : ""}
                          </span>
                        </div>
                      )}
                    </td>
                    {showMultipleMeasurements && (
                      <td className="py-1.5 font-mono text-gray-600">
                        {formatRange(reading.measurementSamples) ?? "—"}
                      </td>
                    )}
                  </>
                )}
                <td className={`py-1.5 font-mono ${evDiff !== null ? getEvColor(evDiff) : ""}`}>
                  {evDiff !== null ? formatEvDiff(evDiff) : "—"}
                </td>
              </tr>

              {/* Expanded Sub-rows */}
              {showMultipleMeasurements && isExpanded && (
                <>
                  {/* Individual samples */}
                  {Math.max(reading.beforeSamples.length, reading.measurementSamples.length) > 0 &&
                    Array.from({
                      length: Math.max(
                        reading.beforeSamples.length,
                        reading.measurementSamples.length
                      ),
                    }).map((_, sampleIndex) => (
                      <tr
                        key={`${reading.id}-sample-${sampleIndex}`}
                        className="bg-gray-50 border-b border-gray-100"
                      >
                        <td className="py-1"></td>
                        <td className="py-1 pl-4 text-gray-500 text-xs">#{sampleIndex + 1}</td>
                        {showBeforeColumn ? (
                          <>
                            {/* Before columns */}
                            <td className="py-1 font-mono text-gray-700">
                              {reading.beforeSamples[sampleIndex]?.toFixed(1) ?? "—"}
                            </td>
                            <td className="py-1"></td>
                            {/* After columns */}
                            <td className="py-1 font-mono text-gray-700">
                              {reading.measurementSamples[sampleIndex]?.toFixed(1) ?? "—"}
                            </td>
                            <td className="py-1"></td>
                          </>
                        ) : (
                          <>
                            <td className="py-1 font-mono text-gray-700">
                              {reading.measurementSamples[sampleIndex]?.toFixed(1) ?? "—"}
                            </td>
                            <td className="py-1"></td>
                          </>
                        )}
                        <td className="py-1">
                          <button
                            onClick={() => {
                              // Delete from both if index exists in both, otherwise from one
                              if (showBeforeColumn) {
                                if (sampleIndex < reading.beforeSamples.length) {
                                  handleDeleteSample(reading.id, "before", sampleIndex);
                                }
                                if (sampleIndex < reading.measurementSamples.length) {
                                  handleDeleteSample(reading.id, "measurement", sampleIndex);
                                }
                              } else {
                                handleDeleteSample(reading.id, "measurement", sampleIndex);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 text-xs px-1"
                            title="Delete sample"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}

                  {/* Add new sample row */}
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td className="py-1.5"></td>
                    <td className="py-1.5 pl-4 text-gray-500 text-xs">Add:</td>
                    {showBeforeColumn ? (
                      <>
                        {/* Before columns */}
                        <td className="py-1.5">
                          <input
                            type="number"
                            step="0.1"
                            value={newBeforeSample}
                            onChange={(e) => setNewBeforeSample(e.target.value)}
                            onKeyDown={(e) => handleSampleKeyDown(e, reading.id, "before")}
                            className="w-16 px-1 py-0.5 border border-gray-300 rounded text-right font-mono text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="—"
                          />
                        </td>
                        <td className="py-1.5"></td>
                        {/* After columns */}
                        <td className="py-1.5">
                          <input
                            type="number"
                            step="0.1"
                            value={newMeasurementSample}
                            onChange={(e) => setNewMeasurementSample(e.target.value)}
                            onKeyDown={(e) => handleSampleKeyDown(e, reading.id, "measurement")}
                            className="w-16 px-1 py-0.5 border border-gray-300 rounded text-right font-mono text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="—"
                          />
                        </td>
                        <td className="py-1.5"></td>
                      </>
                    ) : (
                      <>
                        <td className="py-1.5">
                          <input
                            type="number"
                            step="0.1"
                            value={newMeasurementSample}
                            onChange={(e) => setNewMeasurementSample(e.target.value)}
                            onKeyDown={(e) => handleSampleKeyDown(e, reading.id, "measurement")}
                            className="w-16 px-1 py-0.5 border border-gray-300 rounded text-right font-mono text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="—"
                          />
                        </td>
                        <td className="py-1.5"></td>
                      </>
                    )}
                    <td className="py-1.5"></td>
                  </tr>
                </>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={getColSpan()} className="pt-3">
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
