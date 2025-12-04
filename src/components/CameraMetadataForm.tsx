import { CameraMetadata } from "../types/CameraMetadata";
import { EditableField } from "./EditableField";

interface CameraMetadataFormProps {
  metadata: CameraMetadata;
  onChange: (metadata: CameraMetadata) => void;
}

export function CameraMetadataForm({
  metadata,
  onChange,
}: CameraMetadataFormProps) {
  const updateField = (field: keyof CameraMetadata) => (value: string) => {
    onChange({ ...metadata, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Camera Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <div>
          <EditableField
            label="Make"
            value={metadata.make}
            onChange={updateField("make")}
            placeholder="e.g. Nikon"
          />
          <EditableField
            label="Model"
            value={metadata.model}
            onChange={updateField("model")}
            placeholder="e.g. F3"
          />
          <EditableField
            label="Serial Number"
            value={metadata.serialNumber}
            onChange={updateField("serialNumber")}
            placeholder="e.g. 1234567"
          />
        </div>
        <div>
          <EditableField
            label="Customer Name"
            value={metadata.customerName}
            onChange={updateField("customerName")}
            placeholder="e.g. John Doe"
          />
          <EditableField
            label="Service Date"
            value={metadata.serviceDate}
            onChange={updateField("serviceDate")}
            type="date"
          />
        </div>
      </div>
    </div>
  );
}
