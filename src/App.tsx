import { useState, useCallback } from "react";
import { CameraMetadataForm } from "./components/CameraMetadataForm";
import { ShutterTestSection } from "./components/ShutterTestSection";
import { ActionsPerformed } from "./components/ActionsPerformed";
import { Notes } from "./components/Notes";
import { Sidebar } from "./components/Sidebar";
import { usePersistedCamera } from "./hooks/usePersistedCamera";
import { downloadReportAsJson } from "./utils/downloadJson";

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setMetadata,
    setReadings,
    setActions,
    setNotes,
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
          <ShutterTestSection readings={readings} onChange={setReadings} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ActionsPerformed actions={actions} onChange={setActions} />
            <Notes notes={notes} onChange={setNotes} />
          </div>
        </div>
      </div>
    </div>
  );
}
