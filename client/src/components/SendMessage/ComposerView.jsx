import { Avatar } from "../Forms/Avatar";
import SendIcon from "@mui/icons-material/Send";
import ClearIcon from "@mui/icons-material/Clear";

import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import ChatIcon from "@mui/icons-material/Chat";
import HistoryIcon from "@mui/icons-material/History";
import PhoneIcon from "@mui/icons-material/Phone";

function ComposerView({
  activeMode,
  multipleNumber = [],
  setMultipleNumber,
  multipleGroup = [],
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
  chatMessages = [],
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

  const getModeIcon = () => {
    if (activeMode === "single") {
      return <PersonIcon fontSize="small" />;
    }

    if (activeMode === "multiple") {
      return <PeopleIcon fontSize="small" />;
    }

    return <GroupsIcon fontSize="small" />;
  };

  return (
    <div className="w-full max-w-3xl bg-(--bg-primary) rounded-3xl shadow-2xl overflow-hidden border border-(--border)">
      {/* HEADER */}
      <div className="px-6 py-5 bg-(--bg-secondary)/70 backdrop-blur-xl border-b border-(--border) flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-(--primary)/10 text-(--primary) flex items-center justify-center">
            {getModeIcon()}
          </div>

          <div>
            <h3 className="font-bold text-base text-(--text-primary)">
              {activeMode === "single" && "Single Message"}
              {activeMode === "multiple" && "Multiple Contacts"}
              {activeMode === "group" && "Group Broadcast"}
            </h3>

            <p className="text-xs text-(--text-secondary)">
              {activeMode === "single" && "Send message to one contact"}
              {activeMode === "multiple" &&
                "Send same message to multiple contacts"}
              {activeMode === "group" && "Send message to selected groups"}
            </p>
          </div>
        </div>

        {/* COUNTER */}
        {(activeMode === "multiple" || activeMode === "group") && (
          <div
            className={`px-3 py-2 rounded-2xl text-xs font-bold shadow-sm ${
              activeMode === "multiple"
                ? "bg-blue-500/10 text-blue-500"
                : "bg-green-500/10 text-green-500"
            }`}
          >
            {activeMode === "multiple"
              ? `${multipleNumber.length} CONTACTS`
              : `${multipleGroup.length} GROUPS`}
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="p-6 flex flex-col gap-6">
        {/* SELECTED RECIPIENTS */}
        {(activeMode === "multiple" || activeMode === "group") && (
          <div className="rounded-3xl border border-dashed border-(--border) bg-(--bg-secondary)/30 p-4 min-h-30 max-h-45 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-4">
              {activeMode === "multiple" ? (
                <PeopleIcon fontSize="small" className="text-blue-500" />
              ) : (
                <GroupsIcon fontSize="small" className="text-green-500" />
              )}

              <h4 className="text-sm font-semibold text-(--text-primary)">
                Selected {activeMode === "multiple" ? "Contacts" : "Groups"}
              </h4>
            </div>

            <div className="flex flex-wrap gap-3">
              {activeMode === "multiple" && multipleNumber.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-6 opacity-40">
                  <PeopleIcon sx={{ fontSize: 36 }} />
                  <p className="text-xs mt-2">Select contacts from sidebar</p>
                </div>
              )}

              {activeMode === "group" && multipleGroup.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-6 opacity-40">
                  <GroupsIcon sx={{ fontSize: 36 }} />
                  <p className="text-xs mt-2">Select groups from sidebar</p>
                </div>
              )}

              {/* MULTIPLE CONTACTS */}
              {activeMode === "multiple" &&
                multipleNumber.map((c) => (
                  <div
                    key={c._id}
                    className="group flex items-center gap-3 px-3 py-2 rounded-2xl bg-(--bg-primary) border border-(--border) hover:border-(--primary)/30 transition-all shadow-sm"
                  >
                    <Avatar name={c.name} className="w-8! h-8!" />

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-(--text-primary) truncate">
                        {c.name || "Unknown"}
                      </p>
                      <p className="text-[10px] text-(--text-secondary) opacity-60">
                        {c.phoneNumber}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setMultipleNumber((prev) =>
                          prev.filter((p) => p._id !== c._id),
                        )
                      }
                      className="ml-1 opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <ClearIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                ))}

              {/* GROUPS */}
              {activeMode === "group" &&
                multipleGroup.map((g) => (
                  <div
                    key={g.id || g._id}
                    className="group flex items-center gap-3 px-3 py-2 rounded-2xl bg-(--bg-primary) border border-(--border) hover:border-(--primary)/30 transition-all shadow-sm"
                  >
                    <Avatar name={g.name} className="w-8! h-8!" />

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-(--text-primary) truncate">
                        {g.name}
                      </p>
                      <p className="text-[10px] text-(--text-secondary) opacity-60">
                        Group Chat
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setMultipleGroup((prev) =>
                          prev.filter(
                            (p) => (p.id || p._id) !== (g.id || g._id),
                          ),
                        )
                      }
                      className="ml-1 opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <ClearIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* SINGLE MODE INPUTS */}
        {activeMode === "single" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* NAME */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-(--text-secondary)">
                <PersonIcon sx={{ fontSize: 14 }} />
                Contact Name
              </label>

              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-(--bg-secondary) border border-transparent focus-within:border-(--primary)/30 transition-all">
                <PersonIcon
                  fontSize="small"
                  className="text-(--text-secondary) opacity-50"
                />

                <input
                  placeholder="Enter contact name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full text-(--text-primary)"
                />
              </div>
            </div>

            {/* PHONE */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-(--text-secondary)">
                <PhoneIcon sx={{ fontSize: 14 }} />
                Phone Number
              </label>

              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-(--bg-secondary) border border-transparent focus-within:border-(--primary)/30 transition-all">
                <PhoneIcon
                  fontSize="small"
                  className="text-(--text-secondary) opacity-50"
                />

                <input
                  placeholder="e.g. 919876543210"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full text-(--text-primary)"
                />
              </div>
            </div>
          </div>
        )}

        {/* MESSAGE */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-(--text-secondary)">
            <ChatIcon sx={{ fontSize: 14 }} />
            Your Message
          </label>

          <textarea
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="p-5 text-sm border-none rounded-3xl bg-(--bg-secondary) focus:ring-2 focus:ring-(--primary)/20 outline-none text-(--text-primary) min-h-52 resize-none leading-relaxed transition-all"
          />
        </div>

        {/* RECENT HISTORY */}
        {activeMode === "single" && chatMessages.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HistoryIcon fontSize="small" className="text-(--primary)" />

                <label className="text-[11px] font-bold uppercase tracking-wider text-(--text-secondary)">
                  Recent History
                </label>
              </div>

              <button
                onClick={() => setIsChatMode(true)}
                className="text-[11px] font-bold text-(--primary) hover:underline"
              >
                Open Full Chat
              </button>
            </div>

            <div className="flex flex-col gap-3 p-4 bg-(--bg-secondary)/40 rounded-3xl max-h-50 overflow-y-auto custom-scrollbar border border-(--border)">
              {chatMessages.slice(-5).map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs shadow-sm ${
                    msg.fromMe
                      ? "bg-(--primary) text-white self-end rounded-br-sm"
                      : "bg-(--bg-primary) text-(--text-primary) self-start rounded-bl-sm border border-(--border)"
                  }`}
                >
                  <p className="whitespace-pre-wrap wrap-break-word">
                    {msg.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEND BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className="w-full py-4 rounded-3xl bg-(--primary) text-white font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none active:scale-[0.99]"
        >
          {!messageSending ? (
            <>
              <SendIcon fontSize="small" />

              {activeMode === "single" && "Send Message"}

              {activeMode === "multiple" &&
                `Send to ${multipleNumber.length} Contacts`}

              {activeMode === "group" &&
                `Send to ${multipleGroup.length} Groups`}
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
