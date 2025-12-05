import { useState, useCallback, useRef } from "react";
import { CameraMetadataForm } from "./components/CameraMetadataForm";
import { ShutterTestSection } from "./components/ShutterTestSection";
import { ActionsPerformed } from "./components/ActionsPerformed";
import { Notes } from "./components/Notes";
import { Sidebar } from "./components/Sidebar";
import { usePersistedCamera } from "./hooks/usePersistedCamera";
import { downloadReportAsJson } from "./utils/downloadJson";
import { downloadReportAsPdf } from "./utils/downloadPdf";
import { ShutterGraphRef } from "./components/ShutterGraph";

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const graphRef = useRef<ShutterGraphRef>(null);

  const handleNavigateToReadings = useCallback(() => {
    const firstInput = document.getElementById("reading-input-0");
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const {
    metadata,
    readings,
    actions,
    notes,
    showBeforeColumn,
    showMultipleMeasurements,
    setMetadata,
    setReadings,
    setActions,
    setNotes,
    setShowBeforeColumn,
    setShowMultipleMeasurements,
    cameras,
    currentCameraId,
    onAddCamera,
    onDeleteCamera,
    onSelectCamera,
    onImportCamera,
  } = usePersistedCamera();

  const handleDownloadJson = useCallback(() => {
    downloadReportAsJson(metadata, readings, actions, notes);
  }, [metadata, readings, actions, notes]);

  const handleDownloadPdf = useCallback(async () => {
    let graphImageDataUrl: string | undefined;

    if (graphRef.current) {
      const dataUrl = await graphRef.current.captureAsDataUrl();
      if (dataUrl) {
        graphImageDataUrl = dataUrl;
      }
    }

    await downloadReportAsPdf({
      metadata,
      readings,
      actions,
      notes,
      showBeforeColumn,
      showMultipleMeasurements,
      graphImageDataUrl,
    });
  }, [metadata, readings, actions, notes, showBeforeColumn, showMultipleMeasurements]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        cameras={cameras}
        currentCameraId={currentCameraId}
        onSelectCamera={onSelectCamera}
        onAddCamera={onAddCamera}
        onDeleteCamera={onDeleteCamera}
        onImportCamera={onImportCamera}
      />

      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            aria-label="Open reports menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">
            Camera Test Report
          </h1>
          <button
            onClick={handleDownloadPdf}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            aria-label="Download report as PDF"
            title="Download as PDF"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 21h12a2 2 0 002-2V8l-5-5H6a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            onClick={handleDownloadJson}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            aria-label="Download report as JSON"
            title="Download as JSON"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <CameraMetadataForm
            metadata={metadata}
            onChange={setMetadata}
            onNavigateToReadings={handleNavigateToReadings}
          />
          <ShutterTestSection
            ref={graphRef}
            readings={readings}
            onChange={setReadings}
            showBeforeColumn={showBeforeColumn}
            onShowBeforeColumnChange={setShowBeforeColumn}
            showMultipleMeasurements={showMultipleMeasurements}
            onShowMultipleMeasurementsChange={setShowMultipleMeasurements}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ActionsPerformed actions={actions} onChange={setActions} />
            <Notes notes={notes} onChange={setNotes} />
          </div>
        </div>
      </div>
    </div>
  );
}
