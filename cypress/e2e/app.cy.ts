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
  });

  describe("Shutter Speed Graph", () => {
    it("displays graph placeholder", () => {
      cy.contains("Shutter Speed Graph");
      cy.contains("Graph Placeholder");
    });

    it("shows reading count", () => {
      cy.contains("0 of 11 readings");
    });

    it("updates reading count when measurements added", () => {
      cy.get('input[type="number"]').first().type("1");
      cy.contains("1 of 11 readings");
    });
  });
});
