export function msToFraction(ms: number): string {
  if (ms >= 1000) {
    const seconds = ms / 1000;
    return seconds === Math.floor(seconds) ? String(seconds) : seconds.toFixed(1);
  }
  const denominator = Math.round(1000 / ms);
  return `1/${denominator}`;
}

export function fractionToMs(fraction: string): number {
  if (fraction.includes("/")) {
    const [numerator, denominator] = fraction.split("/").map(Number);
    return (numerator / denominator) * 1000;
  }
  return Number(fraction) * 1000;
}

export function calculateEvDifference(expectedMs: number, actualMs: number): number {
  if (expectedMs === actualMs) return 0;
  // Positive EV = slower shutter = more exposure (overexposed)
  // Negative EV = faster shutter = less exposure (underexposed)
  return Math.log2(actualMs / expectedMs);
}
