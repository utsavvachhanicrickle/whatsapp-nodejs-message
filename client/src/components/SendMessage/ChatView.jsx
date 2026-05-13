import { useRef, useEffect } from "react";
import SendIcon from "@mui/icons-material/Send";

function ChatView({
  name,
  number,
  chatMessages,
  message,
  setMessage,
  sendMessage,
  messageSending,
  darkMode,
  selectedContactWhatsappId,
  fetchChatMessages,
}) {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="w-full h-full max-w-4xl flex flex-col bg-(--bg-primary) rounded-2xl shadow-xl overflow-hidden border border-(--border)">
      {/* Chat Header */}
      <div className="p-4 bg-(--bg-secondary)/50 border-b border-(--border) flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
          {name ? name.charAt(0) : number.slice(-2)}
        </div>
        <div>
          <h3 className="font-semibold text-sm">{name || number}</h3>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">
              Active Chat
            </p>
            <button
              onClick={() => fetchChatMessages(selectedContactWhatsappId)}
              className="text-[10px] text-(--primary) hover:underline"
            >
              Refresh History
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-2 relative"
      >
        {chatMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center opacity-30 italic text-sm relative z-10">
            No messages yet. Say hi!
          </div>
        ) : (
          chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[85%] p-2 px-3 rounded-xl text-sm relative shadow-sm z-10 ${
                msg.fromMe
                  ? darkMode
                    ? "bg-[#005c4b] text-white self-end rounded-tr-none"
                    : "bg-[#dcf8c6] text-gray-800 self-end rounded-tr-none"
                  : darkMode
                    ? "bg-[#202c33] text-white self-start rounded-tl-none"
                    : "bg-white text-gray-800 self-start rounded-tl-none"
              }`}
            >
              <p className="leading-normal">{msg.body}</p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span className="text-[9px] opacity-60">
                  {new Date(msg.timestamp * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.fromMe && <span className="text-[10px] text-blue-400">✓</span>}
              </div>
              {/* Bubble Tail */}
              <div
                className={`absolute top-0 w-2 h-2 ${
                  msg.fromMe
                    ? `-right-1 ${darkMode ? "bg-[#005c4b]" : "bg-[#dcf8c6]"} [clip-path:polygon(0_0,0_100%,100%_0)]`
                    : `-left-1 ${darkMode ? "bg-[#202c33]" : "bg-white"} [clip-path:polygon(0_0,100%_100%,100%_0)]`
                }`}
              />
            </div>
          ))
        )}
      </div>

      {/* Chat Input Area */}
      <div className="p-4 bg-(--bg-secondary)/50 border-t border-(--border) flex items-center gap-3">
        <textarea
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className={`flex-1 p-3 text-sm border-none rounded-xl bg-(--bg-primary) focus:ring-1 focus:ring-(--primary) outline-none text-(--text-primary) max-h-25 resize-none ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        />

        <button
          onClick={sendMessage}
          disabled={!message.trim() || messageSending}
          className="p-3 bg-(--primary) text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {messageSending ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <SendIcon fontSize="small" />
          )}
        </button>
      </div>
    </div>
  );
}

export default ChatView;
