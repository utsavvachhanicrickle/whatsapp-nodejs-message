import SearchIcon from "@mui/icons-material/Search";
import { useState, useMemo } from "react";

function ChatsSidebar({
  chatsWithMessages,
  contacts,
  onSelect,
  search,
  setSearch,
}) {
  const filteredChats = useMemo(() => {
    // Create a map of existing contacts by their WhatsApp ID for quick lookup
    const contactMap = new Map();
    contacts.forEach((c) => {
      if (c.whatsappId) contactMap.set(c.whatsappId, c);
      const phoneKey = (c.phoneNumber || "").replace(/\D/g, "");
      if (phoneKey) contactMap.set(phoneKey, c);
    });

    const chatContacts = chatsWithMessages.map((chat) => {
      const chatPhoneKey = (chat.contactId || "").split("@")[0].replace(/\D/g, "");
      const existing = contactMap.get(chat.contactId) || contactMap.get(chatPhoneKey);

      if (existing) {
        return { ...existing, lastChat: chat, name: existing.name || chat.name };
      }

      return {
        _id: chat.contactId,
        whatsappId: chat.contactId,
        phoneNumber: chatPhoneKey,
        name: chat.name || chatPhoneKey || "Unknown",
        isVirtual: true,
        lastChat: chat,
      };
    });

    const seen = new Set();
    const uniqueChatContacts = chatContacts.filter((c) => {
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
  }, [chatsWithMessages, contacts, search]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {filteredChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center opacity-40">
          <SearchIcon sx={{ fontSize: 48 }} className="mb-2" />
          <p className="text-sm">No recent chats found</p>
        </div>
      ) : (
        filteredChats.map((c, i) => (
          <div
            key={c._id || i}
            onClick={() => onSelect(c)}
            className="group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-(--border)/50 transition-all hover:bg-(--bg-secondary)"
          >
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
                <span className="text-[10px] text-(--text-secondary) shrink-0">
                  {c.lastChat
                    ? new Date(c.lastChat.timestamp * 1000).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
              <p className="text-xs text-(--text-secondary) truncate">
                {c.lastChat ? c.lastChat.body : c.phoneNumber}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ChatsSidebar;
