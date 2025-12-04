import {
  msToFraction,
  fractionToMs,
  calculateEvDifference,
} from "./shutter";

describe("msToFraction", () => {
  it("converts 1ms to 1/1000", () => {
    expect(msToFraction(1)).toBe("1/1000");
  });

  it("converts 2ms to 1/500", () => {
    expect(msToFraction(2)).toBe("1/500");
  });

  it("converts 1000ms to 1", () => {
    expect(msToFraction(1000)).toBe("1");
  });

  it("converts 2000ms to 2", () => {
    expect(msToFraction(2000)).toBe("2");
  });

  it("converts 500ms to 1/2", () => {
    expect(msToFraction(500)).toBe("1/2");
  });

  it("converts 8ms to 1/125", () => {
    expect(msToFraction(8)).toBe("1/125");
  });
});

describe("fractionToMs", () => {
  it("converts 1/1000 to 1ms", () => {
    expect(fractionToMs("1/1000")).toBe(1);
  });

  it("converts 1/500 to 2ms", () => {
    expect(fractionToMs("1/500")).toBe(2);
  });

  it("converts 1 to 1000ms", () => {
    expect(fractionToMs("1")).toBe(1000);
  });

  it("converts 2 to 2000ms", () => {
    expect(fractionToMs("2")).toBe(2000);
  });

  it("converts 1/125 to 8ms", () => {
    expect(fractionToMs("1/125")).toBe(8);
  });
});

describe("calculateEvDifference", () => {
  it("returns 0 when times are equal", () => {
    expect(calculateEvDifference(1000, 1000)).toBe(0);
  });

  it("returns -1 when actual is twice as fast (underexposed)", () => {
    expect(calculateEvDifference(1000, 500)).toBeCloseTo(-1, 2);
  });

  it("returns +1 when actual is half as fast (overexposed)", () => {
    expect(calculateEvDifference(1000, 2000)).toBeCloseTo(1, 2);
  });

  it("returns -2 when actual is 4x faster", () => {
    expect(calculateEvDifference(1000, 250)).toBeCloseTo(-2, 2);
  });

  it("handles fractional EV differences", () => {
    // 1.5x faster is about -0.58 EV (underexposed)
    expect(calculateEvDifference(1000, 667)).toBeCloseTo(-0.58, 1);
  });
});
