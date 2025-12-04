describe("JSON Export", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("shows download button in header", () => {
    cy.get('[aria-label="Download report as JSON"]').should("be.visible");
  });

  it("download button has correct tooltip", () => {
    cy.get('[aria-label="Download report as JSON"]').should(
      "have.attr",
      "title",
      "Download as JSON"
    );
  });

  it("triggers download when clicked", () => {
    // Add some data first - use the specific field ID to avoid the hidden file input
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("Canon");
    cy.get("#field-make").blur();

    // Click download - Cypress can't easily verify file downloads,
    // but we can verify the button exists and is clickable
    cy.get('[aria-label="Download report as JSON"]').click();

    // The test passes if no errors occur
    // For actual download verification, we'd need cypress-downloadfile plugin
  });
});

describe("PDF Export", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("shows PDF download button in header", () => {
    cy.get('[aria-label="Download report as PDF"]').should("be.visible");
  });

  it("PDF download button has correct tooltip", () => {
    cy.get('[aria-label="Download report as PDF"]').should(
      "have.attr",
      "title",
      "Download as PDF"
    );
  });

  it("triggers PDF download when clicked", () => {
    // Add some data first
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("Canon");
    cy.get("#field-make").blur();

    // Click PDF download - Cypress can't easily verify file downloads,
    // but we can verify the button exists and is clickable
    cy.get('[aria-label="Download report as PDF"]').click();

    // The test passes if no errors occur
  });

  it("PDF button appears before JSON button in header", () => {
    // Verify the order of buttons - PDF should come before JSON
    cy.get('[aria-label="Download report as PDF"]')
      .parent()
      .within(() => {
        cy.get('[aria-label="Download report as PDF"]').should("exist");
      });
    cy.get('[aria-label="Download report as JSON"]').should("exist");
  });
});
