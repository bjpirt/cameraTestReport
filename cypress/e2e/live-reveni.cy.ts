describe("Live Reveni Shutter Tester Mode", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("creates a new Live Reveni report with correct defaults", () => {
    // Open sidebar and create Live Reveni report
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[aria-label="More options"]').click();
    cy.contains("Live Reveni Shutter Tester").should("be.visible").click();

    // Sidebar should close
    cy.get('[role="dialog"]').should("not.be.visible");

    // Live data input panel should be visible
    cy.contains("Live Reveni Shutter Tester Mode").should("be.visible");

    // Multiple Measurements checkbox should be checked by default
    cy.contains("Multiple Measurements")
      .parent()
      .find('input[type="checkbox"]')
      .should("be.checked");

    // Should show instruction to click a speed row
    cy.contains("Click on a shutter speed row below to start entering data").should(
      "be.visible"
    );
  });

  it("selects speed row, shows input field, highlights and expands row", () => {
    // Create Live Reveni report
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[aria-label="More options"]').click();
    cy.contains("Live Reveni Shutter Tester").click();

    // Click on 1/1000 row
    cy.contains("1/1000").click();

    // Input field should appear and be focused
    cy.get('input[placeholder="Waiting for Reveni data..."]')
      .should("be.visible")
      .should("be.focused");
    cy.contains("Selected speed:").should("be.visible");

    // Row should have yellow highlight and be expanded
    cy.get("tbody tr").filter(":contains('1/1000')").first()
      .should("have.class", "bg-yellow-100")
      .should("contain", "▼");
  });

  it("enters data, shows confirmation, and allows multiple samples", () => {
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[aria-label="More options"]').click();
    cy.contains("Live Reveni Shutter Tester").click();
    cy.contains("1/1000").click();

    // Type Reveni format data and press Enter
    cy.get('input[placeholder="Waiting for Reveni data..."]')
      .type("868.63\t868.36\t865.06{enter}");

    // Should show confirmation with center value and clear input
    cy.contains("Added: 868.36ms").should("be.visible");
    cy.get('input[placeholder="Waiting for Reveni data..."]').should("have.value", "");

    // Should still be on 1/1000 (no auto-advance)
    cy.contains("Selected speed:").parent().should("contain", "1/1000");
    cy.contains("1 samples").should("be.visible");

    // Add second sample
    cy.get('input[placeholder="Waiting for Reveni data..."]')
      .type("100.00\t210.00\t300.00{enter}");
    cy.contains("2 samples").should("be.visible");
  });

  it("advances to next speed on empty Enter and switches rows correctly", () => {
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[aria-label="More options"]').click();
    cy.contains("Live Reveni Shutter Tester").click();
    cy.contains("1/1000").click();

    // Enter data
    cy.get('input[placeholder="Waiting for Reveni data..."]')
      .type("868.63\t868.36\t865.06{enter}");

    // Press Enter with empty input to advance
    cy.get('input[placeholder="Waiting for Reveni data..."]').type("{enter}");
    cy.contains("Selected speed:").parent().should("contain", "1/500");

    // 1/500 should be expanded, 1/1000 collapsed
    cy.get("tbody tr").filter(":contains('1/500')").first().should("contain", "▼");
    cy.get("tbody tr").filter(":contains('1/1000')").first().should("contain", "▶");

    // Input should still be focused
    cy.get('input[placeholder="Waiting for Reveni data..."]').should("be.focused");

    // Click to switch to different speed
    cy.contains("1/250").click();
    cy.contains("Selected speed:").parent().should("contain", "1/250");
  });

  it("handles Before and After mode with column selection", () => {
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[aria-label="More options"]').click();
    cy.contains("Live Reveni Shutter Tester").click();

    // Adding to dropdown should not be visible initially
    cy.contains("Adding to:").should("not.exist");

    // Enable Before and After
    cy.contains("Before and After").click();

    // Dropdown should appear and default to "Before"
    cy.contains("Adding to:").should("be.visible");
    cy.get("select").should("have.value", "before");

    // Select a speed and add data to Before
    cy.contains("1/1000").click();
    cy.get('input[placeholder="Waiting for Reveni data..."]')
      .type("100.00\t200.00\t300.00{enter}");

    // Switch to After column and add data
    cy.get("select").select("measurement");
    cy.get('input[placeholder="Waiting for Reveni data..."]')
      .type("100.00\t150.00\t300.00{enter}");

    // Both values should be visible in expanded view
    cy.get("tbody tr.bg-gray-50").first().within(() => {
      cy.contains("200.0").should("be.visible");
      cy.contains("150.0").should("be.visible");
    });
  });

  it("handles paste with Reveni format data", () => {
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[aria-label="More options"]').click();
    cy.contains("Live Reveni Shutter Tester").click();
    cy.contains("1/1000").click();

    const reveniData = "868.63\t868.36\t865.06";
    cy.get('input[placeholder="Waiting for Reveni data..."]')
      .invoke("val", reveniData)
      .trigger("paste", {
        clipboardData: {
          getData: () => reveniData,
        },
      });

    cy.contains("Added: 868.36ms").should("be.visible");
  });

  it("persists Live Reveni mode and data after page reload", () => {
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[aria-label="More options"]').click();
    cy.contains("Live Reveni Shutter Tester").click();

    cy.contains("1/1000").click();
    cy.get('input[placeholder="Waiting for Reveni data..."]')
      .type("100.00\t200.00\t300.00{enter}");

    cy.reload();

    // Live mode should still be active
    cy.contains("Live Reveni Shutter Tester Mode").should("be.visible");

    // Data should persist - click to expand and verify
    cy.contains("1/1000").click();
    cy.contains("200.0").should("be.visible");
  });
});
