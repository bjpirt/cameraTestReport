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

  it("displays table headers", () => {
    cy.contains("Expected");
    cy.contains("Measured (ms)");
    cy.contains("Actual");
    cy.contains("EV Diff");
  });

  it("calculates actual time and EV difference when measurement entered", () => {
    // Find the input for 1/1000 (first row) and enter 1ms
    cy.get('input[type="number"]').first().type("1");
    cy.contains("1/1000"); // actual should show 1/1000
    cy.contains("+0.00"); // EV diff should be 0
  });

  it("shows EV difference with color coding", () => {
    // Enter a value that's off by more than 0.5 EV
    // 1/1000 expects 1ms, entering 3ms would be ~1.58 EV off
    cy.get('input[type="number"]').first().type("3");
    cy.get(".text-red-600").should("exist");
  });

  it("allows adding custom shutter speeds", () => {
    cy.get('input[placeholder="e.g. 1/2000"]').type("1/2000");
    cy.contains("button", "Add").click();
    cy.contains("1/2000").should("exist");
    cy.contains("0 of 12 readings");
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
    cy.contains("0 of 11 readings");
  });
});
