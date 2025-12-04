import { useState } from "react";
import { CameraMetadataForm } from "./components/CameraMetadataForm";
import { ShutterTestSection } from "./components/ShutterTestSection";
import { ActionsPerformed } from "./components/ActionsPerformed";
import { Notes } from "./components/Notes";
import { Sidebar } from "./components/Sidebar";
import { usePersistedCamera } from "./hooks/usePersistedCamera";

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  } = usePersistedCamera();

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
          <h1 className="text-2xl font-bold text-gray-900">
            Shutter Speed Report
          </h1>
        </div>
        <div className="space-y-4">
          <CameraMetadataForm metadata={metadata} onChange={setMetadata} />
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
