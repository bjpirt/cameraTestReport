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
      cy.get("body").click(); // blur
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
});
