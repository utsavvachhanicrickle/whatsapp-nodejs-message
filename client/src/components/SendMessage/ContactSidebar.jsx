import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "../Button";
import { useState, useMemo } from "react";

function ContactSidebar({
  contacts,
  multipleNumber,
  setMultipleNumber,
  onSelect,
  onEdit,
  onDelete,
  onBulkDelete,
}) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const isSelected = (contact) =>
    multipleNumber.some((c) => c._id === contact._id);

  const handleCheckboxChange = (contact) => {
    if (isSelected(contact)) {
      setMultipleNumber((prev) => prev.filter((c) => c._id !== contact._id));
    } else {
      setMultipleNumber((prev) => [...prev, contact]);
    }
  };

  const filteredContacts = useMemo(() => {
    let filtered = contacts.filter((c) => {
      const value = search.toLowerCase();
      const name = c.name || "";
      const phoneNumber = c.phoneNumber || "";
      return (
        name.toLowerCase().includes(value) || phoneNumber.includes(value)
      );
    });

    filtered.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

    return filtered;
  }, [contacts, search, sortOrder]);

  // ✅ Select All
  const handleSelectAll = () => {
    if (multipleNumber.length === contacts.length) {
      setMultipleNumber([]);
    } else {
      setMultipleNumber(contacts);
    }
  };

  return (
    <div className="w-72 min-h-screen max-h-screen flex flex-col bg-(--sidebar) border-r border-(--border)">
      {/* 📌 FIXED HEADER */}
      <div className="p-4 border-b border-(--border) flex flex-col gap-3">
        {/* TOP ROW */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-(--text-primary)">
            Contacts ({multipleNumber.length})
          </h3>

          <div className="flex gap-2 items-center">
            {multipleNumber.length > 0 && (
              <Button
                onClick={() => onBulkDelete(multipleNumber)}
                variant="danger"
                className="text-xs px-3 py-1"
              >
                <DeleteIcon />
              </Button>
            )}

            <Button onClick={handleSelectAll} className="text-xs px-2 py-1">
              {multipleNumber.length === contacts.length
                ? "Unselect All"
                : "Select All"}
            </Button>
          </div>
        </div>

        {/* 🔍 SEARCH + SORT */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search name or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 text-sm border rounded bg-(--bg-primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
          />

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-sm border rounded px-2 bg-(--bg-primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>
      </div>

      {/* 📜 SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {filteredContacts.length === 0 && (
          <p className="text-sm text-(--text-secondary) text-center py-4">No contacts found</p>
        )}

        {filteredContacts.map((c, i) => {
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
                className="w-4 h-4 cursor-pointer accent-(--primary)"
              />

              {/* ✅ CONTACT INFO */}
              <div
                onClick={() => onSelect(c)}
                className="cursor-pointer flex-1 pr-12"
              >
                <p className="font-medium truncate text-sm">{c.name || "Unknown"}</p>
                <p className="text-xs text-(--text-secondary) truncate">{c.phoneNumber}</p>
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
    </div>
  );
}

export default ContactSidebar;
