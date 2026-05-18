import { useRef, useEffect, useMemo } from "react";
import { Avatar } from "../Forms/Avatar";
import SendIcon from "@mui/icons-material/Send";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import LockIcon from "@mui/icons-material/Lock";
import CallIcon from "@mui/icons-material/Call";
import VideocamIcon from "@mui/icons-material/Videocam";

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
  contacts = [],
}) {
  const chatContainerRef = useRef(null);

  const resolveSenderName = (authorId) => {
    if (!authorId) return "Unknown";

    const cleanId = authorId.split("@")[0].replace(/\D/g, "");

    const contact = contacts.find((c) => {
      const phoneKey = (c.phoneNumber || "").replace(/\D/g, "");

      return c.whatsappId === authorId || phoneKey === cleanId;
    });
    return contact?.name || cleanId;
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  
  const formatWhatsAppText = (text) => {
    if (!text) return "";

    let formatted = text;

    // Escape HTML
    formatted = formatted
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold: *text*
    formatted = formatted.replace(/\*(.*?)\*/g, "<strong>$1</strong>");

    // Italic: _text_
    formatted = formatted.replace(/_(.*?)_/g, "<em>$1</em>");

    // Strike: ~text~
    formatted = formatted.replace(/~(.*?)~/g, "<del>$1</del>");

    // Monospace: ```text```
    formatted = formatted.replace(
      /```(.*?)```/gs,
      `<pre class="bg-black/10 px-2 py-1 rounded-lg overflow-x-auto text-xs my-1"><code>$1</code></pre>`,
    );

    // URLs
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      `<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline break-all">$1</a>`,
    );

    // Emails
    formatted = formatted.replace(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g,
      `<a href="mailto:$1" class="text-blue-500 underline">$1</a>`,
    );

    // Indian phone numbers
    formatted = formatted.replace(
      /(?<!\d)(\+91[\s-]?)?[6-9]\d{9}(?!\d)/g,
      `<a href="tel:$&" class="text-green-500 underline">$&</a>`,
    );

    // Line breaks
    formatted = formatted.replace(/\n/g, "<br/>");

    return formatted;
  };
  return (
    <div className="w-full h-full max-w-5xl flex flex-col bg-(--bg-primary) rounded-3xl shadow-2xl overflow-hidden border border-(--border)">
      {/* HEADER */}
      <div className="px-5 py-4 bg-(--bg-secondary)/70 backdrop-blur-xl border-b border-(--border) flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar name={name} className="w-13! h-13!" />

            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-(--bg-primary) border border-(--border) flex items-center justify-center">
              {isGroupBollean ? (
                <GroupsIcon sx={{ fontSize: 12 }} className="text-green-500" />
              ) : (
                <PersonIcon sx={{ fontSize: 12 }} className="text-blue-500" />
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
            darkMode ? "opacity-[0.03] invert grayscale" : "opacity-[0.04]"
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

            <p className="text-sm font-semibold">No messages found</p>

            <p className="text-xs mt-1 text-(--text-secondary)">
              Start the conversation
            </p>
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            const isMine = msg.fromMe;
            const BASE_URL = (
              import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
            ).replace(/\/$/, "");

            const renderMediaContent = () => {
              const mediaUrl = msg.publicUrl ? BASE_URL + msg.publicUrl : null;
              const msgType = msg.mediaType || msg.type;

              if (msgType === "image" && mediaUrl) {
                return (
                  <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={mediaUrl}
                      alt="Image"
                      className="rounded-xl max-w-62.5 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </a>
                );
              }

              if (msgType === "video" && mediaUrl) {
                return (
                  <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                    <video controls className="rounded-xl max-w-75 w-full">
                      <source
                        src={mediaUrl}
                        type={msg.mimeType || "video/mp4"}
                      />
                      Your browser does not support video.
                    </video>
                  </a>
                );
              }

              if ((msgType === "document" || msgType === "pdf") && mediaUrl) {
                return (
                  <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/10 hover:bg-black/20 transition-colors text-sm font-semibold underline"
                  >
                    📄 {msg.fileName || "Download Document"}
                  </a>
                );
              }

              if ((msgType === "audio" || msgType === "ptt") && mediaUrl) {
                return (
                  <audio controls className="max-w-62.5 w-full rounded-lg">
                    <source src={mediaUrl} type={msg.mimeType || "audio/ogg"} />
                    Your browser does not support audio.
                  </audio>
                );
              }

              if (msgType === "sticker" && mediaUrl) {
                return (
                  <img
                    src={mediaUrl}
                    alt="Sticker"
                    className="w-24 h-24 object-contain"
                  />
                );
              }

              // Media message but publicUrl not yet available (still processing)
              const mediaTypes = [
                "image",
                "video",
                "document",
                "audio",
                "ptt",
                "sticker",
              ];
              if (mediaTypes.includes(msgType) && !mediaUrl) {
                const icons = {
                  image: "🖼️",
                  video: "🎥",
                  document: "📄",
                  audio: "🎵",
                  ptt: "🎤",
                  sticker: "🎭",
                };
                return (
                  <span className="flex items-center gap-1.5 italic text-xs opacity-60">
                    {icons[msgType] || "📎"} {msgType} (processing...)
                  </span>
                );
              }

              if (msgType === "call_log") {
                const isVideo =
                  msg.rawData?.isVideo ||
                  msg.body?.toLowerCase().includes("video");
                return (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-(--border) min-w-45">
                    <div
                      className={`p-2 rounded-full ${
                        isVideo
                          ? "bg-purple-500/20 text-purple-500"
                          : "bg-green-500/20 text-green-500"
                      }`}
                    >
                      {isVideo ? (
                        <VideocamIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <CallIcon sx={{ fontSize: 20 }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none">
                        {isVideo ? "Video Call" : "Voice Call"}
                      </p>
                      <p className="text-[10px] opacity-60 mt-1 uppercase font-bold tracking-tighter">
                        {msg.fromMe ? "Outgoing" : "Incoming"}
                      </p>
                    </div>
                  </div>
                );
              }

              // Default: plain text
              return (
                <div
                  className="text-sm whitespace-pre-wrap wrap-break-word leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: msg.body
                      ? formatWhatsAppText(msg.body)
                      : `<span class="italic opacity-50">Empty message</span>`,
                  }}
                />
              );
            };

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
                    <div className="text-[10px] font-bold text-teal-500 mb-1 truncate opacity-80">
                      {resolveSenderName(msg.author || msg.from)}
                    </div>
                  )}

                  {/* Media / Text Content */}
                  {renderMediaContent()}

                  {/* Caption (body shown below media if present) */}
                  {msg.publicUrl && (msg.caption || msg.body) && (
                    <div
                      className="text-sm mt-1 whitespace-pre-wrap wrap-break-word leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: formatWhatsAppText(
                          msg.caption || msg.body || "",
                        ),
                      }}
                    />
                  )}

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
                      <span className="text-[11px] text-blue-400">✓✓</span>
                    )}
                  </div>

                  {/* Bubble Tail */}
                  <div
                    className={`absolute top-0 w-3 h-3 ${
                      isMine
                        ? `-right-1 ${
                            darkMode ? "bg-[#005c4b]" : "bg-[#dcf8c6]"
                          } [clip-path:polygon(0_0,0_100%,100%_0)]`
                        : `-left-1 ${
                            darkMode ? "bg-[#202c33]" : "bg-white"
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
              <LockIcon sx={{ fontSize: 18 }} className="text-yellow-500" />
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
