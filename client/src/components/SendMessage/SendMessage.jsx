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

  const { darkMode } = useContext(DarkModeContext);
  const dispatch = useDispatch();
  const contacts = useSelector((state) => state.contact.contacts);
  const defaulMessages = useSelector(
    (state) => state.defaultMessages.defaultMessages,
  );
  const groups = useSelector((state) => state.groups.groups);

  useEffect(() => {
    dispatch(fetchContactSlice());
    dispatch(fetchDefaultMessage());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchGroups(sessionId));
    fetchChatsWithMessages();
  }, [dispatch, sessionId]);

  const fetchChatsWithMessages = async () => {
    const chatIds = await messageModules.getChats(sessionId);
    setChatsWithMessages(chatIds);
  };

  const fetchChatMessages = async (whatsappId) => {
    const messages = await messageModules.getMessages(sessionId, whatsappId);
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

  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (msg.sessionId === sessionId) {
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
  }, [sessionId, selectedContactWhatsappId]);

  useEffect(() => {
    const handleReady = (data) => {
      if (data.sessionId === sessionId) {
        dispatch(fetchGroups(sessionId));
        dispatch(fetchContactSlice());
        fetchChatsWithMessages();
      }
    };

    const handleContactsSynced = (data) => {
      if (data.sessionId === sessionId) {
        dispatch(fetchContactSlice());
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
    await messageModules.sendMessage(sessionId, number, message);
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
      dispatch(addContactSlice(formData));
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
        bulkUploadContactsSlice(parsedContacts),
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
          setNumber(c.phoneNumber);
          setSelectedContactWhatsappId(c.whatsappId || c.phoneNumber);
          fetchChatMessages(c.whatsappId || c.phoneNumber);
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

        {/* Composer Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          {isChatMode && activeMode === "single" && number ? (
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

      {/* 3. RIGHT SIDEBAR (Default Messages) */}
      <div className="h-full shrink-0 flex flex-col bg-(--sidebar) border-l border-(--border)">
        <div className="p-4 h-15 flex items-center justify-between bg-(--header) border-b border-(--border)">
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
    </div>
  );
}

export default SendMessage;
