describe("Shutter Speed Graph", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays graph section", () => {
    cy.contains("Shutter Speed Graph");
  });

  it("shows reading count", () => {
    cy.contains("0 of 11 readings");
  });

  it("updates reading count when measurements added", () => {
    cy.get('input[type="number"]').first().type("1");
    cy.contains("1 of 11 readings");
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
