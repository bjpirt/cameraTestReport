import { jest } from "@jest/globals";
import { downloadReportAsJson } from "./downloadJson";
import { CameraMetadata } from "../types/CameraMetadata";
import { ShutterReading } from "../types/ShutterReading";

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn(() => "blob:mock-url");
const mockRevokeObjectURL = jest.fn();
global.URL.createObjectURL = mockCreateObjectURL as typeof URL.createObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL as typeof URL.revokeObjectURL;

// Track created link elements
let lastCreatedLink: { href: string; download: string; click: jest.Mock };

// Mock document methods
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockCreateElement = jest.fn(() => {
  lastCreatedLink = {
    href: "",
    download: "",
    click: mockClick,
  };
  return lastCreatedLink;
});

Object.defineProperty(document, "createElement", { value: mockCreateElement });
Object.defineProperty(document.body, "appendChild", { value: mockAppendChild });
Object.defineProperty(document.body, "removeChild", { value: mockRemoveChild });

// Track blobs passed to createObjectURL
let lastCreatedBlob: Blob | null = null;
(mockCreateObjectURL as jest.Mock<(blob: Blob) => string>).mockImplementation(
  (blob: Blob) => {
    lastCreatedBlob = blob;
    return "blob:mock-url";
  }
);

describe("downloadReportAsJson", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMetadata = (
    overrides: Partial<CameraMetadata> = {}
  ): CameraMetadata => ({
    make: "Nikon",
    model: "F3",
    serialNumber: "12345",
    customerName: "Test User",
    serviceDate: "2024-01-15",
    createdTimestamp: "2024-01-15T10:00:00.000Z",
    ...overrides,
  });

  const createReadings = (): ShutterReading[] => [
    { id: "r1", expectedTime: "1/1000", measuredMs: 1.1 },
    { id: "r2", expectedTime: "1/500", measuredMs: 2.1 },
  ];

  it("creates a blob with JSON content", () => {
    const metadata = createMetadata();
    const readings = createReadings();
    const actions = ["Cleaned shutter"];
    const notes = "Test notes";

    downloadReportAsJson(metadata, readings, actions, notes);

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(lastCreatedBlob).toBeInstanceOf(Blob);
    expect(lastCreatedBlob?.type).toBe("application/json");
  });

  it("creates a link element and triggers download", () => {
    const metadata = createMetadata();
    downloadReportAsJson(metadata, createReadings(), [], "");

    expect(mockCreateElement).toHaveBeenCalledWith("a");
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
  });

  it("revokes the object URL after download", () => {
    const metadata = createMetadata();
    downloadReportAsJson(metadata, createReadings(), [], "");

    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("generates filename with make, model, serial, and date", () => {
    const metadata = createMetadata();
    downloadReportAsJson(metadata, createReadings(), [], "");

    expect(lastCreatedLink.download).toBe("nikon-f3-12345-2024-01-15.json");
  });

  it("generates filename with only available fields", () => {
    const metadata = createMetadata({
      make: "Canon",
      model: "",
      serialNumber: "",
      serviceDate: "",
    });
    downloadReportAsJson(metadata, createReadings(), [], "");

    expect(lastCreatedLink.download).toBe("canon.json");
  });

  it("uses default filename when no metadata is provided", () => {
    const metadata = createMetadata({
      make: "",
      model: "",
      serialNumber: "",
      serviceDate: "",
    });
    downloadReportAsJson(metadata, createReadings(), [], "");

    expect(lastCreatedLink.download).toBe("camera-report.json");
  });

  it("sanitizes special characters in filename", () => {
    const metadata = createMetadata({
      make: "Nikon/Canon",
      model: "F3 HP",
      serialNumber: "12@345!",
      serviceDate: "2024-01-15",
    });
    downloadReportAsJson(metadata, createReadings(), [], "");

    expect(lastCreatedLink.download).toBe("nikon-canon-f3-hp-12-345-2024-01-15.json");
  });

  it("handles metadata with leading/trailing special characters", () => {
    const metadata = createMetadata({
      make: "---Nikon---",
      model: "",
      serialNumber: "",
      serviceDate: "",
    });
    downloadReportAsJson(metadata, createReadings(), [], "");

    expect(lastCreatedLink.download).toBe("nikon.json");
  });
});
