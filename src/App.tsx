import { useState } from "react";
import { CameraMetadataForm } from "./components/CameraMetadataForm";
import { CameraMetadata, createEmptyCameraMetadata } from "./types/CameraMetadata";

export function App() {
  const [metadata, setMetadata] = useState<CameraMetadata>(createEmptyCameraMetadata);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Shutter Speed Report
      </h1>
      <CameraMetadataForm metadata={metadata} onChange={setMetadata} />
    </div>
  );
}
