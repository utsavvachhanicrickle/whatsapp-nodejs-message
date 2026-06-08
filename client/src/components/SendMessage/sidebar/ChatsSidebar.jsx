import { Avatar } from "../../Forms/Avatar";
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";

import { useMemo } from "react";

function ChatsSidebar({
  chatsWithMessages = [],
  contacts = [],
  groups = [],
  onSelect,
  search = "",
  selectedContactWhatsappId,
  sortOrder = "asc",
}) {
  const filteredChats = useMemo(() => {
    const contactMap = new Map();
    const groupMap = new Map();

    contacts.forEach((c) => {
      if (c.whatsappId) {
        contactMap.set(c.whatsappId, c);
      }

      const phoneKey = (c.phoneNumber || "").replace(/\D/g, "");
      if (phoneKey) {
        contactMap.set(phoneKey, c);
      }
    });

    groups.forEach((g) => {
      if (g.id) {
        groupMap.set(g.id, g);
      }
    });

    const mappedChats = chatsWithMessages.map((chat) => {
      const chatId = chat.chatId || chat.contactId;
      const cleanNumber = (chatId || "").split("@")[0].replace(/\D/g, "");

      const existingContact =
        contactMap.get(chatId) || contactMap.get(cleanNumber);
      const existingGroup = groupMap.get(chatId);

      const isGroup = chat.isGroup || chatId?.includes("@g.us");

      return {
        _id: chatId,
        whatsappId: chatId,
        chatId,
        isGroup,
        phoneNumber: cleanNumber,

        name: isGroup
          ? existingGroup?.name ||
            existingContact?.name ||
            chat.name ||
            "Unknown Group"
          : existingContact?.name || chat.name || cleanNumber || "Unknown",

        lastChat: chat,
        sessionId: chat.sessionId || null,
      };
    });

    const seen = new Set();

    const uniqueChats = mappedChats.filter((chat) => {
      const key = chat.chatId;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });

    const sorted = uniqueChats.filter((chat) => {
      const value = search.toLowerCase();

      const name = chat.name?.toLowerCase() || "";
      const phone = chat.phoneNumber || "";

      return name.includes(value) || phone.includes(value);
    });

    sorted.sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      if (sortOrder === "asc") return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });

    return sorted;
  }, [chatsWithMessages, contacts, search, sortOrder]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40 text-center p-6">
            <SearchIcon sx={{ fontSize: 48 }} />

            <p className="text-sm mt-2">No recent chats found</p>
          </div>
        ) : (
          filteredChats.map((chat, index) => {
            const isActive = selectedContactWhatsappId === chat.chatId;
            return (
              <div
                key={chat._id || index}
                onClick={() => onSelect(chat)}
                className={`group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-(--border)/40 transition-all duration-200
                  ${isActive ? "bg-(--bg-active)" : "hover:bg-(--bg-secondary)"}`}
              >
                {/* AVATAR */}
                <div className="relative shrink-0">
                  <Avatar name={chat.name} className="w-10! h-10!" />

                  {/* TYPE BADGE */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-(--bg-chat) border border-(--border) flex items-center justify-center shadow-sm">
                    {chat.isGroup ? (
                      <GroupsIcon
                        sx={{ fontSize: 10 }}
                        className="text-green-500"
                      />
                    ) : (
                      <PersonIcon
                        sx={{ fontSize: 10 }}
                        className="text-blue-500"
                      />
                    )}
                  </div>
                </div>

                {/* CHAT DETAILS */}
                <div className="flex-1 min-w-0">
                  {/* TOP */}
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold truncate text-(--text-primary)">
                      {chat.name}
                    </h4>

                    <span className="text-[10px] text-(--text-secondary) shrink-0">
                      {(chat.lastChat?.timestamp || chat.lastChat?.lastMessageTimestamp)
                        ? new Date(
                            Number(chat.lastChat?.timestamp || chat.lastChat?.lastMessageTimestamp) * 1000,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>

                  {/* MIDDLE */}
                  <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
                    <p className="text-xs truncate text-(--text-secondary) flex items-center gap-1.5 min-w-0">
                      {(chat.lastChat?.type === "image" || chat.lastChat?.lastMessageType === "image") && "📷 "}
                      {(chat.lastChat?.type === "video" || chat.lastChat?.lastMessageType === "video") && "🎥 "}
                      {(chat.lastChat?.type === "audio" || chat.lastChat?.lastMessageType === "audio") && "🎵 "}
                      {(chat.lastChat?.type === "ptt" || chat.lastChat?.lastMessageType === "ptt") && "🎤 "}
                      {(chat.lastChat?.type === "document" || chat.lastChat?.lastMessageType === "document") && "📄 "}
                      {(chat.lastChat?.type === "sticker" || chat.lastChat?.lastMessageType === "sticker") && "🎭 "}
                      
                      <span className="truncate">
                        {chat.lastChat?.caption || 
                         chat.lastChat?.body || 
                         chat.lastChat?.lastMessageBody || 
                         ((chat.lastChat?.type || chat.lastChat?.lastMessageType) && 
                          (chat.lastChat?.type || chat.lastChat?.lastMessageType) !== "chat" 
                           ? (chat.lastChat?.type || chat.lastChat?.lastMessageType) 
                           : "No messages")}
                      </span>
                    </p>
                  </div>

                  {/* CHAT ID */}
                  <p className="text-[10px] mt-1 truncate text-(--text-secondary)/70 flex items-center justify-between gap-1">
                    <span className="truncate">{chat.chatId}</span>
                    {chat.sessionId && (
                      <span className="text-[9px] shrink-0 font-semibold bg-(--primary)/10 text-(--primary) px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        via {chat.sessionId}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ChatsSidebar;
