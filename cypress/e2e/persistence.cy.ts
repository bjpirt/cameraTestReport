describe("Persistence", () => {
  beforeEach(() => {
    // Clear localStorage before each persistence test
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("persists camera metadata after page reload", () => {
    // Edit the make field
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("Canon");
    cy.get("#field-make").blur();

    // Verify the change is visible
    cy.contains("Canon").should("exist");

    // Reload the page
    cy.reload();

    // Verify the data persisted
    cy.contains("Canon").should("exist");
  });

  it("persists shutter readings after page reload", () => {
    // Enter a measurement
    cy.get('input[type="number"]').first().type("1.2");

    // Verify it's visible
    cy.get('input[type="number"]').first().should("have.value", "1.2");

    // Reload the page
    cy.reload();

    // Verify the reading persisted
    cy.get('input[type="number"]').first().should("have.value", "1.2");
  });

  it("persists custom shutter speeds after page reload", () => {
    // Add a custom speed
    cy.get('input[placeholder="e.g. 1/2000"]').type("1/2000");
    cy.contains("button", "Add").click();

    // Verify it was added
    cy.contains("1/2000").should("exist");
    cy.contains("0 of 12 readings");

    // Reload the page
    cy.reload();

    // Verify the custom speed persisted
    cy.contains("1/2000").should("exist");
    cy.contains("0 of 12 readings");
  });

  it("persists multiple changes together", () => {
    // Make multiple changes
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("Pentax");
    cy.get("#field-make").blur();

    cy.get('input[type="number"]').eq(0).type("1.1");
    cy.get('input[type="number"]').eq(1).type("2.1");

    // Reload
    cy.reload();

    // Verify all changes persisted
    cy.contains("Pentax").should("exist");
    cy.get('input[type="number"]').eq(0).should("have.value", "1.1");
    cy.get('input[type="number"]').eq(1).should("have.value", "2.1");
  });

  it("persists actions after page reload", () => {
    // Add an action - use Enter key to avoid ambiguous Add button
    cy.get('input[placeholder="Enter action..."]').type("Cleaned shutter{enter}");

    // Verify it was added
    cy.contains("Cleaned shutter").should("exist");

    // Reload
    cy.reload();

    // Verify the action persisted
    cy.contains("Cleaned shutter").should("exist");
  });
});
