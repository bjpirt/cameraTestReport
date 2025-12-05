import {
  calculateAverage,
  calculateStdDev,
  calculateMin,
  calculateMax,
  formatRange,
  getFirstSample,
} from "./statistics";

describe("statistics", () => {
  describe("calculateAverage", () => {
    it("returns null for empty array", () => {
      expect(calculateAverage([])).toBeNull();
    });

    it("returns the value for single element", () => {
      expect(calculateAverage([5])).toBe(5);
    });

    it("calculates average correctly", () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
    });

    it("handles decimal values", () => {
      expect(calculateAverage([1.0, 1.5, 2.0])).toBeCloseTo(1.5);
    });
  });

  describe("calculateStdDev", () => {
    it("returns null for empty array", () => {
      expect(calculateStdDev([])).toBeNull();
    });

    it("returns null for single element", () => {
      expect(calculateStdDev([5])).toBeNull();
    });

    it("returns 0 for identical values", () => {
      expect(calculateStdDev([5, 5, 5])).toBe(0);
    });

    it("calculates sample std dev correctly", () => {
      // Sample std dev of [2, 4, 4, 4, 5, 5, 7, 9] = 2.138...
      const samples = [2, 4, 4, 4, 5, 5, 7, 9];
      expect(calculateStdDev(samples)).toBeCloseTo(2.138, 2);
    });

    it("handles two values", () => {
      // Sample std dev of [1, 3] = sqrt(2) ≈ 1.414
      expect(calculateStdDev([1, 3])).toBeCloseTo(1.414, 2);
    });
  });

  describe("calculateMin", () => {
    it("returns null for empty array", () => {
      expect(calculateMin([])).toBeNull();
    });

    it("returns the value for single element", () => {
      expect(calculateMin([5])).toBe(5);
    });

    it("finds minimum correctly", () => {
      expect(calculateMin([3, 1, 4, 1, 5])).toBe(1);
    });

    it("handles negative values", () => {
      expect(calculateMin([-3, -1, -4])).toBe(-4);
    });
  });

  describe("calculateMax", () => {
    it("returns null for empty array", () => {
      expect(calculateMax([])).toBeNull();
    });

    it("returns the value for single element", () => {
      expect(calculateMax([5])).toBe(5);
    });

    it("finds maximum correctly", () => {
      expect(calculateMax([3, 1, 4, 1, 5])).toBe(5);
    });

    it("handles negative values", () => {
      expect(calculateMax([-3, -1, -4])).toBe(-1);
    });
  });

  describe("formatRange", () => {
    it("returns null for empty array", () => {
      expect(formatRange([])).toBeNull();
    });

    it("formats single value as range", () => {
      expect(formatRange([1.5])).toBe("1.5-1.5");
    });

    it("formats range correctly", () => {
      expect(formatRange([1.0, 1.05, 1.02])).toBe("1.0-1.1");
    });

    it("formats with proper decimal places", () => {
      expect(formatRange([1, 2])).toBe("1.0-2.0");
    });
  });

  describe("getFirstSample", () => {
    it("returns null for empty array", () => {
      expect(getFirstSample([])).toBeNull();
    });

    it("returns first element", () => {
      expect(getFirstSample([1, 2, 3])).toBe(1);
    });

    it("returns the value for single element", () => {
      expect(getFirstSample([5])).toBe(5);
    });
  });
});
