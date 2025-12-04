describe("Camera Metadata", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays camera information section", () => {
    cy.contains("Camera Information");
    cy.contains("Make");
    cy.contains("Model");
    cy.contains("Serial Number");
    cy.contains("Customer Name");
    cy.contains("Service Date");
  });

  it("allows editing metadata fields", () => {
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("Canon");
    cy.get("#field-make").blur();
    cy.contains("Canon");
  });

  it("defaults service date to today", () => {
    const today = new Date().toISOString().split("T")[0];
    cy.contains(today).should("exist");
  });
});
