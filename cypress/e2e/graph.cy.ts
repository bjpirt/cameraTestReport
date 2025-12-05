describe("Shutter Speed Graph", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays graph section", () => {
    cy.contains("Shutter Speed Graph");
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
