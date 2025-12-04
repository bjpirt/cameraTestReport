import { useState } from "react";

interface ActionsPerformedProps {
  actions: string[];
  onChange: (actions: string[]) => void;
}

export function ActionsPerformed({ actions, onChange }: ActionsPerformedProps) {
  const [newAction, setNewAction] = useState("");

  const handleAddAction = () => {
    const trimmed = newAction.trim();
    if (!trimmed) return;

    onChange([...actions, trimmed]);
    setNewAction("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAction();
    }
  };

  const handleRemoveAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Actions Performed
      </h2>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter action..."
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddAction}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Add
          </button>
        </div>
        {actions.length > 0 ? (
          <ul className="space-y-1">
            {actions.map((action, index) => (
              <li
                key={index}
                className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded text-sm"
              >
                <span>{action}</span>
                <button
                  onClick={() => handleRemoveAction(index)}
                  className="text-gray-400 hover:text-red-600 ml-2"
                  aria-label="Remove action"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 italic">No actions recorded</p>
        )}
      </div>
    </div>
  );
}
