import { useRef, useEffect } from "react";

import SendIcon from "@mui/icons-material/Send";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import LockIcon from "@mui/icons-material/Lock";

function ChatView({
  name,
  number,
  chatMessages = [],
  message,
  setMessage,
  sendMessage,
  messageSending,
  darkMode,
  selectedContactWhatsappId,
  fetchChatMessages,
  isGroupBollean,
}) {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const getInitials = () => {
    if (name && name !== "Unknown") {
      return name.charAt(0).toUpperCase();
    }

    return number?.slice(-2) || "U";
  };

  const getRandomGradient = (seed) => {
    const gradients = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-violet-500",
      "from-teal-500 to-cyan-500",
    ];

    const index = (seed?.length || 0) % gradients.length;

    return gradients[index];
  };

  return (
    <div className="w-full h-full max-w-5xl flex flex-col bg-(--bg-primary) rounded-3xl shadow-2xl overflow-hidden border border-(--border)">
      {/* HEADER */}
      <div className="px-5 py-4 bg-(--bg-secondary)/70 backdrop-blur-xl border-b border-(--border) flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className={`w-13 h-13 rounded-full bg-linear-to-br ${getRandomGradient(
                name || number,
              )} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
            >
              {getInitials()}
            </div>

            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-(--bg-primary) border border-(--border) flex items-center justify-center">
              {isGroupBollean ? (
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

          {/* Chat Info */}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate text-(--text-primary)">
              {name || number}
            </h3>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide ${
                  isGroupBollean
                    ? "bg-green-500/15 text-green-500"
                    : "bg-blue-500/15 text-blue-500"
                }`}
              >
                {isGroupBollean ? "GROUP CHAT" : "PRIVATE CHAT"}
              </span>

              <span className="text-[10px] text-green-500 font-semibold">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => fetchChatMessages(selectedContactWhatsappId)}
          className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-(--bg-primary) hover:bg-(--primary)/10 border border-(--border) transition-all text-xs font-semibold text-(--text-primary)"
        >
          <RefreshIcon sx={{ fontSize: 16 }} />
          Refresh
        </button>
      </div>

      {/* CHAT AREA */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 flex flex-col gap-3 relative"
      >
        {/* Background Pattern */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            darkMode
              ? "opacity-[0.03] invert grayscale"
              : "opacity-[0.04]"
          }`}
          style={{
            backgroundImage:
              "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "300px",
          }}
        />

        {chatMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center relative z-10">
            <div className="w-18 h-18 rounded-full bg-(--bg-secondary) flex items-center justify-center mb-4">
              {isGroupBollean ? (
                <GroupsIcon sx={{ fontSize: 38 }} />
              ) : (
                <PersonIcon sx={{ fontSize: 38 }} />
              )}
            </div>

            <p className="text-sm font-semibold">
              No messages found
            </p>

            <p className="text-xs mt-1 text-(--text-secondary)">
              Start the conversation
            </p>
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            const isMine = msg.fromMe;

            return (
              <div
                key={msg._id || idx}
                className={`flex relative z-10 ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md relative ${
                    isMine
                      ? darkMode
                        ? "bg-[#005c4b] text-white rounded-br-sm"
                        : "bg-[#dcf8c6] text-gray-900 rounded-br-sm"
                      : darkMode
                        ? "bg-[#202c33] text-white rounded-bl-sm"
                        : "bg-white text-gray-900 rounded-bl-sm border border-gray-100"
                  }`}
                >
                  {/* Sender Name for Groups */}
                  {isGroupBollean && !isMine && (
                    <div className="text-[10px] font-bold text-teal-400 mb-1 truncate">
                      {msg.from}
                    </div>
                  )}

                  {/* Message */}
                  <p className="text-sm whitespace-pre-wrap wrap-break-word leading-relaxed">
                    {msg.body || (
                      <span className="italic opacity-50">
                        Empty message
                      </span>
                    )}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <span className="text-[10px] opacity-60">
                      {msg.timestamp
                        ? new Date(
                            Number(msg.timestamp) * 1000,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>

                    {isMine && (
                      <span className="text-[11px] text-blue-400">
                        ✓✓
                      </span>
                    )}
                  </div>

                  {/* Bubble Tail */}
                  <div
                    className={`absolute top-0 w-3 h-3 ${
                      isMine
                        ? `-right-1 ${
                            darkMode
                              ? "bg-[#005c4b]"
                              : "bg-[#dcf8c6]"
                          } [clip-path:polygon(0_0,0_100%,100%_0)]`
                        : `-left-1 ${
                            darkMode
                              ? "bg-[#202c33]"
                              : "bg-white"
                          } [clip-path:polygon(0_0,100%_100%,100%_0)]`
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-(--bg-secondary)/70 backdrop-blur-xl border-t border-(--border)">
        {isGroupBollean ? (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="w-10 h-10 rounded-full bg-yellow-500/15 flex items-center justify-center shrink-0">
              <LockIcon
                sx={{ fontSize: 18 }}
                className="text-yellow-500"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-yellow-500">
                Group sending disabled
              </p>

              <p className="text-xs text-(--text-secondary)">
                Messages can only be viewed in group mode right now
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <textarea
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();

                  if (message.trim()) {
                    sendMessage();
                  }
                }
              }}
              rows={1}
              className={`flex-1 p-4 text-sm border-none rounded-2xl bg-(--bg-primary) focus:ring-2 focus:ring-(--primary)/20 outline-none text-(--text-primary) resize-none min-h-14 max-h-35 overflow-y-auto ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            />

            <button
              onClick={sendMessage}
              disabled={!message?.trim() || messageSending}
              className="w-14 h-14 shrink-0 bg-(--primary) text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {messageSending ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <SendIcon fontSize="small" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatView;