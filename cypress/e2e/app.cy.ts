describe("App", () => {
  it("loads the application", () => {
    cy.visit("/");
    cy.contains("Shutter Speed Report");
  });
});
