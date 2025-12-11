import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions, Content, TableCell } from "pdfmake/interfaces";
import { CameraMetadata } from "../types/CameraMetadata";
import { ShutterReading } from "../types/ShutterReading";
import { fractionToMs, calculateEvDifference } from "./shutter";
import { calculateAverage } from "./statistics";

// Initialize pdfmake with fonts
pdfMake.vfs = pdfFonts.vfs;

interface PdfReportOptions {
  metadata: CameraMetadata;
  readings: ShutterReading[];
  actions: string[];
  notes: string;
  showBeforeColumn: boolean;
  showMultipleMeasurements: boolean;
  graphImageDataUrl?: string;
}

export async function downloadReportAsPdf(
  options: PdfReportOptions
): Promise<void> {
  const { metadata, readings, actions, notes, showBeforeColumn, showMultipleMeasurements, graphImageDataUrl } = options;

  const docDefinition = createDocumentDefinition(
    metadata,
    readings,
    actions,
    notes,
    showBeforeColumn,
    showMultipleMeasurements,
    graphImageDataUrl
  );

  const filename = generateFilename(metadata);
  pdfMake.createPdf(docDefinition).download(filename);
}

function createDocumentDefinition(
  metadata: CameraMetadata,
  readings: ShutterReading[],
  actions: string[],
  notes: string,
  showBeforeColumn: boolean,
  showMultipleMeasurements: boolean,
  graphImageDataUrl?: string
): TDocumentDefinitions {
  const content: Content[] = [
    // Title
    {
      text: "Camera Test Report",
      style: "title",
      alignment: "center",
      margin: [0, 0, 0, 20],
    },

    // Camera Information Section
    createMetadataSection(metadata),
  ];

  // Graph Section (if image provided) - before readings table
  if (graphImageDataUrl) {
    content.push(createGraphSection(graphImageDataUrl));
  }

  // Shutter Speed Readings Section
  content.push(createReadingsSection(readings, showBeforeColumn, showMultipleMeasurements));

  // Actions Section
  if (actions.length > 0) {
    content.push(createActionsSection(actions));
  }

  // Notes Section
  if (notes.trim()) {
    content.push(createNotesSection(notes));
  }

  // Footer with generation date
  content.push({
    text: `Generated: ${new Date().toLocaleString()}`,
    style: "footer",
    alignment: "right",
    margin: [0, 30, 0, 0],
  });

  return {
    content,
    styles: {
      title: {
        fontSize: 18,
        bold: true,
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        margin: [0, 10, 0, 4],
      },
      tableHeader: {
        bold: true,
        fontSize: 9,
        fillColor: "#f3f4f6",
      },
      tableCell: {
        fontSize: 9,
      },
      label: {
        fontSize: 10,
        color: "#6b7280",
      },
      value: {
        fontSize: 11,
      },
      footer: {
        fontSize: 9,
        color: "#9ca3af",
      },
    },
    defaultStyle: {
      font: "Roboto",
    },
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
  };
}

function createMetadataSection(metadata: CameraMetadata): Content {
  const rows: Content[][] = [];

  if (metadata.make || metadata.model) {
    rows.push([
      { text: "Camera:", style: "label" },
      {
        text: [metadata.make, metadata.model].filter(Boolean).join(" ") || "—",
        style: "value",
      },
    ]);
  }

  if (metadata.serialNumber) {
    rows.push([
      { text: "Serial Number:", style: "label" },
      { text: metadata.serialNumber, style: "value" },
    ]);
  }

  if (metadata.customerName) {
    rows.push([
      { text: "Customer:", style: "label" },
      { text: metadata.customerName, style: "value" },
    ]);
  }

  if (metadata.serviceDate) {
    rows.push([
      { text: "Service Date:", style: "label" },
      { text: metadata.serviceDate, style: "value" },
    ]);
  }

  if (rows.length === 0) {
    return { text: "" };
  }

  return {
    stack: [
      { text: "Camera Information", style: "sectionHeader" },
      {
        table: {
          widths: [100, "*"],
          body: rows,
        },
        layout: "noBorders",
      },
    ],
  };
}

