describe("Field Navigation", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("pressing Enter on Make field moves to Model field", () => {
    // Click Make field to start editing
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").should("be.focused");

    // Type and press Enter
    cy.get("#field-make").type("Canon{enter}");

    // Model field should now be active
    cy.get("#field-model").should("be.focused");
  });

  it("pressing Enter navigates through text fields in order", () => {
    // Start with Make
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").type("Canon{enter}");

    // Should be on Model
    cy.get("#field-model").should("be.focused");
    cy.get("#field-model").type("AE-1{enter}");

    // Should be on Serial
    cy.get("#field-serial").should("be.focused");
    cy.get("#field-serial").type("12345{enter}");

    // Should be on Customer
    cy.get("#field-customer").should("be.focused");
  });

  it("values are saved when navigating with Enter", () => {
    // Enter values navigating with Enter
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").type("Canon{enter}");
    cy.get("#field-model").type("F1{enter}");

    // Check values were saved
    cy.contains("Canon").should("exist");
    cy.contains("F1").should("exist");
  });

  it("fields have correct IDs for navigation", () => {
    // Verify all navigation fields have proper IDs
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").should("exist");
    cy.get("#field-make").blur();

    cy.contains("e.g. F3").click();
    cy.get("#field-model").should("exist");
    cy.get("#field-model").blur();

    cy.contains("e.g. 1234567").click();
    cy.get("#field-serial").should("exist");
    cy.get("#field-serial").blur();

    cy.contains("e.g. John Doe").click();
    cy.get("#field-customer").should("exist");
  });

  it("first reading input has correct ID in default mode", () => {
    cy.get("#reading-actual-0").should("exist");
  });

  it("pressing Enter in actual field moves to next actual field", () => {
    cy.get("#reading-actual-0").type("1.0{enter}");
    cy.get("#reading-actual-1").should("be.focused");
  });

  describe("with Before and After mode enabled", () => {
    beforeEach(() => {
      cy.contains("Before and After").click();
    });

    it("first reading inputs have correct IDs", () => {
      cy.get("#reading-before-0").should("exist");
      cy.get("#reading-after-0").should("exist");
    });

    it("pressing Enter in before field moves to next before field", () => {
      cy.get("#reading-before-0").type("1.0{enter}");
      cy.get("#reading-before-1").should("be.focused");
    });

    it("pressing Enter in last before field moves to first after field", () => {
      // Navigate to the last before field (index 10 for 11 readings)
      cy.get("#reading-before-10").type("1.0{enter}");
      cy.get("#reading-after-0").should("be.focused");
    });

    it("pressing Enter in after field moves to next after field", () => {
      cy.get("#reading-after-0").type("1.0{enter}");
      cy.get("#reading-after-1").should("be.focused");
    });

    it("pressing Enter navigates through before fields then after fields", () => {
      cy.get("#reading-before-0").type("1.0{enter}");
      cy.get("#reading-before-1").should("be.focused");
      cy.get("#reading-before-1").type("2.0{enter}");
      cy.get("#reading-before-2").should("be.focused");
    });
  });
});
