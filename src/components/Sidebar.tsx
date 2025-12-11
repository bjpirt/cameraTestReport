import { useState, useRef } from "react";
import { StoredCamera } from "../utils/storage";
import { safeParseReport, type Report } from "../schemas/reportSchema";
import type { LiveDataMode } from "../types/CameraMetadata";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cameras: StoredCamera[];
  currentCameraId: string;
  onSelectCamera: (id: string) => void;
  onAddCamera: (liveDataMode?: LiveDataMode) => void;
  onDeleteCamera: (id: string) => void;
  onImportCamera: (data: Report) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  cameras,
  currentCameraId,
  onSelectCamera,
  onAddCamera,
  onDeleteCamera,
  onImportCamera,
}: SidebarProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showNewReportDropdown, setShowNewReportDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedCameras = [...cameras].sort((a, b) => {
    // Sort by service date first, then by createdTimestamp for same-day reports
    const dateA = a.metadata.serviceDate;
    const dateB = b.metadata.serviceDate;

    if (dateA !== dateB) {
      return new Date(dateB || 0).getTime() - new Date(dateA || 0).getTime();
    }

    // Same service date - sort by createdTimestamp (most recent first)
    const timestampA = a.metadata.createdTimestamp || a.createdAt;
    const timestampB = b.metadata.createdTimestamp || b.createdAt;
    return new Date(timestampB).getTime() - new Date(timestampA).getTime();
  });

  const getCameraDisplayName = (camera: StoredCamera): string => {
    const { make, model } = camera.metadata;
    if (make || model) {
      return [make, model].filter(Boolean).join(" ");
    }
    return "Untitled Report";
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      const isLastCamera = cameras.length <= 1;
      onDeleteCamera(id);
      setConfirmDeleteId(null);
      if (isLastCamera) {
        onClose();
      }
    } else {
      setConfirmDeleteId(id);
    }
  };

  const handleSelect = (id: string) => {
    onSelectCamera(id);
    onClose();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        const result = safeParseReport(data);

        if (result.success) {
          onImportCamera(result.data);
          onClose();
        } else {
          const errorMessages = result.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("\n");
          alert(`Invalid report file format:\n${errorMessages}`);
        }
      } catch {
        alert("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    event.target.value = "";
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Reports sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Reports</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Add New Button with Dropdown */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="flex">
                <button
                  onClick={() => onAddCamera()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-l hover:bg-blue-700
                    transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Report
                </button>
                <button
                  onClick={() => setShowNewReportDropdown(!showNewReportDropdown)}
                  className="px-2 py-2 bg-blue-600 text-white rounded-r border-l border-blue-500 hover:bg-blue-700
                    transition-colors"
                  aria-label="More options"
                  aria-expanded={showNewReportDropdown}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
              {showNewReportDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowNewReportDropdown(false);
                      onAddCamera("reveni");
                      onClose();
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Live Reveni Shutter Tester
                  </button>
                  <button
                    onClick={() => {
                      setShowNewReportDropdown(false);
                      handleImportClick();
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Import Saved JSON
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Camera List */}
          <div className="flex-1 overflow-y-auto">
            {sortedCameras.map((camera) => {
              const isSelected = camera.id === currentCameraId;
              const isConfirmingDelete = confirmDeleteId === camera.id;

              return (
                <div
                  key={camera.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50
                    ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}
                  onClick={() => handleSelect(camera.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          isSelected ? "text-blue-700" : "text-gray-800"
                        }`}
                      >
                        {getCameraDisplayName(camera)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {camera.metadata.serviceDate || "No date"}
                      </p>
                      {camera.metadata.customerName && (
                        <p className="text-sm text-gray-400 truncate">
                          {camera.metadata.customerName}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(camera.id);
                      }}
                      className={`ml-2 p-1 rounded transition-colors ${
                        isConfirmingDelete
                          ? "bg-red-600 text-white"
                          : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                      }`}
                      aria-label={
                        isConfirmingDelete
                          ? "Confirm delete"
                          : "Delete report"
                      }
                      title={
                        isConfirmingDelete
                          ? "Click again to confirm"
                          : "Delete report"
                      }
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500">
              {cameras.length} report{cameras.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
