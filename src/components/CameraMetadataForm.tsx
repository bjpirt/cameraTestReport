import { CameraMetadata } from "../types/CameraMetadata";
import { EditableField } from "./EditableField";

interface CameraMetadataFormProps {
  metadata: CameraMetadata;
  onChange: (metadata: CameraMetadata) => void;
  onNavigateToReadings?: () => void;
}

const focusField = (fieldId: string) => {
  // Try to click the display div to start editing, or focus the input if already editing
  const displayDiv = document.querySelector(`[data-field-id="${fieldId}"]`);
  if (displayDiv) {
    (displayDiv as HTMLElement).click();
  } else {
    const input = document.getElementById(fieldId);
    if (input) {
      input.focus();
    }
  }
};

export function CameraMetadataForm({
  metadata,
  onChange,
  onNavigateToReadings,
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
            inputId="field-make"
            onNext={() => focusField("field-model")}
          />
          <EditableField
            label="Model"
            value={metadata.model}
            onChange={updateField("model")}
            placeholder="e.g. F3"
            inputId="field-model"
            onNext={() => focusField("field-serial")}
          />
          <EditableField
            label="Serial Number"
            value={metadata.serialNumber}
            onChange={updateField("serialNumber")}
            placeholder="e.g. 1234567"
            inputId="field-serial"
            onNext={() => focusField("field-customer")}
          />
        </div>
        <div>
          <EditableField
            label="Customer Name"
            value={metadata.customerName}
            onChange={updateField("customerName")}
            placeholder="e.g. John Doe"
            inputId="field-customer"
            onNext={() => focusField("field-date")}
          />
          <EditableField
            label="Service Date"
            value={metadata.serviceDate}
            onChange={updateField("serviceDate")}
            type="date"
            inputId="field-date"
            onNext={onNavigateToReadings}
          />
        </div>
      </div>
    </div>
  );
}