function createReadingsSection(
  readings: ShutterReading[],
  showBeforeColumn: boolean,
  showMultipleMeasurements: boolean
): Content {
  // Helper to format average with count
  const formatAvgWithCount = (samples: number[]): string => {
    const avg = calculateAverage(samples);
    if (avg === null) return "—";
    return showMultipleMeasurements && samples.length > 1
      ? `${avg.toFixed(1)} (${samples.length})`
      : avg.toFixed(1);
  };

  // Build header row
  let headerRow: TableCell[];
  let widths: string[];

  if (showMultipleMeasurements) {
    if (showBeforeColumn) {
      // Group before columns, then after columns
      headerRow = [
        { text: "Expected", style: "tableHeader", alignment: "center" },
        { text: "Before (ms)", style: "tableHeader", alignment: "center" },
        { text: "After (ms)", style: "tableHeader", alignment: "center" },
        { text: "EV Diff", style: "tableHeader", alignment: "center" },
      ];
      widths = ["*", "*", "*", "*"];
    } else {
      headerRow = [
        { text: "Expected", style: "tableHeader", alignment: "center" },
        { text: "Actual (ms)", style: "tableHeader", alignment: "center" },
        { text: "EV Diff", style: "tableHeader", alignment: "center" },
      ];
      widths = ["*", "*", "*"];
    }
  } else {
    if (showBeforeColumn) {
      headerRow = [
        { text: "Expected", style: "tableHeader", alignment: "center" },
        { text: "Before (ms)", style: "tableHeader", alignment: "center" },
        { text: "After (ms)", style: "tableHeader", alignment: "center" },
        { text: "EV Diff", style: "tableHeader", alignment: "center" },
      ];
      widths = ["*", "*", "*", "*"];
    } else {
      headerRow = [
        { text: "Expected", style: "tableHeader", alignment: "center" },
        { text: "Actual (ms)", style: "tableHeader", alignment: "center" },
        { text: "EV Diff", style: "tableHeader", alignment: "center" },
      ];
      widths = ["*", "*", "*"];
    }
  }

  const dataRows: TableCell[][] = readings.map((reading) => {
    const expectedMs = fractionToMs(reading.expectedTime);
    const measurementAvg = calculateAverage(reading.measurementSamples);
    const beforeAvg = calculateAverage(reading.beforeSamples);
    let evDiff = "—";
    let evColor = "#000000";

    if (measurementAvg !== null) {
      const ev = calculateEvDifference(expectedMs, measurementAvg);
      const sign = ev > 0 ? "+" : "";
      evDiff = `${sign}${ev.toFixed(2)}`;

      const absEv = Math.abs(ev);
      if (absEv > 0.5) {
        evColor = "#dc2626"; // red
      } else if (absEv > 0.25) {
        evColor = "#f59e0b"; // amber
      } else {
        evColor = "#16a34a"; // green
      }
    }

    if (showMultipleMeasurements) {
      if (showBeforeColumn) {
        // Group before columns, then after columns
        return [
          { text: reading.expectedTime, style: "tableCell", alignment: "center" },
          { text: formatAvgWithCount(reading.beforeSamples), style: "tableCell", alignment: "center" },
          { text: formatAvgWithCount(reading.measurementSamples), style: "tableCell", alignment: "center" },
          { text: evDiff, style: "tableCell", alignment: "center", color: evColor },
        ];
      } else {
        return [
          { text: reading.expectedTime, style: "tableCell", alignment: "center" },
          { text: formatAvgWithCount(reading.measurementSamples), style: "tableCell", alignment: "center" },
          { text: evDiff, style: "tableCell", alignment: "center", color: evColor },
        ];
      }
    } else {
      if (showBeforeColumn) {
        return [
          { text: reading.expectedTime, style: "tableCell", alignment: "center" },
          { text: beforeAvg?.toFixed(1) ?? "—", style: "tableCell", alignment: "center" },
          { text: measurementAvg?.toFixed(1) ?? "—", style: "tableCell", alignment: "center" },
          { text: evDiff, style: "tableCell", alignment: "center", color: evColor },
        ];
      } else {
        return [
          { text: reading.expectedTime, style: "tableCell", alignment: "center" },
          { text: measurementAvg?.toFixed(1) ?? "—", style: "tableCell", alignment: "center" },
          { text: evDiff, style: "tableCell", alignment: "center", color: evColor },
        ];
      }
    }
  });

  return {
    stack: [
      { text: "Shutter Speed Readings", style: "sectionHeader" },
      {
        table: {
          headerRows: 1,
          widths,
          body: [headerRow, ...dataRows],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#e5e7eb",
          vLineColor: () => "#e5e7eb",
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 2,
          paddingBottom: () => 2,
        },
      },
      { text: "", pageBreak: "after" },
    ],
  };
}

function createGraphSection(graphImageDataUrl: string): Content {
  return {
    stack: [
      { text: "Shutter Speed Graph", style: "sectionHeader" },
      {
        image: graphImageDataUrl,
        width: 500,
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
    ],
  };
}

function createActionsSection(actions: string[]): Content {
  return {
    stack: [
      { text: "Actions Performed", style: "sectionHeader" },
      {
        ul: actions,
        fontSize: 11,
        margin: [0, 0, 0, 0],
      },
    ],
  };
}

function createNotesSection(notes: string): Content {
  return {
    stack: [
      { text: "Notes", style: "sectionHeader" },
      {
        text: notes,
        fontSize: 11,
        margin: [0, 0, 0, 0],
      },
    ],
  };
}

function generateFilename(metadata: CameraMetadata): string {
  const parts: string[] = [];

  if (metadata.make) {
    parts.push(sanitizeForFilename(metadata.make));
  }
  if (metadata.model) {
    parts.push(sanitizeForFilename(metadata.model));
  }
  if (metadata.serialNumber) {
    parts.push(sanitizeForFilename(metadata.serialNumber));
  }

  if (parts.length === 0) {
    parts.push("camera-report");
  }

  if (metadata.serviceDate) {
    parts.push(metadata.serviceDate);
  }

  return `${parts.join("-")}.pdf`;
}

function sanitizeForFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Utility function to convert an SVG element to a data URL
export async function svgToDataUrl(svgElement: SVGElement): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    // Get SVG dimensions
    const svgRect = svgElement.getBoundingClientRect();
    const scale = 2; // Higher resolution for better quality
    canvas.width = svgRect.width * scale;
    canvas.height = svgRect.height * scale;

    // Create image from SVG
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, svgRect.width, svgRect.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const dataUrl = canvas.toDataURL("image/png");
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG image"));
    };
    img.src = url;
  });
}
