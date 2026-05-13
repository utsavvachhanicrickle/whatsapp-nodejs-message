import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useMemo } from "react";

function ContactsSidebar({
  contacts,
  multipleNumber,
  handleCheckboxChange,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  search,
  sortOrder,
}) {
  const filteredContacts = useMemo(() => {
    let filtered = contacts.filter((c) => {
      const value = search.toLowerCase();
      const name = c.name || "";
      const phoneNumber = c.phoneNumber || "";
      return name.toLowerCase().includes(value) || phoneNumber.includes(value);
    });

    filtered.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    return filtered;
  }, [contacts, search, sortOrder]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {filteredContacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center opacity-40">
          <SearchIcon sx={{ fontSize: 48 }} className="mb-2" />
          <p className="text-sm">No contacts found</p>
        </div>
      ) : (
        filteredContacts.map((c, i) => {
          const selected = isSelected(c);
          return (
            <div
              key={c._id || i}
              onClick={() => onSelect(c)}
              className={`group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-(--border)/50 transition-all
                ${selected ? "bg-(--bg-active)" : "hover:bg-(--bg-secondary)"}`}
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleCheckboxChange(c);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 cursor-pointer accent-(--primary) rounded"
                />
              </div>

              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-(--text-secondary) font-bold shrink-0 overflow-hidden">
                <img
                  src={`https://ui-avatars.com/api/?name=${c.name || "U"}&background=random`}
                  alt="AV"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-(--text-primary) truncate">
                  {c.name || "Unknown"}
                </h4>
                <p className="text-xs text-(--text-secondary) truncate">
                  {c.phoneNumber}
                </p>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(i, c);
                  }}
                  className="p-1.5 text-(--text-secondary) hover:text-(--primary) hover:bg-white rounded-full shadow-sm"
                >
                  <EditIcon fontSize="inherit" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c._id);
                  }}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-white rounded-full shadow-sm"
                >
                  <DeleteIcon fontSize="inherit" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ContactsSidebar;
