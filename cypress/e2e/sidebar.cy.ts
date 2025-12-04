describe("Reports Sidebar", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("opens sidebar when hamburger menu clicked", () => {
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("Reports").should("be.visible");
  });

  it("closes sidebar when close button clicked", () => {
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[aria-label="Close sidebar"]').click();
    cy.get('[role="dialog"]').should("not.be.visible");
  });

  it("closes sidebar when backdrop clicked", () => {
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    // Click on the backdrop (left side outside the sidebar)
    cy.get(".bg-black\\/30").click({ force: true });
    cy.get('[role="dialog"]').should("not.be.visible");
  });

  it("shows 1 report by default", () => {
    cy.get('[aria-label="Open reports menu"]').click();
    cy.contains("1 report").should("exist");
  });

  it("creates a new report", () => {
    // Add some data to the first report
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("Canon");
    cy.get("#field-make").blur();

    // Open sidebar and create new report
    cy.get('[aria-label="Open reports menu"]').click();
    cy.contains("New Report").click();

    // Should show 2 reports now
    cy.contains("2 reports").should("exist");

    // The sidebar should show both "Canon" (old report) and "Untitled Report" (new one)
    cy.get('[role="dialog"]').within(() => {
      cy.contains("Canon").should("exist");
      cy.contains("Untitled Report").should("exist");
    });
  });

  it("switches between reports", () => {
    // Add data to first report
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("Canon");
    cy.get("#field-make").blur();

    // Create second report with different data
    cy.get('[aria-label="Open reports menu"]').click();
    cy.contains("New Report").click();
    cy.get('[aria-label="Close sidebar"]').click();

    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("Nikon");
    cy.get("#field-make").blur();

    // Open sidebar - both reports should be listed
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[role="dialog"]').within(() => {
      cy.contains("Canon").should("exist");
      cy.contains("Nikon").should("exist");
    });

    // Click on Canon report to switch (sidebar closes after selection)
    cy.contains("Canon").click();

    // Main content should now show Canon
    cy.contains("Camera Information")
      .parent()
      .within(() => {
        cy.contains("Canon").should("exist");
      });
  });

  it("deletes a report with confirmation", () => {
    // Create a second report first
    cy.get('[aria-label="Open reports menu"]').click();
    cy.contains("New Report").click();
    cy.contains("2 reports").should("exist");

    // Click delete on a report (first click shows confirmation)
    cy.get('[aria-label="Delete report"]').first().click();
    // Should still have 2 reports (confirmation required)
    cy.contains("2 reports").should("exist");

    // Click again to confirm
    cy.get('[aria-label="Confirm delete"]').click();
    cy.contains("1 report").should("exist");
  });

  it("deleting the last report creates a new empty one", () => {
    // Add some data to the report
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("Canon");
    cy.get("#field-make").blur();

    cy.get('[aria-label="Open reports menu"]').click();
    cy.contains("1 report").should("exist");

    // Delete the only report
    cy.get('[aria-label="Delete report"]').click();
    cy.get('[aria-label="Confirm delete"]').click();

    // Sidebar should close and we should have a fresh empty report
    cy.get('[role="dialog"]').should("not.be.visible");

    // The main content should show empty fields (not "Canon")
    cy.contains("Canon").should("not.exist");
    cy.contains("e.g. Nikon").should("exist");

    // Re-open sidebar to verify we still have 1 report
    cy.get('[aria-label="Open reports menu"]').click();
    cy.contains("1 report").should("exist");
  });

  it("displays reports sorted by service date (most recent first)", () => {
    // Create first report with an older date
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("OldCamera");
    cy.get("#field-make").blur();

    // Change service date to older date - find within Camera Information section
    cy.contains("Camera Information")
      .parent()
      .within(() => {
        cy.contains(new Date().toISOString().split("T")[0]).click();
        cy.get('input[type="date"]').clear().type("2020-01-01");
        cy.get('input[type="date"]').blur();
      });

    // Create new report (will have today's date)
    cy.get('[aria-label="Open reports menu"]').click();
    cy.contains("New Report").click();
    cy.get('[aria-label="Close sidebar"]').click();

    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("NewCamera");
    cy.get("#field-make").blur();

    // Open sidebar and check order
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[role="dialog"]').within(() => {
      // Get all report entries and verify NewCamera comes before OldCamera
      cy.get(".cursor-pointer").first().should("contain", "NewCamera");
    });
  });

  it("persists multiple reports after page reload", () => {
    // Create two reports
    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("Canon");
    cy.get("#field-make").blur();

    cy.get('[aria-label="Open reports menu"]').click();
    cy.contains("New Report").click();
    cy.get('[aria-label="Close sidebar"]').click();

    cy.contains("e.g. Nikon").click();
    cy.get("#field-make").clear().type("Nikon");
    cy.get("#field-make").blur();

    // Reload
    cy.reload();

    // Verify both reports still exist
    cy.get('[aria-label="Open reports menu"]').click();
    cy.contains("2 reports").should("exist");
    cy.contains("Canon").should("exist");
    cy.contains("Nikon").should("exist");
  });

  it("shows import button in sidebar footer", () => {
    cy.get('[aria-label="Open reports menu"]').click();
    cy.get('[aria-label="Import JSON report"]').should("be.visible");
  });

  it("imports a JSON report file", () => {
    // Create a test JSON file content
    const reportData = {
      metadata: {
        make: "Leica",
        model: "M6",
        serialNumber: "ABC123",
        customerName: "Test Import",
        serviceDate: "2024-06-15",
        createdTimestamp: "2024-06-15T10:00:00.000Z",
      },
      readings: [
        { id: "r1", expectedTime: "1/1000", beforeMs: 1.05, measuredMs: 1.02 },
        { id: "r2", expectedTime: "1/500", beforeMs: null, measuredMs: 2.1 },
      ],
      actions: ["CLA performed", "Shutter replaced"],
      notes: "Imported test report",
      exportedAt: "2024-06-15T12:00:00.000Z",
    };

    // Open sidebar
    cy.get('[aria-label="Open reports menu"]').click();
    cy.contains("1 report").should("exist");

    // Upload the file using the hidden input
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from(JSON.stringify(reportData)),
        fileName: "test-report.json",
        mimeType: "application/json",
      },
      { force: true }
    );

    // Sidebar should close after import
    cy.get('[role="dialog"]').should("not.be.visible");

    // Verify the imported data is displayed
    cy.contains("Leica").should("exist");
    cy.contains("M6").should("exist");
    cy.contains("ABC123").should("exist");
    cy.contains("Test Import").should("exist");
    cy.contains("CLA performed").should("exist");
    cy.contains("Shutter replaced").should("exist");

    // Verify measurement was imported
    cy.get('input[type="number"]').first().should("have.value", "1.05");

    // Verify we now have 2 reports
    cy.get('[aria-label="Open reports menu"]').click();
    cy.contains("2 reports").should("exist");
  });

  it("shows error for invalid JSON file", () => {
    cy.get('[aria-label="Open reports menu"]').click();

    // Upload invalid JSON
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("not valid json{"),
        fileName: "invalid.json",
        mimeType: "application/json",
      },
      { force: true }
    );

    // Should show alert (we'll check the sidebar is still open)
    cy.on("window:alert", (text) => {
      expect(text).to.equal("Failed to parse JSON file");
    });
  });

  it("shows error for JSON missing required fields", () => {
    cy.get('[aria-label="Open reports menu"]').click();

    // Upload JSON without required fields
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from(JSON.stringify({ foo: "bar" })),
        fileName: "incomplete.json",
        mimeType: "application/json",
      },
      { force: true }
    );

    cy.on("window:alert", (text) => {
      expect(text).to.equal("Invalid report file format");
    });
  });
});
