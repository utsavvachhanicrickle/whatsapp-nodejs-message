import { useEffect, useState } from "react";

function ContactSidebar({ onSelect, onEdit, onDelete, refresh }) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    load();
  }, [refresh]); // ✅ reload when parent updates

  const load = () => {
    const data = JSON.parse(localStorage.getItem("contacts")) || [];
    setContacts(data);
  };

  return (
    <div className="w-72 p-4 bg-(--sidebar) border-r border-(--border) overflow-auto">
      <h3 className="mb-3 font-semibold text-(--text-primary)">Contacts</h3>

      {contacts.length === 0 && (
        <p className="text-sm text-(--text-secondary)">No contacts found</p>
      )}

      {contacts.map((c, i) => (
        <div
          key={i}
          className="p-3 mb-3 rounded-lg border border-(--border) hover:bg-(--bg-secondary) transition"
        >
          <div onClick={() => onSelect(c)} className="cursor-pointer">
            <p className="font-medium text-(--text-primary)">{c.name}</p>
            <p className="text-sm text-(--text-secondary)">
              {c.phoneNumber}
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => onEdit(i, c)}
              className="text-blue-500 text-sm hover:underline"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(i)} // ✅ parent handles
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

export default ContactSidebar;