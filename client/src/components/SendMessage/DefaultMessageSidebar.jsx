import { useEffect, useState } from "react";

function DefaultMessageSidebar({ onSelect, onEdit, onDelete, defaulMessages }) {

  return (
    <div className="w-72 p-4 bg-(--sidebar) border-l border-(--border) overflow-auto">
      <h3 className="mb-3 font-semibold text-(--text-primary)">
        Templates
      </h3>

      {defaulMessages.length === 0 && (
        <p className="text-sm text-(--text-secondary)">
          No templates found
        </p>
      )}

      {defaulMessages.map((m, i) => (
        <div
          key={i}
          className="p-3 mb-3 rounded-lg border border-(--border) hover:bg-(--bg-secondary)"
        >
          <div onClick={() => onSelect(m.message)} className="cursor-pointer">
            <p className="font-medium text-(--text-primary)">
              {m.title}
            </p>
            <p className="text-sm text-(--text-secondary) line-clamp-2">
              {m.message}
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => onEdit(i, m)}
              className="text-blue-500 text-sm hover:underline"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(m._id)} 
              className="text-red-500 text-sm hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DefaultMessageSidebar;