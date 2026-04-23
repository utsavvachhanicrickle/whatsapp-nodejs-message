import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "../Button";

function ContactSidebar({ contacts, onSelect, onEdit, onDelete }) {
  return (
    <div className="w-72 p-4 bg-(--sidebar) border-r border-(--border) overflow-auto">
      <h3 className="mb-3 font-semibold text-(--text-primary)">Contacts</h3>

      {contacts.length === 0 && (
        <p className="text-sm text-(--text-secondary)">No contacts found</p>
      )}

      {contacts.map((c, i) => (
        <div
          key={i}
          className="group relative p-3 mb-3 rounded-xl border border-(--border) 
                     hover:bg-(--bg-secondary) transition-all duration-200"
        >
          <div
            onClick={() => onSelect(c)}
            className="cursor-pointer pr-16"
          >
            <p className="font-medium text-(--text-primary) truncate">
              {c.name}
            </p>
            <p className="text-sm text-(--text-secondary) truncate">
              {c.phoneNumber}
            </p>
          </div>

          <div
            className="absolute top-2 right-2 flex gap-1 opacity-0 
                       group-hover:opacity-100 transition duration-200"
          >
            <Button
              variant="ghost"
              onClick={() => onEdit(i, c)}
              className="p-1 hover:bg-(--btn-primary-hover)"
            >
              <EditIcon fontSize="small" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => onDelete(i)}
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

export default ContactSidebar;