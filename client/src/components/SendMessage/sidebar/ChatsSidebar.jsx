import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";

import { useMemo } from "react";

function ChatsSidebar({
  chatsWithMessages = [],
  contacts = [],
  onSelect,
  search = "",
  setSearch,
}) {
  const filteredChats = useMemo(() => {
    const contactMap = new Map();

    contacts.forEach((c) => {
      if (c.whatsappId) {
        contactMap.set(c.whatsappId, c);
      }

      const phoneKey = (c.phoneNumber || "").replace(/\D/g, "");

      if (phoneKey) {
        contactMap.set(phoneKey, c);
      }
    });

    const mappedChats = chatsWithMessages.map((chat) => {
      const chatId = chat.chatId || chat.contactId;

      const cleanNumber = (chatId || "").split("@")[0].replace(/\D/g, "");

      const existingContact =
        contactMap.get(chatId) || contactMap.get(cleanNumber);

      const isGroup = chat.isGroup || chatId?.includes("@g.us");

      return {
        _id: chatId,
        whatsappId: chatId,
        chatId,
        isGroup,
        phoneNumber: cleanNumber,

        name: isGroup
          ? existingContact?.name || chat.name || "Unknown Group"
          : existingContact?.name || chat.name || cleanNumber || "Unknown",

        lastChat: chat,
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

    return uniqueChats.filter((chat) => {
      const value = search.toLowerCase();

      const name = chat.name?.toLowerCase() || "";
      const phone = chat.phoneNumber || "";

      return name.includes(value) || phone.includes(value);
    });
  }, [chatsWithMessages, contacts, search]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* SEARCH */}
      <div className="p-3 border-b border-(--border)">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-(--bg-secondary)">
          <SearchIcon className="text-(--text-secondary)" fontSize="small" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="bg-transparent outline-none text-sm w-full text-(--text-primary)"
          />
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40 text-center p-6">
            <SearchIcon sx={{ fontSize: 48 }} />

            <p className="text-sm mt-2">No recent chats found</p>
          </div>
        ) : (
          filteredChats.map((chat, index) => {
            return (
              <div
                key={chat._id || index}
                onClick={() => onSelect(chat)}
                className="group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-(--border)/40 hover:bg-(--bg-secondary) transition-all duration-200"
              >
                {/* AVATAR */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        chat.name || "U",
                      )}&background=random&color=fff&bold=true`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* TYPE BADGE */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-(--bg-chat) border border-(--border) flex items-center justify-center shadow-sm">
                    {chat.isGroup ? (
                      <GroupsIcon
                        sx={{ fontSize: 12 }}
                        className="text-green-500"
                      />
                    ) : (
                      <PersonIcon
                        sx={{ fontSize: 12 }}
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
                      {chat.lastChat?.timestamp
                        ? new Date(
                            Number(chat.lastChat.timestamp) * 1000,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>

                  {/* MIDDLE */}
                  <div className="flex items-center gap-2 mt-1">
                    

                    <p className="text-xs truncate text-(--text-secondary)">
                      {chat.lastChat?.body || "No messages"}
                    </p>
                  </div>

                  {/* CHAT ID */}
                  <p className="text-[10px] mt-1 truncate text-(--text-secondary)/70">
                    {chat.chatId}
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
