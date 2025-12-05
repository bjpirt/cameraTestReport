/**
 * Calculate the average of an array of numbers.
 * Returns null if the array is empty.
 */
export function calculateAverage(samples: number[]): number | null {
  if (samples.length === 0) return null;
  const sum = samples.reduce((acc, val) => acc + val, 0);
  return sum / samples.length;
}

/**
 * Calculate the sample standard deviation of an array of numbers.
 * Returns null if fewer than 2 samples (need at least 2 for meaningful std dev).
 */
export function calculateStdDev(samples: number[]): number | null {
  if (samples.length < 2) return null;
  const avg = calculateAverage(samples);
  if (avg === null) return null;
  const squaredDiffs = samples.map((val) => Math.pow(val - avg, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / (samples.length - 1);
  return Math.sqrt(variance);
}

/**
 * Get the minimum value from an array of numbers.
 * Returns null if the array is empty.
 */
export function calculateMin(samples: number[]): number | null {
  if (samples.length === 0) return null;
  return Math.min(...samples);
}

/**
 * Get the maximum value from an array of numbers.
 * Returns null if the array is empty.
 */
export function calculateMax(samples: number[]): number | null {
  if (samples.length === 0) return null;
  return Math.max(...samples);
}

/**
 * Format a min-max range string from an array of numbers.
 * Returns null if the array is empty.
 * Example: [1.0, 1.05, 1.02] -> "1.0-1.1"
 */
export function formatRange(samples: number[]): string | null {
  const min = calculateMin(samples);
  const max = calculateMax(samples);
  if (min === null || max === null) return null;
  return `${min.toFixed(1)}-${max.toFixed(1)}`;
}

/**
 * Get the first sample value or null if empty.
 * Useful for single-measurement mode compatibility.
 */
export function getFirstSample(samples: number[]): number | null {
  return samples.length > 0 ? samples[0] : null;
}
