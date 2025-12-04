describe("App", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("loads the application", () => {
    cy.contains("Shutter Speed Report");
  });

  describe("Camera Metadata", () => {
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
      cy.get("input").first().clear().type("Canon");
      cy.get("input").first().blur();
      cy.contains("Canon");
    });

    it("defaults service date to today", () => {
      const today = new Date().toISOString().split("T")[0];
      cy.contains(today).should("exist");
    });
  });

  describe("Shutter Speed Readings", () => {
    it("displays shutter speed table with standard speeds", () => {
      cy.contains("Shutter Speed Readings");
      cy.contains("1/1000");
      cy.contains("1/500");
      cy.contains("1/250");
      cy.contains("1/60");
    });

    it("displays table headers", () => {
      cy.contains("Expected");
      cy.contains("Measured (ms)");
      cy.contains("Actual");
      cy.contains("EV Diff");
    });

    it("calculates actual time and EV difference when measurement entered", () => {
      // Find the input for 1/1000 (first row) and enter 1ms
      cy.get('input[type="number"]').first().type("1");
      cy.contains("1/1000"); // actual should show 1/1000
      cy.contains("+0.00"); // EV diff should be 0
    });

    it("shows EV difference with color coding", () => {
      // Enter a value that's off by more than 0.5 EV
      // 1/1000 expects 1ms, entering 3ms would be ~1.58 EV off
      cy.get('input[type="number"]').first().type("3");
      cy.get(".text-red-600").should("exist");
    });

    it("allows adding custom shutter speeds", () => {
      cy.get('input[placeholder="e.g. 1/2000"]').type("1/2000");
      cy.contains("button", "Add").click();
      cy.contains("1/2000").should("exist");
      cy.contains("0 of 12 readings");
    });

    it("adds custom speed in sorted order", () => {
      cy.get('input[placeholder="e.g. 1/2000"]').type("1/2000");
      cy.contains("button", "Add").click();
      // 1/2000 should appear before 1/1000 (it's faster)
      cy.get("tbody tr").first().should("contain", "1/2000");
    });

    it("prevents adding duplicate speeds", () => {
      cy.get('input[placeholder="e.g. 1/2000"]').type("1/1000");
      cy.contains("button", "Add").click();
      // Should still only have 11 readings (duplicate not added)
      cy.contains("0 of 11 readings");
    });
  });

  describe("Shutter Speed Graph", () => {
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

  describe("Persistence", () => {
    beforeEach(() => {
      // Clear localStorage before each persistence test
      cy.clearLocalStorage();
      cy.visit("/");
    });

    it("persists camera metadata after page reload", () => {
      // Edit the make field
      cy.contains("e.g. Nikon").click();
      cy.get("input").first().clear().type("Canon");
      cy.get("input").first().blur();

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
      cy.get("input").first().clear().type("Pentax");
      cy.get("input").first().blur();

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

  describe("Actions Performed", () => {
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

    it("first reading input has correct ID", () => {
      cy.get("#reading-input-0").should("exist");
    });

    it("pressing Enter in measurement field moves to next measurement", () => {
      cy.get("#reading-input-0").type("1.0{enter}");
      cy.get("#reading-input-1").should("be.focused");
    });

    it("pressing Enter navigates through all measurement fields", () => {
      cy.get("#reading-input-0").type("1.0{enter}");
      cy.get("#reading-input-1").should("be.focused");
      cy.get("#reading-input-1").type("2.0{enter}");
      cy.get("#reading-input-2").should("be.focused");
    });
  });

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
      cy.get("input").first().clear().type("Canon");
      cy.get("input").first().blur();

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
      cy.get("input").first().clear().type("Canon");
      cy.get("input").first().blur();

      // Create second report with different data
      cy.get('[aria-label="Open reports menu"]').click();
      cy.contains("New Report").click();
      cy.get('[aria-label="Close sidebar"]').click();

      cy.contains("e.g. Nikon").click();
      cy.get("input").first().clear().type("Nikon");
      cy.get("input").first().blur();

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

    it("cannot delete the last report", () => {
      cy.get('[aria-label="Open reports menu"]').click();
      cy.contains("1 report").should("exist");

      // Try to delete the only report
      cy.get('[aria-label="Delete report"]').click();
      cy.get('[aria-label="Confirm delete"]').click();

      // Should still have 1 report
      cy.contains("1 report").should("exist");
    });

    it("displays reports sorted by service date (most recent first)", () => {
      // Create first report with an older date
      cy.contains("e.g. Nikon").click();
      cy.get("input").first().clear().type("OldCamera");
      cy.get("input").first().blur();

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
      cy.get("input").first().clear().type("NewCamera");
      cy.get("input").first().blur();

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
      cy.get("input").first().clear().type("Canon");
      cy.get("input").first().blur();

      cy.get('[aria-label="Open reports menu"]').click();
      cy.contains("New Report").click();
      cy.get('[aria-label="Close sidebar"]').click();

      cy.contains("e.g. Nikon").click();
      cy.get("input").first().clear().type("Nikon");
      cy.get("input").first().blur();

      // Reload
      cy.reload();

      // Verify both reports still exist
      cy.get('[aria-label="Open reports menu"]').click();
      cy.contains("2 reports").should("exist");
      cy.contains("Canon").should("exist");
      cy.contains("Nikon").should("exist");
    });
  });
});
