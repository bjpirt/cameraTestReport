import { useEffect, useRef, useState, useCallback } from "react";
import { ShutterReading } from "../types/ShutterReading";
import { parseReveniLine, determineTargetColumn } from "../utils/reveniParser";

interface LiveDataInputProps {
  readings: ShutterReading[];
  onChange: (readings: ShutterReading[]) => void;
  showBeforeColumn: boolean;
  selectedSpeedId: string | null;
  onSelectSpeed: (id: string | null) => void;
}

export function LiveDataInput({
  readings,
  onChange,
  showBeforeColumn,
  selectedSpeedId,
  onSelectSpeed,
}: LiveDataInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputBuffer, setInputBuffer] = useState("");
  const [lastAddedValue, setLastAddedValue] = useState<number | null>(null);

  // User can override the auto-determined target column
  const [manualTargetColumn, setManualTargetColumn] = useState<"before" | "measurement" | null>(null);

  // Determine which column we're currently filling (use manual override if set)
  const autoTargetColumn = determineTargetColumn(readings, showBeforeColumn);
  const targetColumn = manualTargetColumn ?? autoTargetColumn;

  // Get the currently selected reading
  const selectedReading = readings.find((r) => r.id === selectedSpeedId);
  const selectedIndex = readings.findIndex((r) => r.id === selectedSpeedId);

  // Add a sample to the selected speed
  const addSample = useCallback(
    (value: number) => {
      if (!selectedSpeedId) return;

      onChange(
        readings.map((r) => {
          if (r.id !== selectedSpeedId) return r;
          if (targetColumn === "before") {
            return { ...r, beforeSamples: [...r.beforeSamples, value] };
          } else {
            return { ...r, measurementSamples: [...r.measurementSamples, value] };
          }
        })
      );

      setLastAddedValue(value);
    },
    [selectedSpeedId, readings, onChange, targetColumn]
  );

  // Advance to next speed
  const advanceToNextSpeed = useCallback(() => {
    if (selectedIndex < readings.length - 1) {
      onSelectSpeed(readings[selectedIndex + 1].id);
    }
  }, [selectedIndex, readings, onSelectSpeed]);

  // Handle input changes - just update buffer, wait for Enter to process
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputBuffer(e.target.value);
    },
    []
  );

  // Handle paste events
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedText = e.clipboardData.getData("text");
      const parsed = parseReveniLine(pastedText);
      if (parsed !== null && selectedSpeedId) {
        e.preventDefault();
        addSample(parsed);
        setInputBuffer("");
      }
    },
    [selectedSpeedId, addSample]
  );

  // Handle special keys: Tab (insert into buffer) and Enter (process input or advance)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        // Insert tab character at cursor position
        const input = e.currentTarget;
        const start = input.selectionStart ?? inputBuffer.length;
        const end = input.selectionEnd ?? inputBuffer.length;
        const newValue = inputBuffer.slice(0, start) + "\t" + inputBuffer.slice(end);
        setInputBuffer(newValue);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (inputBuffer.trim() === "") {
          // Empty input - advance to next speed
          advanceToNextSpeed();
        } else {
          // Try to parse current buffer as Reveni data
          const parsed = parseReveniLine(inputBuffer);
          if (parsed !== null && selectedSpeedId) {
            addSample(parsed);
            setInputBuffer("");
          }
        }
      }
    },
    [inputBuffer, selectedSpeedId, addSample, advanceToNextSpeed]
  );

  // Focus the input when a speed is selected
  useEffect(() => {
    if (selectedSpeedId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedSpeedId]);

  // Get count of samples for current column
  const getSampleCount = (reading: ShutterReading) => {
    return targetColumn === "before"
      ? reading.beforeSamples.length
      : reading.measurementSamples.length;
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-5 h-5 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <span className="font-medium text-yellow-800">
          Live Reveni Shutter Tester Mode
        </span>
        {showBeforeColumn && (
          <span className="text-sm text-yellow-600 ml-2 flex items-center gap-1">
            Adding to:
            <select
              value={targetColumn}
              onChange={(e) => setManualTargetColumn(e.target.value as "before" | "measurement")}
              className="ml-1 px-2 py-0.5 text-sm border border-yellow-300 rounded bg-white
                focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="before">Before</option>
              <option value="measurement">After</option>
            </select>
          </span>
        )}
      </div>

      {selectedSpeedId ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Selected speed:{" "}
              <strong className="text-gray-800">
                {selectedReading?.expectedTime}
              </strong>
              <span className="text-gray-500 ml-2">
                ({getSampleCount(selectedReading!)} samples)
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputBuffer}
              onChange={handleInputChange}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              placeholder="Waiting for Reveni data..."
              className="flex-1 px-3 py-2 border border-yellow-300 rounded bg-white
                focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                font-mono text-sm"
            />
            {lastAddedValue !== null && (
              <span className="text-sm text-green-600 font-mono">
                Added: {lastAddedValue.toFixed(2)}ms
              </span>
            )}
          </div>
          <p className="text-xs text-yellow-700">
            Click on a shutter speed row to select it, then input data from the Reveni tester.
          </p>
        </div>
      ) : (
        <p className="text-sm text-yellow-700">
          Click on a shutter speed row below to start entering data.
        </p>
      )}
    </div>
  );
}
