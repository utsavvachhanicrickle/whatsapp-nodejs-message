import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "../Button";

function ContactSidebar({
  contacts,
  multipleNumber,
  setMultipleNumber,
  onSelect,
  onEdit,
  onDelete,
}) {
  // ✅ Check if selected
  const isSelected = (contact) =>
    multipleNumber.some((c) => c._id === contact._id);

  // ✅ Toggle checkbox selection
  const handleCheckboxChange = (contact) => {
    if (isSelected(contact)) {
      setMultipleNumber((prev) => prev.filter((c) => c._id !== contact._id));
    } else {
      setMultipleNumber((prev) => [...prev, contact]);
    }
  };

  // ✅ Select All
  const handleSelectAll = () => {
    if (multipleNumber.length === contacts.length) {
      setMultipleNumber([]); // unselect all
    } else {
      setMultipleNumber(contacts); // select all
    }
  };

  return (
    <div className="w-72 min-h-screen max-h-screen p-4 bg-(--sidebar) border-r border-(--border) overflow-y-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-(--text-primary)">
          Contacts ({multipleNumber.length})
        </h3>

        <button
          onClick={handleSelectAll}
          className="text-xs px-2 py-1 rounded bg-(--bg-secondary) hover:bg-(--border)"
        >
          {multipleNumber.length === contacts.length
            ? "Unselect All"
            : "Select All"}
        </button>
      </div>

      {contacts.length === 0 && (
        <p className="text-sm text-(--text-secondary)">No contacts found</p>
      )}

      {contacts.map((c, i) => {
        const selected = isSelected(c);

        return (
          <div
            key={c._id || i}
            className={`group relative flex items-center gap-3 p-3 mb-3 rounded-xl border 
              transition-all duration-200
              ${
                selected
                  ? "bg-(--bg-select) border-green-400 text-(--secondary-hover)"
                  : "border-(--border) hover:bg-(--bg-secondary)"
              }`}
          >
            {/* ✅ CHECKBOX */}
            <input
              type="checkbox"
              checked={selected}
              onChange={() => handleCheckboxChange(c)}
              onClick={(e) => e.stopPropagation()} // prevent card click
              className="w-4 h-4 cursor-pointer"
            />

            {/* ✅ CONTACT INFO (single select mode) */}
            <div
              onClick={() => onSelect(c)}
              className="cursor-pointer flex-1 pr-16"
            >
              <p className="font-medium  truncate">
                {c.name}
              </p>
              <p className="text-sm  truncate">
                {c.phoneNumber}
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div
              className="absolute top-2 right-2 flex gap-1 opacity-0 
                         group-hover:opacity-100 transition duration-200"
              onClick={(e) => e.stopPropagation()}
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
                onClick={() => onDelete(c._id)}
                className="p-1 hover:bg-red-500/20"
              >
                <DeleteIcon fontSize="small" className="text-red-500" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ContactSidebar;
