/**
 * Parses Reveni shutter tester output.
 * The tester outputs tab-separated values: left/top, center, right/bottom
 * Example: "868.63\t868.36\t865.06"
 * We use the center value.
 */
export function parseReveniLine(line: string): number | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Split by tab
  const parts = trimmed.split("\t");
  if (parts.length !== 3) return null;

  // Parse the center value (index 1)
  const centerValue = parseFloat(parts[1]);
  if (isNaN(centerValue)) return null;

  return centerValue;
}

/**
 * Determines which column to add the reading to based on the current state.
 * If showBeforeColumn is true and not all speeds have the same number of "before" readings
 * as "after" readings, add to "before". Otherwise add to "after" (or "measurement" in single mode).
 *
 * The logic is: we fill "before" until all speeds have at least one reading,
 * then when before and after have equal counts for all speeds, we switch to "after".
 */
export function determineTargetColumn(
  readings: { beforeSamples: number[]; measurementSamples: number[] }[],
  showBeforeColumn: boolean
): "before" | "measurement" {
  if (!showBeforeColumn) {
    return "measurement";
  }

  // Check if all speeds have at least one before reading
  const allHaveBefore = readings.every((r) => r.beforeSamples.length > 0);

  // Check if all speeds have the same number of before and after readings
  const allEqual = readings.every(
    (r) => r.beforeSamples.length === r.measurementSamples.length
  );

  // If all have before and they're all equal, we're done with "before" and should add to "after"
  // Otherwise we're still filling "before"
  return allHaveBefore && allEqual ? "measurement" : "before";
}
