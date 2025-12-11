describe("Shutter Speed Readings", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays shutter speed table with standard speeds", () => {
    cy.contains("Shutter Speed Readings");
    cy.contains("1/1000");
    cy.contains("1/500");
    cy.contains("1/250");
    cy.contains("1/60");
  });

  it("displays table headers with Actual column by default", () => {
    cy.contains("Expected");
    cy.contains("Actual (ms)");
    cy.contains("EV Diff");
    cy.contains("Before (ms)").should("not.exist");
    cy.contains("After (ms)").should("not.exist");
  });

  it("shows Before and After columns when checkbox is checked", () => {
    cy.contains("Before and After").click();
    cy.contains("Before (ms)");
    cy.contains("After (ms)");
    cy.contains("Actual (ms)").should("not.exist");
  });

  it("calculates EV difference when actual measurement entered", () => {
    // Enter 1000ms in the actual field for 1s (index 0, first row - slowest speed)
    cy.get("#reading-actual-0").type("1000");
    cy.contains("+0.00"); // EV diff should be 0
  });

  it("shows EV difference with speed-dependent color coding", () => {
    // Table is ordered slow to fast: 1, 1/2, 1/4, 1/8, 1/15, 1/30, 1/60, 1/125, 1/250, 1/500, 1/1000
    // Index 10 is 1/1000 (fastest), Index 6 is 1/60

    // Fast speeds (< 1/125) have ±0.333 EV tolerance
    // 1/1000 (index 10) expects 1ms, entering 1.2ms is ~0.26 EV off (within 0.333 tolerance) -> green
    cy.get("#reading-actual-10").type("1.2");
    cy.get("tbody tr").filter(":contains('1/1000')").first()
      .find(".text-green-600").should("exist");

    // 1/1000 with 1.5ms is ~0.58 EV off (outside 0.333 tolerance) -> red
    cy.get("#reading-actual-10").clear().type("1.5");
    cy.get("tbody tr").filter(":contains('1/1000')").first()
      .find(".text-red-600").should("exist");

    // Slow speeds (>= 1/125) have ±0.25 EV tolerance
    // 1/60 (index 6) expects ~16.67ms, entering 19ms is ~0.19 EV off (within 0.25 tolerance) -> green
    cy.get("#reading-actual-6").type("19");
    cy.get("tbody tr").filter(":contains('1/60')").first()
      .find(".text-green-600").should("exist");

    // 1/60 with 22ms is ~0.40 EV off (outside 0.25 tolerance) -> red
    cy.get("#reading-actual-6").clear().type("22");
    cy.get("tbody tr").filter(":contains('1/60')").first()
      .find(".text-red-600").should("exist");
  });

  it("allows adding custom shutter speeds", () => {
    cy.get('input[placeholder="e.g. 1/2000"]').type("1/2000");
    cy.contains("button", "Add").click();
    cy.contains("1/2000").should("exist");
    // Verify we now have 12 rows (11 default + 1 custom)
    cy.get("tbody tr").should("have.length", 12);
  });

  it("adds custom speed in sorted order", () => {
    cy.get('input[placeholder="e.g. 1/2000"]').type("1/2000");
    cy.contains("button", "Add").click();
    // 1/2000 should appear after 1/1000 (it's faster, and table goes slow to fast)
    cy.get("tbody tr").last().should("contain", "1/2000");
  });

  it("prevents adding duplicate speeds", () => {
    cy.get('input[placeholder="e.g. 1/2000"]').type("1/1000");
    cy.contains("button", "Add").click();
    // Should still only have 11 readings (duplicate not added)
    cy.get("tbody tr").should("have.length", 11);
  });

  describe("with Before and After mode enabled", () => {
    beforeEach(() => {
      cy.contains("Before and After").click();
    });

    it("calculates EV difference when after measurement entered", () => {
      // First row is 1s (1000ms expected)
      cy.get("#reading-after-0").type("1000");
      cy.contains("+0.00");
    });

    it("shows EV difference with speed-dependent color coding", () => {
      // Fast speed (1/1000 at index 10): 0.333 EV tolerance
      // 1.2ms is ~0.26 EV off -> green
      cy.get("#reading-after-10").type("1.2");
      cy.get("tbody tr").filter(":contains('1/1000')").first()
        .find(".text-green-600").should("exist");

      // 1.5ms is ~0.58 EV off -> red
      cy.get("#reading-after-10").clear().type("1.5");
      cy.get("tbody tr").filter(":contains('1/1000')").first()
        .find(".text-red-600").should("exist");
    });
  });
});
