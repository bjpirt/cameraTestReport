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
    // Enter 1ms in the actual field for 1/1000
    cy.get("#reading-actual-0").type("1");
    cy.contains("+0.00"); // EV diff should be 0
  });

  it("shows EV difference with color coding", () => {
    // Enter a value that's off by more than 0.5 EV
    // 1/1000 expects 1ms, entering 3ms would be ~1.58 EV off
    cy.get("#reading-actual-0").type("3");
    cy.get(".text-red-600").should("exist");
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
    // 1/2000 should appear before 1/1000 (it's faster)
    cy.get("tbody tr").first().should("contain", "1/2000");
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
      cy.get("#reading-after-0").type("1");
      cy.contains("+0.00");
    });

    it("shows EV difference with color coding", () => {
      cy.get("#reading-after-0").type("3");
      cy.get(".text-red-600").should("exist");
    });
  });
});
