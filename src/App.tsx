import { CameraMetadataForm } from "./components/CameraMetadataForm";
import { ShutterTestSection } from "./components/ShutterTestSection";
import { ActionsPerformed } from "./components/ActionsPerformed";
import { usePersistedCamera } from "./hooks/usePersistedCamera";

export function App() {
  const { metadata, readings, actions, setMetadata, setReadings, setActions } =
    usePersistedCamera();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Shutter Speed Report
      </h1>
      <div className="space-y-4">
        <CameraMetadataForm metadata={metadata} onChange={setMetadata} />
        <ShutterTestSection readings={readings} onChange={setReadings} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ActionsPerformed actions={actions} onChange={setActions} />
        </div>
      </div>
    </div>
  );
}
