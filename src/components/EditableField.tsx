import { useState, useRef, useEffect } from "react";

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date" | "textarea";
}

export function EditableField({
  label,
  value,
  onChange,
  placeholder = "Click to edit",
  type = "text",
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (draft !== value) {
      onChange(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setDraft(value);
      setIsEditing(false);
    }
  };

  const baseInputClasses =
    "flex-1 px-2 py-0.5 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const displayClasses =
    "flex-1 px-2 py-0.5 rounded cursor-pointer hover:bg-gray-100 text-sm";

  return (
    <div className="flex items-center gap-2 mb-2">
      <label className="text-sm font-medium text-gray-600 w-28 shrink-0">
        {label}
      </label>
      {isEditing ? (
        type === "textarea" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`${baseInputClasses} resize-none`}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={baseInputClasses}
          />
        )
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={displayClasses}
        >
          {value || (
            <span className="text-gray-400 italic">{placeholder}</span>
          )}
        </div>
      )}
    </div>
  );
}
