import { useState, useEffect, useRef, useContext } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { messageModules } from "../../modules/messageModules";

import {
  contectFormData,
  messageTempleteFormData,
} from "../../utils/constants/sendMessageFields";
import FileUploadModal from "./FileUploadModal";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchContactSlice,
  addContactSlice,
  updateContactSlice,
  deleteContactSlice,
  bulkUploadContactsSlice,
  bulkDeleteContactsSlice,
} from "../../store/slices/contactSlices";
import {
  fetchDefaultMessage,
  addDefaultMessage,
  updateDefaultMessage,
  deleteDefaultMessage,
} from "../../store/slices/defaultMessagesSlices";
import { fetchGroups } from "../../store/slices/groupSlices.js";
import UnifiedSidebar from "./sidebar/UnifiedSidebar";
import DefaultMessageSidebar from "./sidebar/DefaultMessageSidebar";
import ChatView from "./ChatView";
import ComposerView from "./ComposerView";

import toast from "../../utils/Toast";
import AddEntityForm from "./AddEntityForm";

import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

import { socket } from "../../socket";

function SendMessage({ sessionId }) {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [isGroupBollean, setIsGroupBollean] = useState(false);
  const [multipleNumber, setMultipleNumber] = useState([]);
  const [message, setMessage] = useState("");
  const [messageSending, setMessageSEnding] = useState(false);

  const [isGroup, setIsGroup] = useState(false);
  const [multipleGroup, setMultipleGroup] = useState([]);

  const [openBox, setOpenBox] = useState(false);
  const [addContact, setAddContact] = useState(true);
  const [isMultiple, setIsMultiple] = useState(false);

  const [multipleContentAdd, setMutltipleContentAdd] = useState(false);
  const [parsedContacts, setParsedContacts] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editContactId, setEditContactId] = useState(null);
  const [editTemplateId, setEditTemplateId] = useState(null);

  const [contactDetails, setContactDetails] = useState({});
  const [templateDetails, setTemplateDetails] = useState({});

  const [viewMode, setViewMode] = useState("all"); // "all" or "chats"
  const [chatsWithMessages, setChatsWithMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedContactWhatsappId, setSelectedContactWhatsappId] =
    useState(null);
  const [isChatMode, setIsChatMode] = useState(false);

  // Shared Chats State
  const [assignedChats, setAssignedChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // Right Sidebar State
  const [activeRightTab, setActiveRightTab] = useState("templates");
  const [chatNotes, setChatNotes] = useState("");

  const { darkMode } = useContext(DarkModeContext);
  const dispatch = useDispatch();
  const contacts = useSelector((state) => state.contact.contacts);
  const defaulMessages = useSelector(
    (state) => state.defaultMessages.defaultMessages,
  );
  const groups = useSelector((state) => state.groups.groups);

  const fetchAssignedChats = async () => {
    const chats = await messageModules.getAssignedChats();
    setAssignedChats(chats);
    
    // Auto-join socket rooms for the sessions of assigned chats
    const uniqueSessions = [...new Set(chats.map(c => c.sessionId))];
    uniqueSessions.forEach(sessId => {
      socket.emit("join-room", { room: `session_${sessId}` });
    });
  };

  useEffect(() => {
    if (sessionId) {
      console.log("Initial fetch for session:", sessionId);
      if (sessionId === "shared-chats") {
        fetchAssignedChats();
      } else {
        dispatch(fetchContactSlice(sessionId));
        dispatch(fetchDefaultMessage());
        dispatch(fetchGroups(sessionId));
        fetchChatsWithMessages();
      }
    }
  }, [dispatch, sessionId]);

  const fetchChatsWithMessages = async () => {
    if (!sessionId || sessionId === "shared-chats") return;
    const chatIds = await messageModules.getChats(sessionId);
    setChatsWithMessages(chatIds);
  };

  const fetchChatMessages = async (whatsappId, customSessionId = null) => {
    const targetSession = customSessionId || (sessionId === "shared-chats" ? selectedChat?.sessionId : sessionId);
    if (!targetSession) return;
    const messages = await messageModules.getMessages(targetSession, whatsappId);
    setChatMessages(messages);
  };

  const normalizeId = (id) => {
    if (!id) return "";
    if (id.includes("@g.us")) return id;
    if (id.includes("@broadcast")) return id;
    if (id.includes("@lid")) return id;
    const clean = id.split("@")[0].replace(/\D/g, "");
    return `${clean}@c.us`;
  };

  // Sync Notes Effect
  useEffect(() => {
    const loadNotes = async () => {
      const targetSession = sessionId === "shared-chats" ? selectedChat?.sessionId : sessionId;
      const targetChat = selectedContactWhatsappId;
      if (targetSession && targetChat) {
        const notesText = await messageModules.getNotes(targetSession, targetChat);
        setChatNotes(notesText || "");
      } else {
        setChatNotes("");
      }
    };
    loadNotes();
  }, [sessionId, selectedContactWhatsappId, selectedChat]);

  // Socket Note Updates
  useEffect(() => {
    const handleNotesUpdated = (data) => {
      const targetSession = sessionId === "shared-chats" ? selectedChat?.sessionId : sessionId;
      const targetChat = selectedContactWhatsappId;
      if (data.sessionId === targetSession && data.chatId === targetChat) {
        setChatNotes(data.notes || "");
      }
    };
    socket.on("notes-updated", handleNotesUpdated);
    return () => {
      socket.off("notes-updated", handleNotesUpdated);
    };
  }, [sessionId, selectedContactWhatsappId, selectedChat]);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (sessionId === "shared-chats") {
        // If we are in shared mode and have an open chat from this session, update it
        const openChatId = selectedChat?.chatId || selectedContactWhatsappId;
        const openSessionId = selectedChat?.sessionId;
        if (msg.sessionId === openSessionId) {
          const contactIdInMsg = msg.fromMe ? msg.to : msg.from;
          if (normalizeId(contactIdInMsg) === normalizeId(openChatId)) {
            setChatMessages((prev) => {
              if (prev.some((m) => m.whatsappId === msg.whatsappId)) return prev;
              return [...prev, msg];
            });
          }
        }
        fetchAssignedChats();
      } else if (msg.sessionId === sessionId) {
        fetchChatsWithMessages();

        const contactIdInMsg = msg.fromMe ? msg.to : msg.from;
        const normalizedIncoming = normalizeId(contactIdInMsg);
        const normalizedSelected = normalizeId(selectedContactWhatsappId);

        if (normalizedIncoming === normalizedSelected) {
          setChatMessages((prev) => {
            if (prev.some((m) => m.whatsappId === msg.whatsappId)) return prev;
            return [...prev, msg];
          });
        }
      }
    };

    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [sessionId, selectedContactWhatsappId, selectedChat]);

  const authData = useSelector((state) => state.auth.authData);
  const currentUserId = authData?.user?.id;

  // Join user-specific socket room
  useEffect(() => {
    if (currentUserId) {
      socket.emit("join-room", { room: `user_${currentUserId}` });
      console.log(`Joined socket room: user_${currentUserId}`);
    }
  }, [currentUserId]);

  // Listen for assignment updates
  useEffect(() => {
    const handleAssignmentsUpdated = (data) => {
      console.log("Assignments updated event:", data);
      if (sessionId === "shared-chats") {
        fetchAssignedChats();

        // If this chat was unassigned from me, clear selected state if it matches
        if (data.action === "unassigned") {
          const currentChatId = selectedChat?.chatId || selectedContactWhatsappId;
          const currentSessionId = selectedChat?.sessionId;
          if (
            data.sessionId === currentSessionId &&
            normalizeId(data.chatId) === normalizeId(currentChatId)
          ) {
            setSelectedContactWhatsappId(null);
            setSelectedChat(null);
            setNumber("");
            setName("");
            toast.info("This chat assignment has been removed by the administrator.");
          }
        }
      }
    };

    socket.on("assignments-updated", handleAssignmentsUpdated);
    return () => {
      socket.off("assignments-updated", handleAssignmentsUpdated);
    };
  }, [sessionId, selectedChat, selectedContactWhatsappId]);

  useEffect(() => {
    const handleReady = (data) => {
      if (data.sessionId === sessionId) {
        console.log("Session ready, fetching groups...");
        dispatch(fetchGroups(sessionId));
        dispatch(fetchContactSlice(sessionId));
        fetchChatsWithMessages();
      }
    };

    const handleContactsSynced = (data) => {
      if (data.sessionId === sessionId) {
        dispatch(fetchContactSlice(sessionId));
        toast.success(`Synced ${data.count} contacts`);
      }
    };

    socket.on("ready", handleReady);
    socket.on("contacts-synced", handleContactsSynced);
    return () => {
      socket.off("ready", handleReady);
      socket.off("contacts-synced", handleContactsSynced);
    };
  }, [sessionId, dispatch]);

  const sendMessage = async () => {
    if (!number || !message) return toast.error("Fill all fields");
    setMessageSEnding(true);
    const targetSession = sessionId === "shared-chats" ? selectedChat?.sessionId : sessionId;
    await messageModules.sendMessage(targetSession, number, message);
    setMessageSEnding(false);
    setMessage("");
  };

  const sendMultipleMessages = async () => {
    if (multipleNumber.length === 0 || !message)
      return toast.error("Fill all fields");
    setMessageSEnding(true);
    await messageModules.sendMultipleMessages(
      sessionId,
      multipleNumber,
      message,
    );
    setMultipleNumber([]);
    setMessage("");
    setMessageSEnding(false);
  };

  const sendMultipleGroupMessages = async () => {
    if (multipleGroup.length === 0 || !message) {
      return toast.error("Fill all fields");
    }
    setMessageSEnding(true);
    await messageModules.sendMultipleGroupMessages(
      sessionId,
      multipleGroup,
      message,
    );
    setMultipleGroup([]);
    setMessage("");
    setMessageSEnding(false);
  };

  const handleCancle = () => {
    setOpenBox(false);
    setEditContactId(null);
    setEditTemplateId(null);
    setMutltipleContentAdd(false);
    setFile(null);
    setParsedContacts([]);
  };

  const handleContectSubmit = (formData) => {
    if (editContactId !== null) {
      dispatch(updateContactSlice({ id: editContactId, formData }));
    } else {
      dispatch(addContactSlice({ ...formData, sessionId }));
    }
    handleCancle();
  };

  const handleMessageTempleteSubmit = (formData) => {
    if (editTemplateId !== null) {
      dispatch(updateDefaultMessage({ id: editTemplateId, formData }));
    } else {
      dispatch(addDefaultMessage(formData));
    }
    handleCancle();
  };

  const handleUpload = async () => {
    if (!parsedContacts.length) return toast.error("No valid contacts found");
    try {
      setLoading(true);
      const res = await dispatch(
        bulkUploadContactsSlice({ contacts: parsedContacts, sessionId }),
      ).unwrap();
      toast.success(`Created: ${res.created}, Failed: ${res.failed}`);
      handleCancle();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const activeMode = isGroup ? "group" : isMultiple ? "multiple" : "single";

  return (
    <div className="flex h-full w-full overflow-hidden bg-(--bg-chat)">
      {/* 1. LEFT SIDEBAR */}
      <UnifiedSidebar
        contacts={contacts}
        multipleNumber={multipleNumber}
        setMultipleNumber={setMultipleNumber}
        onSelect={(c) => {
          setIsMultiple(false);
          setName(c.name);
          setNumber(c.chatId || c.phoneNumber || c.whatsappId);
          setIsGroupBollean(c.isGroup || false);
          setSelectedContactWhatsappId(c.chatId || c.phoneNumber || c.whatsappId);
          setSelectedChat(sessionId === "shared-chats" ? c : null);
          if (sessionId === "shared-chats") {
            setIsChatMode(true);
            socket.emit("join-room", { room: `session_${c.sessionId}` });
            fetchChatMessages(c.chatId || c.phoneNumber || c.whatsappId, c.sessionId);
          } else {
            fetchChatMessages(c.whatsappId || c.phoneNumber, sessionId);
          }
        }}
        onEdit={(index, item) => {
          setOpenBox(true);
          setAddContact(true);
          setEditContactId(item._id);
          setContactDetails(item);
        }}
        onDelete={(id) => dispatch(deleteContactSlice(id))}
        onBulkDelete={(multiple) => {
          dispatch(bulkDeleteContactsSlice(multiple));
          setMultipleNumber([]);
        }}
        onAddContact={() => {
          setOpenBox(true);
          setAddContact(true);
          setEditContactId(null);
          setContactDetails({});
        }}
        onAddMultiple={() => setMutltipleContentAdd(true)}
        isGroupMode={isGroup}
        setIsGroupMode={setIsGroup}
        viewMode={viewMode}
        setViewMode={setViewMode}
        chatsWithMessages={chatsWithMessages}
        groups={groups}
        multipleGroup={multipleGroup}
        setMultipleGroup={setMultipleGroup}
        selectedContactWhatsappId={selectedContactWhatsappId}
        sessionId={sessionId}
        assignedChats={assignedChats}
      />

      {/* 2. CENTER: Composer Area */}
      <div className="flex-1 h-full flex flex-col relative min-w-0 bg-(--bg-chat)">
        {/* Background Pattern Overlay */}
        <div
          className={`absolute inset-0 pointer-events-none z-0 ${darkMode ? "invert grayscale opacity-[0.2]" : "opacity-[0.4]"}`}
          style={{
            backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
            backgroundRepeat: "repeat",
            backgroundSize: "400px",
          }}
        />

        {/* Overlay for Form modals */}
        {(openBox || multipleContentAdd) && (
          <div className="absolute inset-0 z-50 bg-(--bg-chat)/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="w-full max-w-xl animate-fade-in">
              {multipleContentAdd ? (
                <FileUploadModal
                  isOpen={multipleContentAdd}
                  file={file}
                  setFile={setFile}
                  loading={loading}
                  onUpload={handleUpload}
                  onCancel={handleCancle}
                  title="Bulk Upload Contacts (PDF)"
                  setParsedContacts={setParsedContacts}
                />
              ) : (
                <AddEntityForm
                  handleSubmit={
                    addContact
                      ? handleContectSubmit
                      : handleMessageTempleteSubmit
                  }
                  editEntityId={addContact ? editContactId : editTemplateId}
                  handleCancle={handleCancle}
                  entity={addContact ? contactDetails : templateDetails}
                  formDataFields={
                    addContact
                      ? contectFormData.field(editContactId, contactDetails)
                      : messageTempleteFormData.field(
                          editTemplateId,
                          templateDetails,
                        )
                  }
                  formDataButtons={
                    addContact
                      ? contectFormData.buttons
                      : messageTempleteFormData.buttons
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* Composer Header (Tab Switcher) */}
        {sessionId !== "shared-chats" && (
          <div className="h-12.5 bg-(--header)/90 backdrop-blur-md border-b border-(--border) flex items-center justify-center px-4 shrink-0 z-20">
            <div className="flex bg-(--bg-secondary) p-1 rounded-full gap-1">
              {[
                {
                  id: "single",
                  label: "Single",
                  icon: <PersonIcon fontSize="inherit" />,
                  onClick: () => {
                    setIsMultiple(false);
                    setIsGroup(false);
                    setViewMode("all");
                  },
                },
                {
                  id: "chat",
                  label: "Chat Mode",
                  icon: <SendIcon fontSize="inherit" />,
                  onClick: () => {
                    setIsChatMode(true);
                    setIsMultiple(false);
                    setIsGroup(false);
                    setViewMode("chats");
                  },
                },
                {
                  id: "multiple",
                  label: "Multiple",
                  icon: <PeopleIcon fontSize="inherit" />,
                  onClick: () => {
                    setIsMultiple(true);
                    setIsGroup(false);
                    setViewMode("all");
                  },
                },
                {
                  id: "group",
                  label: "Groups",
                  icon: <GroupsIcon fontSize="inherit" />,
                  onClick: () => {
                    setIsMultiple(false);
                    setIsGroup(true);
                  },
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={tab.onClick}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    (
                      tab.id === "chat"
                        ? isChatMode
                        : !isChatMode && activeMode === tab.id
                    )
                      ? "bg-white text-(--primary) shadow-sm"
                      : "text-(--text-secondary) hover:bg-(--primary-hover) hover:text-white"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
            {isChatMode && (
              <button
                onClick={() => setIsChatMode(false)}
                className="ml-auto text-xs font-bold text-(--primary) hover:underline"
              >
                Exit Chat Mode
              </button>
            )}
          </div>
        )}

        {/* Composer Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          {sessionId === "shared-chats" && !number ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-(--bg-primary) w-full h-full rounded-3xl shadow-xl border border-(--border) relative z-10">
              <div className="w-48 h-48 opacity-20 mb-6 grayscale">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WA"
                  className="w-full h-full"
                />
              </div>
              <h2 className="text-2xl font-light text-(--text-primary) mb-3">
                Shared Chats
              </h2>
              <p className="text-(--text-secondary) max-w-md leading-relaxed">
                Select an assigned chat from the sidebar to view messages and start chatting.
              </p>
            </div>
          ) : isChatMode && activeMode === "single" && number ? (
            <ChatView
              name={name}
              number={number}
              chatMessages={chatMessages}
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              messageSending={messageSending}
              darkMode={darkMode}
              selectedContactWhatsappId={selectedContactWhatsappId}
              fetchChatMessages={fetchChatMessages}
              isGroupBollean={isGroupBollean}
              contacts={contacts}
              sessionId={sessionId === "shared-chats" ? selectedChat?.sessionId : sessionId}
              isSharedChatsMode={sessionId === "shared-chats"}
            />
          ) : (
            <ComposerView
              activeMode={activeMode}
              multipleNumber={multipleNumber}
              setMultipleNumber={setMultipleNumber}
              multipleGroup={multipleGroup}
              setMultipleGroup={setMultipleGroup}
              name={name}
              setName={setName}
              number={number}
              setNumber={setNumber}
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              sendMultipleMessages={sendMultipleMessages}
              sendMultipleGroupMessages={sendMultipleGroupMessages}
              messageSending={messageSending}
              chatMessages={chatMessages}
              setIsChatMode={setIsChatMode}
            />
          )}
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR (Tabbed default templates and shared notes) */}
      <div className="h-full w-80 shrink-0 flex flex-col bg-(--sidebar) border-l border-(--border)">
        {/* Tab Headers */}
        <div className="flex bg-(--header) border-b border-(--border) shrink-0">
          <button
            onClick={() => setActiveRightTab("templates")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              activeRightTab === "templates"
                ? "border-(--primary) text-(--primary)"
                : "border-transparent text-(--text-secondary) hover:text-(--text-primary)"
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveRightTab("notes")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              activeRightTab === "notes"
                ? "border-(--primary) text-(--primary)"
                : "border-transparent text-(--text-secondary) hover:text-(--text-primary)"
            }`}
          >
            Notes
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeRightTab === "templates" ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-(--border)/40 shrink-0">
                <div className="flex items-center gap-2">
                  <LibraryBooksIcon className="text-(--primary)" fontSize="small" />
                  <h3 className="font-semibold text-sm">Templates</h3>
                </div>
                <button
                  onClick={() => {
                    setOpenBox(true);
                    setAddContact(false);
                    setEditTemplateId(null);
                    setTemplateDetails({});
                  }}
                  className="p-2 text-(--primary) hover:bg-(--bg-secondary) rounded-full"
                >
                  <AddIcon fontSize="small" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <DefaultMessageSidebar
                  defaulMessages={defaulMessages}
                  onSelect={(msg) => setMessage(msg)}
                  onEdit={(index, item) => {
                    setOpenBox(true);
                    setAddContact(false);
                    setEditTemplateId(item._id);
                    setTemplateDetails(item);
                  }}
                  onDelete={(id) => dispatch(deleteDefaultMessage(id))}
                />
              </div>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-4 h-full overflow-y-auto">
              <h3 className="font-semibold text-sm text-(--text-primary)">
                Notes for {name || number || "Selected Chat"}
              </h3>
              {selectedContactWhatsappId ? (
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                  <textarea
                    value={chatNotes}
                    onChange={(e) => setChatNotes(e.target.value)}
                    placeholder="Write shared notes here... (Visible to everyone assigned to this chat)"
                    className="w-full flex-1 p-4 text-sm border border-(--border) rounded-2xl bg-(--bg-secondary) focus:ring-1 focus:ring-(--primary) outline-none text-(--text-primary) resize-none min-h-60 custom-scrollbar"
                  />
                  <div className="flex justify-between items-center text-xs text-(--text-secondary) px-1 shrink-0">
                    <span className={chatNotes.trim().split(/\s+/).filter(Boolean).length > 500 ? "text-red-500 font-bold" : ""}>
                      {chatNotes.trim().split(/\s+/).filter(Boolean).length} / 500 words
                    </span>
                    {chatNotes.trim().split(/\s+/).filter(Boolean).length > 500 && (
                      <span className="text-red-500 font-bold">Limit exceeded</span>
                    )}
                  </div>
                  <button
                    disabled={chatNotes.trim().split(/\s+/).filter(Boolean).length > 500}
                    onClick={async () => {
                      const targetSession = sessionId === "shared-chats" ? selectedChat?.sessionId : sessionId;
                      const targetChat = selectedContactWhatsappId;
                      if (targetSession && targetChat) {
                        try {
                          await messageModules.saveNotes(targetSession, targetChat, chatNotes);
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                    className="w-full py-3 bg-(--primary) hover:bg-(--primary-hover) text-white font-bold text-xs uppercase rounded-xl shadow-lg transition-all tracking-wider shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Notes
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center opacity-40 text-center text-xs">
                  Select a chat to view and edit shared notes
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SendMessage;
