import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "../Button";

function DefaultMessageSidebar({ onSelect, onEdit, onDelete, defaulMessages }) {
  return (
    <div className="w-72 min-h-screen max-h-screen p-4 bg-(--sidebar) border-r border-(--border) overflow-y-auto">
      <h3 className="mb-3 font-semibold text-(--text-primary)">Templates</h3>

      {defaulMessages.length === 0 && (
        <p className="text-sm text-(--text-secondary)">No templates found</p>
      )}

      {defaulMessages.map((m, i) => (
        <div
          key={i}
          className="group relative p-3 mb-3 rounded-xl border border-(--border)
                     hover:bg-(--bg-secondary) transition-all duration-200"
        >
          {/* TEMPLATE CONTENT */}
          <div
            onClick={() => onSelect(m.message)}
            className="cursor-pointer pr-16"
          >
            <p className="font-medium text-(--text-primary) truncate">
              {m.title}
            </p>

            <p className="text-sm text-(--text-secondary) line-clamp-2">
              {m.message}
            </p>
          </div>

          {/* ACTION BUTTONS (HOVER ONLY) */}
          <div
            className="absolute top-2 right-2 flex gap-1 opacity-0
                       group-hover:opacity-100 transition duration-200"
          >
            <Button
              variant="ghost"
              onClick={() => onEdit(i, m)}
              className="p-1 hover:bg-(--btn-primary-hover)"
            >
              <EditIcon fontSize="small" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => onDelete(m._id)}
              className="p-1 hover:bg-red-500/20"
            >
              <DeleteIcon fontSize="small" className="text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DefaultMessageSidebar;
