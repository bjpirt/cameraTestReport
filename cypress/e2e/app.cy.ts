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
});
