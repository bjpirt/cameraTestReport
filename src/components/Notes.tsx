interface NotesProps {
  notes: string;
  onChange: (notes: string) => void;
}

export function Notes({ notes, onChange }: NotesProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Notes</h2>
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter any additional notes..."
        className="flex-1 w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
