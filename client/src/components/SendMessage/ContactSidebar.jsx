import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import SearchIcon from "@mui/icons-material/Search";
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
  onAddContact,
  onAddMultiple,
  isGroupMode,
  setIsGroupMode,
  viewMode,
  setViewMode,
  chatsWithMessages,
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
    let baseContacts = contacts;
    
    if (viewMode === "chats") {
      // Create a map of existing contacts by their WhatsApp ID for quick lookup
      const contactMap = new Map();
      contacts.forEach(c => {
        if (c.whatsappId) contactMap.set(c.whatsappId, c);
        // Also map by phone number if whatsappId is missing or doesn't match
        const phoneKey = (c.phoneNumber || "").replace(/\D/g, "");
        if (phoneKey) contactMap.set(phoneKey, c);
      });

      // Combine existing contacts with chats that might not be in contacts
      const chatContacts = chatsWithMessages.map(chat => {
        const chatPhoneKey = (chat.contactId || "").split('@')[0].replace(/\D/g, "");
        
        const existing = contactMap.get(chat.contactId) || contactMap.get(chatPhoneKey);
        
        if (existing) {
          return { ...existing, lastChat: chat, name: existing.name || chat.name };
        }
        
        // Create a virtual contact for someone not in saved contacts
        return {
          _id: chat.contactId,
          whatsappId: chat.contactId,
          phoneNumber: chatPhoneKey,
          name: chat.name || chatPhoneKey || "Unknown",
          isVirtual: true,
          lastChat: chat
        };
      });


      // Filter out duplicates (if any) and handle search
      const seen = new Set();
      const uniqueChatContacts = chatContacts.filter(c => {
        const key = c.whatsappId || c.phoneNumber;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return uniqueChatContacts.filter((c) => {
        const value = search.toLowerCase();
        const name = c.name || "";
        const phoneNumber = c.phoneNumber || "";
        return name.toLowerCase().includes(value) || phoneNumber.includes(value);
      });
    }

    // Default "all" or "groups" view (existing logic)
    let filtered = baseContacts.filter((c) => {
      const value = search.toLowerCase();
      const name = c.name || "";
      const phoneNumber = c.phoneNumber || "";
      return name.toLowerCase().includes(value) || phoneNumber.includes(value);
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
  }, [contacts, search, sortOrder, viewMode, chatsWithMessages]);


  const handleSelectAll = () => {
    if (multipleNumber.length === contacts.length) {
      setMultipleNumber([]);
    } else {
      setMultipleNumber(contacts);
    }
  };

  return (
    <div className="w-80 h-full flex flex-col bg-(--sidebar) border-r border-(--border)">
      <div className="flex flex-col gap-0">
        {/* TOP ACTIONS */}
        <div className="p-4 flex items-center justify-between border-b border-(--border) bg-(--header)">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setIsGroupMode(false);
                setViewMode("all");
              }}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${!isGroupMode && viewMode === "all" ? "bg-(--primary) text-white" : "text-(--text-secondary) hover:bg-(--bg-secondary)"}`}
            >
              All
            </Button>
            <Button
              onClick={() => {
                setIsGroupMode(false);
                setViewMode("chats");
              }}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${!isGroupMode && viewMode === "chats" ? "bg-(--primary) text-white" : "text-(--text-secondary) hover:bg-(--bg-secondary)"}`}
            >
              Chats
            </Button>
            <Button
              onClick={() => {
                setIsGroupMode(true);
                setViewMode("all");
              }}
              variant="other"
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${isGroupMode ? "bg-(--primary) text-white" : "text-(--text-secondary) hover:bg-(--bg-secondary)"}`}
            >
              Groups
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="other"
              onClick={onAddContact}
              className="p-2 text-(--primary) hover:bg-(--bg-secondary) rounded-full"
              title="Add Contact"
            >
              <AddIcon fontSize="small" />
            </Button>
            <Button
              variant="other"
              onClick={onAddMultiple}
              className="p-2 text-(--primary) hover:bg-(--bg-secondary) rounded-full"
              title="Add Multiple"
            >
              <LibraryAddIcon fontSize="small" />
            </Button>
          </div>
        </div>

        {/* SEARCH & SORT */}
        <div className="p-3 flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border-none rounded-lg bg-(--bg-secondary) focus:ring-1 focus:ring-(--primary) outline-none text-(--text-primary)"
            />
            <SearchIcon
              className="absolute left-3 top-2.5 text-(--text-secondary)"
              fontSize="small"
            />
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-(--text-secondary)">
              {multipleNumber.length > 0
                ? `${multipleNumber.length} selected`
                : `All Contacts (${contacts.length})`}
            </span>
            <div className="flex gap-3 items-center">
              <button
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-(--primary) hover:underline uppercase tracking-wider"
              >
                {multipleNumber.length === contacts.length ? "Clear" : "All"}
              </button>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-[11px] font-bold bg-transparent border-none outline-none text-(--text-secondary) uppercase tracking-wider cursor-pointer"
              >
                <option value="asc">A-Z</option>
                <option value="desc">Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 📜 SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-(--border)">
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
                {/* CHECKBOX */}
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
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-(--text-primary) truncate">
                      {c.name || "Unknown"}
                    </h4>
                    {viewMode === "chats" && (
                      <span className="text-[10px] text-(--text-secondary) shrink-0">
                        {(() => {
                          const chat = chatsWithMessages.find(chat => chat.contactId === c.whatsappId || chat.contactId === c.phoneNumber);
                          return chat ? new Date(chat.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-(--text-secondary) truncate flex-1">
                      {viewMode === "chats" ? (
                        <>
                          {(() => {
                            const chat = chatsWithMessages.find(chat => chat.contactId === c.whatsappId || chat.contactId === c.phoneNumber);
                            if (!chat) return c.phoneNumber;
                            return (
                              <span className="flex items-center gap-1">
                                {chat.body}
                              </span>
                            );
                          })()}
                        </>
                      ) : (
                        c.phoneNumber
                      )}
                    </p>
                  </div>
                </div>

                {!c.isVirtual && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(i, c);
                      }}
                      className="p-1.5 text-(--text-secondary) hover:text-(--primary) hover:bg-white rounded-full shadow-sm "
                    >
                      <EditIcon fontSize="inherit" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c._id);
                      }}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-white rounded-full shadow-sm "
                    >
                      <DeleteIcon fontSize="inherit" />
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* BULK ACTIONS BAR (Floating if selected) */}
      {multipleNumber.length > 0 && (
        <div className="p-3 bg-(--primary) text-white flex items-center justify-between animate-fade-in">
          <span className="text-xs font-bold">
            {multipleNumber.length} contacts selected
          </span>
          <button
            onClick={() => onBulkDelete(multipleNumber)}
            className="p-2 hover:bg-black/10 rounded-full"
          >
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ContactSidebar;
