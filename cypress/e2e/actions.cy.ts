describe("Actions Performed", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays actions section", () => {
    cy.contains("Actions Performed");
  });

  it("shows empty state when no actions", () => {
    cy.clearLocalStorage();
    cy.visit("/");
    cy.contains("No actions recorded");
  });

  it("allows adding actions", () => {
    cy.clearLocalStorage();
    cy.visit("/");
    // Use Enter key to add action
    cy.get('input[placeholder="Enter action..."]').type("Replaced curtain{enter}");
    cy.contains("Replaced curtain").should("exist");
  });

  it("allows removing actions", () => {
    cy.clearLocalStorage();
    cy.visit("/");
    // Use Enter key to add action
    cy.get('input[placeholder="Enter action..."]').type("Test action{enter}");
    cy.contains("Test action").should("exist");

    cy.get('[aria-label="Remove action"]').click();
    cy.contains("Test action").should("not.exist");
    cy.contains("No actions recorded").should("exist");
  });
});
