import { useState, useEffect, useContext } from "react";
import EditIcon from "@mui/icons-material/Edit";
import VerticalNav from "../components/VerticalNav";
import DeleteIcon from "@mui/icons-material/Delete";
import FormField from "../components/Forms/FormField";
import VerifiedIcon from "@mui/icons-material/Verified";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  defaultKeywordsReplayeFormData,
  defaultKeywordsMessageFormData,
} from "../utils/constants/defaultKeywordsReplayeFormData";
import { logout } from "../store/slices/authSlices";
import { SocketContext } from "../context/scoketContext";

function DefaultKeywordsReplyePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users } = useSelector((state) => state.user);
  const { activeUser, switchUser, status } = useContext(SocketContext);

  // Auto-switch to first available user if no activeUser is currently selected
  useEffect(() => {
    if (users && users.length > 0 && !activeUser) {
      switchUser(users[0]);
    }
  }, [users, activeUser, switchUser]);

  // Local states for keywords and reply messages
  const [defaultWords, setDefaultWords] = useState([]);
  const [defaulWordsMessages, setDefaulWordsMessages] = useState([]);
  const [defaultMessageId, setDefaultMessageId] = useState(null);

  // Fetch / Sync keywords and reply messages from localStorage depending on the active user session
  useEffect(() => {
    if (!activeUser) {
      setDefaultWords([]);
      setDefaulWordsMessages([]);
      setDefaultMessageId(null);
      return;
    }

    // Initialize or read keywords for this session
    const savedKeywords = localStorage.getItem(`keywords_${activeUser}`);
    if (savedKeywords) {
      setDefaultWords(JSON.parse(savedKeywords));
    } else {
      const initialKeywords = [
        { _id: "1", defaultKeyword: "hey" },
        { _id: "2", defaultKeyword: "hi" },
        { _id: "3", defaultKeyword: "oyy" },
      ];
      setDefaultWords(initialKeywords);
      localStorage.setItem(`keywords_${activeUser}`, JSON.stringify(initialKeywords));
    }

    // Initialize or read reply messages for this session
    let currentMessages = [];
    const savedMessages = localStorage.getItem(`messages_${activeUser}`);
    if (savedMessages) {
      currentMessages = JSON.parse(savedMessages);
      setDefaulWordsMessages(currentMessages);
    } else {
      currentMessages = [
        { _id: "1", defaulWordsMessages: "Hello! Welcome to our automated assistant. How can we help you today?" },
        { _id: "2", defaulWordsMessages: "Hi there! We will get back to you shortly." },
        { _id: "3", defaulWordsMessages: "Need help? Type 'info' or 'support' for options." },
      ];
      setDefaulWordsMessages(currentMessages);
      localStorage.setItem(`messages_${activeUser}`, JSON.stringify(currentMessages));
    }

    const savedDefaultMsgId = localStorage.getItem(`defaultMessageId_${activeUser}`);
    if (savedDefaultMsgId) {
      setDefaultMessageId(savedDefaultMsgId);
    } else {
      if (currentMessages && currentMessages.length > 0) {
        setDefaultMessageId(currentMessages[0]._id);
        localStorage.setItem(`defaultMessageId_${activeUser}`, currentMessages[0]._id);
      } else {
        setDefaultMessageId(null);
      }
    }
  }, [activeUser]);

  const [defaultKeywordsInputFieldId, setDefaultKeywordsInputFieldId] =
    useState(null);
  const [
    updateDefaultkeyWordsInputFieldsValue,
    setUpdateDefaultkeyWordsInputFieldsValue,
  ] = useState([]);

  const handleSubmitDefaultKeywordsInputAdd = (formData) => {
    if (!activeUser) return;

    const keywordText = formData.defaultKeyword;
    if (!keywordText?.trim()) return;

    setDefaultWords((prev) => {
      let updatedList;
      if (defaultKeywordsInputFieldId) {
        // Update existing keyword
        updatedList = prev.map((item) =>
          item._id === defaultKeywordsInputFieldId
            ? { ...item, defaultKeyword: keywordText }
            : item
        );
      } else {
        // Add new keyword
        const newItem = {
          _id: Date.now().toString(),
          defaultKeyword: keywordText,
        };
        updatedList = [...prev, newItem];
      }
      localStorage.setItem(`keywords_${activeUser}`, JSON.stringify(updatedList));
      return updatedList;
    });

    setDefaultKeywordsInputFieldId(null);
    setUpdateDefaultkeyWordsInputFieldsValue([]);
  };

  const onEditDefaultKeyword = (d) => {
    setDefaultKeywordsInputFieldId(d._id);
    setUpdateDefaultkeyWordsInputFieldsValue(d);
  };

  const onDeleteDefaultKeyword = (id) => {
    if (!activeUser) return;
    setDefaultWords((prev) => {
      const updatedList = prev.filter((item) => item._id !== id);
      localStorage.setItem(`keywords_${activeUser}`, JSON.stringify(updatedList));
      return updatedList;
    });
    if (defaultKeywordsInputFieldId === id) {
      handleCancle();
    }
  };

  const [
    defaultKeywordsMessageInputFieldId,
    setDefaultKeywordsMessageInputFieldId,
  ] = useState(null);
  const [
    updateDefaultkeyWordsMessageInputFieldsValue,
    setUpdateDefaultkeyWordsMessageInputFieldsValue,
  ] = useState([]);

  const handleSubmitDefaultKeywordsMessageInputAdd = (formData) => {
    if (!activeUser) return;

    const messageText = formData.defaulWordsMessages;
    if (!messageText?.trim()) return;

    setDefaulWordsMessages((prev) => {
      let updatedList;
      if (defaultKeywordsMessageInputFieldId) {
        // Update existing message
        updatedList = prev.map((item) =>
          item._id === defaultKeywordsMessageInputFieldId
            ? { ...item, defaulWordsMessages: messageText }
            : item
        );
      } else {
        // Add new message
        const newItem = {
          _id: Date.now().toString(),
          defaulWordsMessages: messageText,
        };
        updatedList = [...prev, newItem];

        // If there was no default message, set this new one as default
        if (!defaultMessageId) {
          setDefaultMessageId(newItem._id);
          localStorage.setItem(`defaultMessageId_${activeUser}`, newItem._id);
        }
      }
      localStorage.setItem(`messages_${activeUser}`, JSON.stringify(updatedList));
      return updatedList;
    });

    setDefaultKeywordsMessageInputFieldId(null);
    setUpdateDefaultkeyWordsMessageInputFieldsValue([]);
  };

  const onEditDefaulWordsMessages = (dm) => {
    setDefaultKeywordsMessageInputFieldId(dm._id);
    setUpdateDefaultkeyWordsMessageInputFieldsValue(dm);
  };

  const handleSetDefaultMessage = (id) => {
    if (!activeUser) return;
    setDefaultMessageId(id);
    localStorage.setItem(`defaultMessageId_${activeUser}`, id);
  };

  const onDeletedefaulWordsMessages = (id) => {
    if (!activeUser) return;
    setDefaulWordsMessages((prev) => {
      const updatedList = prev.filter((item) => item._id !== id);
      localStorage.setItem(`messages_${activeUser}`, JSON.stringify(updatedList));

      // Update default message if the deleted one was default
      if (defaultMessageId === id) {
        const nextDefaultId = updatedList[0]?._id || null;
        setDefaultMessageId(nextDefaultId);
        if (nextDefaultId) {
          localStorage.setItem(`defaultMessageId_${activeUser}`, nextDefaultId);
        } else {
          localStorage.removeItem(`defaultMessageId_${activeUser}`);
        }
      }

      return updatedList;
    });
    if (defaultKeywordsMessageInputFieldId === id) {
      handleCancle();
    }
  };

  const handleCancle = () => {
    setDefaultKeywordsInputFieldId(null);
    setUpdateDefaultkeyWordsInputFieldsValue([]);
    setDefaultKeywordsMessageInputFieldId(null);
    setUpdateDefaultkeyWordsMessageInputFieldsValue([]);
  };

  const handleSwitchUser = (user) => {
    switchUser(user);
  };

  const handleDeleteUser = (e, user) => {
    // Session deletion is disabled on Settings page, handled on Home Page
  };

  const isConnected =
    status?.toLowerCase().includes("ready") ||
    status?.toLowerCase().includes("connected");

  const noSessionsAvailable = !users || users.length === 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-(--bg-app)">
      <VerticalNav
        users={users}
        activeUser={activeUser}
        onSwitchUser={handleSwitchUser}
        onAddSession={() => {}}
        onLogout={() => dispatch(logout())}
        onDeleteUser={handleDeleteUser}
        hideAddDelete={true}
      />

      <div className="flex-1 h-full flex flex-col bg-(--bg) overflow-hidden animate-fade-in relative">
        {/* Header containing Active User Session information */}
        <div className="bg-(--header) border-b border-(--border) flex items-center justify-between px-6 py-4 shrink-0 z-10 whatsapp-shadow">
          <div className="flex items-center gap-4">
            {activeUser ? (
              <>
                <div className="w-11 h-11 rounded-full bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md transform hover:scale-105 transition-transform duration-200">
                  {activeUser.slice(-2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-(--text-primary)">
                      {activeUser}
                    </h2>
                    {isConnected && (
                      <span className="text-(--primary) flex items-center" title="Connected">
                        <VerifiedIcon sx={{ fontSize: 16 }} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-(--text-secondary) flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-orange-400"} animate-pulse`}
                    />
                    {status || "Idle"}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
                <p className="text-sm font-medium text-(--text-secondary)">No active session selected</p>
              </div>
            )}
          </div>

          <div className="text-right">
            <h1 className="text-xl font-bold text-(--text-primary)">
              Auto Reply Settings
            </h1>
            <p className="text-xs text-(--text-secondary) mt-0.5">
              Configure your default keywords and reply messages
            </p>
          </div>
        </div>

        {noSessionsAvailable ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-(--bg-primary) animate-fade-in">
            <div className="w-48 h-48 opacity-20 mb-6 grayscale">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WA"
                className="w-full h-full"
              />
            </div>
            <h2 className="text-2xl font-light text-(--text-primary) mb-3">
              No Active Sessions
            </h2>
            <p className="text-(--text-secondary) max-w-md leading-relaxed mb-6">
              You must have at least one active WhatsApp session to configure auto-reply keywords.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-(--primary) hover:bg-(--primary-hover) text-white font-medium rounded-lg shadow-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Go to Home to Add Session
            </button>
          </div>
        ) : (
          <div className="p-6 w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
            {/* Left Column: Forms */}
            <div className="flex flex-col gap-6 min-h-0">
              {/* Keyword Form */}
              <FormField
                key={`keyword-form-${defaultKeywordsInputFieldId || "new"}`}
                className="max-w-none! m-0! flex flex-col flex-1 overflow-y-auto custom-scrollbar"
                header={
                  defaultKeywordsInputFieldId ? "Update Keyword" : "Add Keyword"
                }
                fields={defaultKeywordsReplayeFormData.field(
                  defaultKeywordsInputFieldId,
                  updateDefaultkeyWordsInputFieldsValue
                )}
                buttons={defaultKeywordsReplayeFormData.buttons(
                  handleCancle,
                  defaultKeywordsInputFieldId
                )}
                onSubmit={handleSubmitDefaultKeywordsInputAdd}
              />

              {/* Message Form */}
              <FormField
                key={`message-form-${defaultKeywordsMessageInputFieldId || "new"}`}
                className="max-w-none! m-0! flex flex-col flex-1 overflow-y-auto custom-scrollbar"
                header={
                  defaultKeywordsMessageInputFieldId
                    ? "Update Default Message"
                    : "Add Default Message"
                }
                fields={defaultKeywordsMessageFormData.field(
                  defaultKeywordsMessageInputFieldId,
                  updateDefaultkeyWordsMessageInputFieldsValue
                )}
                buttons={defaultKeywordsMessageFormData.buttons(
                  handleCancle,
                  defaultKeywordsMessageInputFieldId
                )}
                onSubmit={handleSubmitDefaultKeywordsMessageInputAdd}
              />
            </div>

            {/* Middle Column: Keywords List */}
            <div className="bg-(--bg-primary) rounded-xl p-6 whatsapp-shadow border border-(--border) flex flex-col min-h-[300px] lg:min-h-0">
              <h2 className="text-lg font-medium text-(--text-primary) mb-4 border-b border-(--border) pb-2 shrink-0">
                Active Keywords
              </h2>
              <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {defaultWords.length === 0 ? (
                  <p className="text-sm text-(--text-secondary) italic text-center py-4">
                    No keywords added yet.
                  </p>
                ) : (
                  defaultWords.map((d, idx) => (
                    <div
                      key={d._id || idx}
                      className="group flex items-center justify-between p-3 rounded-lg bg-(--bg-secondary) border border-(--border) hover:border-(--primary) transition-all shrink-0"
                    >
                      <p className="text-(--text-primary) font-medium">
                        {d.defaultKeyword}
                      </p>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditDefaultKeyword(d);
                          }}
                          className="p-1.5 text-(--text-secondary) hover:text-(--primary) hover:bg-(--bg-primary) rounded-full shadow-sm transition-colors cursor-pointer"
                        >
                          <EditIcon fontSize="small" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDefaultKeyword(d._id);
                          }}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-(--bg-primary) rounded-full shadow-sm transition-colors cursor-pointer"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Messages List */}
            <div className="bg-(--bg-primary) rounded-xl p-6 whatsapp-shadow border border-(--border) flex flex-col min-h-[300px] lg:min-h-0">
              <h2 className="text-lg font-medium text-(--text-primary) mb-4 border-b border-(--border) pb-2 shrink-0">
                Active Reply Messages
              </h2>
              <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {defaulWordsMessages.length === 0 ? (
                  <p className="text-sm text-(--text-secondary) italic text-center py-4">
                    No messages added yet.
                  </p>
                ) : (
                  defaulWordsMessages.map((dm, idx) => (
                    <div
                      key={dm._id || idx}
                      className={`group flex items-start justify-between p-4 rounded-lg bg-(--bg-secondary) border transition-all shrink-0 ${
                        defaultMessageId === dm._id
                          ? "border-(--primary) ring-1 ring-(--primary)/30"
                          : "border-(--border) hover:border-(--primary)"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 flex-1 mr-4">
                        <button
                          onClick={() => handleSetDefaultMessage(dm._id)}
                          className={`p-1 rounded-full transition-all shrink-0 cursor-pointer ${
                            defaultMessageId === dm._id
                              ? "text-yellow-500 hover:text-yellow-600 scale-110"
                              : "text-gray-400 hover:text-yellow-500 opacity-60 group-hover:opacity-100"
                          }`}
                          title={defaultMessageId === dm._id ? "Default Start Message" : "Set as Default Start Message"}
                        >
                          {defaultMessageId === dm._id ? (
                            <StarIcon fontSize="small" />
                          ) : (
                            <StarBorderIcon fontSize="small" />
                          )}
                        </button>
                        <p className="text-(--text-primary) text-sm whitespace-pre-wrap flex-1 mt-0.5">
                          {dm.defaulWordsMessages}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditDefaulWordsMessages(dm);
                          }}
                          className="p-1.5 text-(--text-secondary) hover:text-(--primary) hover:bg-(--bg-primary) rounded-full shadow-sm transition-colors cursor-pointer"
                        >
                          <EditIcon fontSize="small" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletedefaulWordsMessages(dm._id);
                          }}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-(--bg-primary) rounded-full shadow-sm transition-colors cursor-pointer"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DefaultKeywordsReplyePage;
