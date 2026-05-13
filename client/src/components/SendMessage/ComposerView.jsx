import SendIcon from "@mui/icons-material/Send";
import ClearIcon from "@mui/icons-material/Clear";

function ComposerView({
  activeMode,
  multipleNumber,
  setMultipleNumber,
  multipleGroup,
  setMultipleGroup,
  name,
  setName,
  number,
  setNumber,
  message,
  setMessage,
  sendMessage,
  sendMultipleMessages,
  sendMultipleGroupMessages,
  messageSending,
  chatMessages,
  setIsChatMode,
}) {
  const handleSubmit = () => {
    if (activeMode === "single") {
      sendMessage();
    } else if (activeMode === "multiple") {
      sendMultipleMessages();
    } else {
      sendMultipleGroupMessages();
    }
  };

  const isButtonDisabled =
    messageSending ||
    (activeMode === "multiple" && multipleNumber.length === 0) ||
    (activeMode === "group" && multipleGroup.length === 0);

  return (
    <div className="w-full max-w-2xl bg-(--bg-primary) rounded-2xl shadow-xl overflow-hidden border border-(--border)">
      <div className="p-4 bg-(--bg-secondary)/50 border-b border-(--border) flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          Send {activeMode.charAt(0).toUpperCase() + activeMode.slice(1)} Message
        </h3>
        <div className="flex items-center gap-2">
          {activeMode === "multiple" && (
            <span className="text-[10px] bg-(--primary) text-white px-2 py-0.5 rounded-full font-bold">
              {multipleNumber.length} SELECTED
            </span>
          )}
          {activeMode === "group" && (
            <span className="text-[10px] bg-(--primary) text-white px-2 py-0.5 rounded-full font-bold">
              {multipleGroup.length} SELECTED
            </span>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5">
        {/* RECIPIENTS DISPLAY (for multiple/group) */}
        {(activeMode === "multiple" || activeMode === "group") && (
          <div className="p-3 bg-(--bg-secondary)/30 rounded-xl border border-dashed border-(--border) min-h-25 max-h-37.5 overflow-y-auto flex flex-wrap gap-2">
            {activeMode === "multiple" && multipleNumber.length === 0 && (
              <p className="text-xs text-(--text-secondary) m-auto italic">
                Select contacts from the left sidebar
              </p>
            )}
            {activeMode === "group" && multipleGroup.length === 0 && (
              <p className="text-xs text-(--text-secondary) m-auto italic">
                Select groups from the left sidebar
              </p>
            )}

            {activeMode === "multiple" &&
              multipleNumber.map((c) => (
                <div
                  key={c._id}
                  className="flex  max-h-8 items-center gap-2 px-3 py-1 bg-(--primary)/10 text-(--primary) text-xs font-medium rounded-full border border-(--primary)/20"
                >
                  {c.name || c.phoneNumber}
                  <button
                    onClick={() =>
                      setMultipleNumber((prev) => prev.filter((p) => p._id !== c._id))
                    }
                    className="hover:text-red-500"
                  >
                    <ClearIcon sx={{ fontSize: 14 }} />
                  </button>
                </div>
              ))}
            {activeMode === "group" &&
              multipleGroup.map((g) => (
                <div
                  key={g.id || g._id}
                  className="flex max-h-8 items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-700 text-xs font-medium rounded-full border border-teal-500/20"
                >
                  {g.name}
                  <button
                    onClick={() =>
                      setMultipleGroup((prev) =>
                        prev.filter((p) => (p.id || p._id) !== (g.id || g._id))
                      )
                    }
                    className="hover:text-red-500"
                  >
                    <ClearIcon sx={{ fontSize: 14 }} />
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* SINGLE RECIPIENT INPUTS */}
        {activeMode === "single" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-(--text-secondary) uppercase tracking-wider ml-1">
                Contact Name
              </label>
              <input
                placeholder="Search or enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-3 text-sm border-none rounded-xl bg-(--bg-secondary) focus:ring-2 focus:ring-(--primary)/20 outline-none text-(--text-primary)"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-(--text-secondary) uppercase tracking-wider ml-1">
                Phone Number
              </label>
              <input
                placeholder="e.g. 919876543210"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="p-3 text-sm border-none rounded-xl bg-(--bg-secondary) focus:ring-2 focus:ring-(--primary)/20 outline-none text-(--text-primary)"
              />
            </div>
          </div>
        )}

        {/* MESSAGE TEXTAREA */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-(--text-secondary) uppercase tracking-wider ml-1">
            Your Message
          </label>
          <textarea
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="p-4 text-sm border-none rounded-2xl bg-(--bg-secondary) focus:ring-2 focus:ring-(--primary)/20 outline-none text-(--text-primary) min-h-45 resize-none leading-relaxed"
          />
        </div>

        {/* MESSAGE HISTORY (Preview in Composer) */}
        {activeMode === "single" && chatMessages.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-bold text-(--text-secondary) uppercase tracking-wider">
                Recent History
              </label>
              <button
                onClick={() => setIsChatMode(true)}
                className="text-[10px] font-bold text-(--primary) hover:underline"
              >
                Full Chat View
              </button>
            </div>
            <div className="flex flex-col gap-2 p-4 bg-(--bg-secondary)/50 rounded-2xl max-h-50 overflow-y-auto custom-scrollbar border border-(--border)">
              {chatMessages.slice(-5).map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] p-2 rounded-xl text-xs ${
                    msg.fromMe
                      ? "bg-(--primary) text-white self-end rounded-tr-none"
                      : "bg-white text-(--text-primary) self-start rounded-tl-none shadow-sm"
                  }`}
                >
                  <p>{msg.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEND BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className="w-full py-4 bg-(--primary) text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none mt-2 active:scale-[0.98]"
        >
          {!messageSending ? (
            <>
              <SendIcon fontSize="small" />
              {activeMode === "single"
                ? "Send Message"
                : `Send to ${activeMode === "multiple" ? multipleNumber.length : multipleGroup.length} ${activeMode === "multiple" ? "Contacts" : "Groups"}`}
            </>
          ) : (
            <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          )}
        </button>
      </div>
    </div>
  );
}

export default ComposerView;
