import { parseReveniLine, determineTargetColumn } from "./reveniParser";

describe("parseReveniLine", () => {
  it("parses valid tab-separated Reveni output", () => {
    expect(parseReveniLine("868.63\t868.36\t865.06")).toBe(868.36);
  });

  it("returns center value from three tab-separated numbers", () => {
    expect(parseReveniLine("1.0\t2.5\t3.0")).toBe(2.5);
  });

  it("handles decimal values correctly", () => {
    expect(parseReveniLine("0.25\t0.30\t0.28")).toBe(0.3);
  });

  it("returns null for empty string", () => {
    expect(parseReveniLine("")).toBeNull();
  });

  it("returns null for whitespace only", () => {
    expect(parseReveniLine("   ")).toBeNull();
  });

  it("returns null for invalid format (wrong number of values)", () => {
    expect(parseReveniLine("868.63\t868.36")).toBeNull();
    expect(parseReveniLine("868.63")).toBeNull();
    expect(parseReveniLine("868.63\t868.36\t865.06\t900.00")).toBeNull();
  });

  it("returns null for non-numeric values", () => {
    expect(parseReveniLine("abc\tdef\tghi")).toBeNull();
  });

  it("trims whitespace from input", () => {
    expect(parseReveniLine("  868.63\t868.36\t865.06  ")).toBe(868.36);
  });
});

describe("determineTargetColumn", () => {
  it("returns 'measurement' when showBeforeColumn is false", () => {
    const readings = [
      { beforeSamples: [], measurementSamples: [] },
    ];
    expect(determineTargetColumn(readings, false)).toBe("measurement");
  });

  it("returns 'before' when before samples are empty and showBeforeColumn is true", () => {
    const readings = [
      { beforeSamples: [], measurementSamples: [] },
      { beforeSamples: [], measurementSamples: [] },
    ];
    expect(determineTargetColumn(readings, true)).toBe("before");
  });

  it("returns 'before' when some before samples but fewer than after", () => {
    const readings = [
      { beforeSamples: [1.0], measurementSamples: [1.0, 1.1] },
      { beforeSamples: [2.0], measurementSamples: [2.0] },
    ];
    expect(determineTargetColumn(readings, true)).toBe("before");
  });

  it("returns 'measurement' when all speeds have equal before and after counts", () => {
    const readings = [
      { beforeSamples: [1.0], measurementSamples: [1.0] },
      { beforeSamples: [2.0], measurementSamples: [2.0] },
    ];
    expect(determineTargetColumn(readings, true)).toBe("measurement");
  });

  it("returns 'measurement' when all speeds have 3 before and 3 after", () => {
    const readings = [
      { beforeSamples: [1.0, 1.1, 1.2], measurementSamples: [1.0, 1.1, 1.2] },
      { beforeSamples: [2.0, 2.1, 2.2], measurementSamples: [2.0, 2.1, 2.2] },
    ];
    expect(determineTargetColumn(readings, true)).toBe("measurement");
  });

  it("returns 'before' when counts are not equal across all speeds", () => {
    const readings = [
      { beforeSamples: [1.0], measurementSamples: [1.0] },
      { beforeSamples: [2.0, 2.1], measurementSamples: [2.0] },
    ];
    expect(determineTargetColumn(readings, true)).toBe("before");
  });
});
