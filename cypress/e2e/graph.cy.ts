describe("Shutter Speed Graph", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays graph section", () => {
    cy.contains("Shutter Speed Graph");
  });

  it("shows reading count", () => {
    cy.contains("Before: 0 | After: 0 of 11");
  });

  it("updates reading count when before measurement added", () => {
    cy.get("#reading-before-0").type("1");
    cy.contains("Before: 1 | After: 0 of 11");
  });

  it("updates reading count when after measurement added", () => {
    cy.get("#reading-after-0").type("1");
    cy.contains("Before: 0 | After: 1 of 11");
  });

  it("renders chart with Y-axis showing EV values", () => {
    // Check for Y-axis labels
    cy.get(".recharts-yAxis").should("exist");
  });

  it("renders chart with X-axis showing shutter speeds", () => {
    // Check for X-axis with shutter speed labels
    cy.get(".recharts-xAxis").should("exist");
    cy.contains("1/1000");
  });
});
