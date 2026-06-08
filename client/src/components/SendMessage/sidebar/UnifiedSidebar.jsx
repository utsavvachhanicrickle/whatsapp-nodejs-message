import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import DeleteIcon from "@mui/icons-material/Delete";

import ContactsSidebar from "./ContactsSidebar";
import ChatsSidebar from "./ChatsSidebar";
import WhatsappGroupMessageSidebar from "./WhatsappGroupMessageSidebar";

function UnifiedSidebar({
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
  groups,
  multipleGroup,
  setMultipleGroup,
  selectedContactWhatsappId,
  sessionId,
  assignedChats = [],
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

  const handleSelectAllGroups = () => {
    if (multipleGroup.length === groups.length) {
      setMultipleGroup([]);
    } else {
      setMultipleGroup(groups);
    }
  };

  const handleSelectAll = () => {
    if (multipleNumber.length === contacts.length) {
      setMultipleNumber([]);
    } else {
      setMultipleNumber(contacts);
    }
  };

  return (
    <div className="w-84 h-full flex flex-col bg-(--sidebar) border-r border-(--border)">
      {/* 📌 TOP ACTIONS */}
      <div className="p-4 flex items-center justify-between bg-(--header)">
        {sessionId === "shared-chats" ? (
          <h3 className="text-sm font-bold uppercase tracking-wider text-(--text-primary) px-2">Assigned Chats</h3>
        ) : (
          <div className="flex items-center gap-1 bg-(--bg-secondary) p-1 rounded-full">
            <button
              onClick={() => {
                setIsGroupMode(false);
                setViewMode("all");
              }}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all ${
                !isGroupMode && viewMode === "all"
                  ? "bg-(--primary) text-white shadow-sm"
                  : "text-(--text-secondary) hover:bg-(--primary-hover) hover:text-white"
              }`}
            >
              Contacts
            </button>
            <button
              onClick={() => {
                setIsGroupMode(false);
                setViewMode("chats");
              }}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all ${
                !isGroupMode && viewMode === "chats"
                  ? "bg-(--primary) text-white shadow-sm"
                  : "text-(--text-secondary) hover:bg-(--primary-hover) hover:text-white"
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => {
                setIsGroupMode(true);
              }}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all ${
                isGroupMode
                  ? "bg-(--primary) text-white shadow-sm"
                  : "text-(--text-secondary) hover:bg-(--primary-hover) hover:text-white"
              }`}
            >
              Groups
            </button>
          </div>
        )}
        {sessionId !== "shared-chats" && !isGroupMode && (
          <div className="flex items-center gap-1">
            <button
              onClick={onAddContact}
              className="p-1.5 text-(--primary) hover:bg-(--bg-secondary) rounded-full transition-colors"
              title="Add Contact"
            >
              <AddIcon fontSize="small" />
            </button>
            <button
              onClick={onAddMultiple}
              className="p-1.5 text-(--primary) hover:bg-(--bg-secondary) rounded-full transition-colors"
              title="Bulk Import"
            >
              <LibraryAddIcon fontSize="small" />
            </button>
          </div>
        )}
      </div>

      {/* 🔍 SEARCH & SORT (Conditional per mode) */}
      <div className="p-3 flex flex-col gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${isGroupMode ? "groups" : viewMode === "chats" ? "chats" : "contacts"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border-none rounded-lg bg-(--bg-secondary) focus:ring-1 focus:ring-(--primary) outline-none text-(--text-primary)"
          />
          <SearchIcon
            className="absolute left-3 top-2.5 text-(--text-secondary) opacity-50"
            fontSize="small"
          />
        </div>

        {(isGroupMode || (!isGroupMode && viewMode === "all") || sessionId === "shared-chats") && (
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-(--text-secondary) opacity-60">
              {sessionId === "shared-chats"
                ? `${assignedChats.length} Assigned`
                : isGroupMode
                  ? multipleGroup.length > 0
                    ? `${multipleGroup.length} selected`
                    : `${groups.length} Groups`
                  : multipleNumber.length > 0
                    ? `${multipleNumber.length} selected`
                    : `${contacts.length} Contacts`}
            </span>
            <div className="flex gap-3 items-center">
              {sessionId !== "shared-chats" && (
                <button
                  onClick={isGroupMode ? handleSelectAllGroups : handleSelectAll}
                  className="text-[10px] font-bold text-(--primary) hover:underline uppercase tracking-widest"
                >
                  {isGroupMode
                    ? multipleGroup.length === groups.length
                      ? "None"
                      : "All"
                    : multipleNumber.length === contacts.length
                      ? "None"
                      : "All"}
                </button>
              )}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-[10px] font-bold bg-transparent border-none outline-none text-(--text-secondary) uppercase tracking-widest cursor-pointer"
              >
                <option value="asc">A-Z</option>
                <option value="desc">Z-A</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 📜 CONTENT AREA */}
      <div className="flex-1 overflow-hidden flex flex-col border-t border-(--border)">
        {sessionId === "shared-chats" ? (
          <ChatsSidebar
            chatsWithMessages={assignedChats}
            contacts={contacts}
            onSelect={onSelect}
            search={search}
            setSearch={setSearch}
            groups={groups}
            selectedContactWhatsappId={selectedContactWhatsappId}
            sortOrder={sortOrder}
          />
        ) : isGroupMode ? (
          <WhatsappGroupMessageSidebar
            groups={groups}
            multipleGroup={multipleGroup}
            setMultipleGroup={setMultipleGroup}
            setIsGroupMode={setIsGroupMode}
            isStandalone={false}
            search={search}
            sortOrder={sortOrder}
            sessionId={sessionId}
          />
        ) : viewMode === "chats" ? (
          <ChatsSidebar
            chatsWithMessages={chatsWithMessages}
            contacts={contacts}
            onSelect={onSelect}
            search={search}
            setSearch={setSearch}
            groups={groups}
            selectedContactWhatsappId={selectedContactWhatsappId}
            sortOrder={sortOrder}
          />
        ) : (
          <ContactsSidebar
            contacts={contacts}
            multipleNumber={multipleNumber}
            handleCheckboxChange={handleCheckboxChange}
            isSelected={isSelected}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            search={search}
            sortOrder={sortOrder}
          />
        )}
      </div>

      {/* 🗑️ BULK ACTIONS */}
      {!isGroupMode && multipleNumber.length > 0 && (
        <div className="p-3 bg-(--primary) text-white flex items-center justify-between animate-slide-up">
          <span className="text-xs font-bold uppercase tracking-wider">
            {multipleNumber.length} selected
          </span>
          <button
            onClick={() => onBulkDelete(multipleNumber)}
            className="p-1.5 hover:bg-black/10 rounded-full transition-colors"
          >
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      )}
    </div>
  );
}

export default UnifiedSidebar;
