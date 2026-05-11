import { useState, useEffect } from "react";
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
import WhatsappGroupMessageSidebar from "./WhatsappGroupMessageSidebar.jsx";

import toast from "../../utils/Toast";

import ContactSidebar from "./ContactSidebar";
import DefaultMessageSidebar from "./DefaultMessageSidebar";
import AddEntityForm from "./AddEntityForm";

import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import ClearIcon from "@mui/icons-material/Clear";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

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
  }, [dispatch, sessionId]);

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
      {/* 1. LEFT SIDEBAR (Contacts/Groups) */}
      <div className="h-full flex shrink-0">
        {!isGroup ? (
          <ContactSidebar
            contacts={contacts}
            multipleNumber={multipleNumber}
            setMultipleNumber={setMultipleNumber}
            onSelect={(c) => {
              setIsMultiple(false);
              setName(c.name);
              setNumber(c.phoneNumber);
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
          />
        ) : (
          <WhatsappGroupMessageSidebar
            groups={groups}
            multipleGroup={multipleGroup}
            setMultipleGroup={setMultipleGroup}
            setIsGroupMode={setIsGroup}
          />
        )}
      </div>

      {/* 2. CENTER: Composer Area */}
      <div className="flex-1 h-full flex flex-col relative min-w-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-95">
        {/* Overlay for Form modals */}
        {(openBox || multipleContentAdd) && (
          <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
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
        <div className="h-[50px] bg-(--header)/90 backdrop-blur-md border-b border-(--border) flex items-center justify-center px-4 shrink-0 z-20">
          <div className="flex bg-(--bg-secondary) p-1 rounded-full gap-1">
            {[
              {
                id: "single",
                label: "Single",
                icon: <PersonIcon fontSize="inherit" />,
                onClick: () => {
                  setIsMultiple(false);
                  setIsGroup(false);
                },
              },
              {
                id: "multiple",
                label: "Multiple",
                icon: <PeopleIcon fontSize="inherit" />,
                onClick: () => {
                  setIsMultiple(true);
                  setIsGroup(false);
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
                  activeMode === tab.id
                    ? "bg-white text-(--primary) shadow-sm"
                    : "text-(--text-secondary) hover:bg-white/50"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Composer Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-(--bg-primary) rounded-2xl shadow-xl overflow-hidden border border-(--border)">
            <div className="p-4 bg-(--bg-secondary)/50 border-b border-(--border) flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                Send {activeMode.charAt(0).toUpperCase() + activeMode.slice(1)}{" "}
                Message
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
                <div className="p-3 bg-(--bg-secondary)/30 rounded-xl border border-dashed border-(--border) min-h-[100px] max-h-[150px] overflow-y-auto flex flex-wrap gap-2">
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
                        className="flex items-center gap-2 px-3 py-1 bg-(--primary)/10 text-(--primary) text-xs font-medium rounded-full border border-(--primary)/20"
                      >
                        {c.name || c.phoneNumber}
                        <button
                          onClick={() =>
                            setMultipleNumber((prev) =>
                              prev.filter((p) => p._id !== c._id),
                            )
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
                        key={g._id}
                        className="flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-700 text-xs font-medium rounded-full border border-teal-500/20"
                      >
                        {g.name}
                        <button
                          onClick={() =>
                            setMultipleGroup((prev) =>
                              prev.filter((p) => p._id !== g._id),
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
                  className="p-4 text-sm border-none rounded-2xl bg-(--bg-secondary) focus:ring-2 focus:ring-(--primary)/20 outline-none text-(--text-primary) min-h-[180px] resize-none leading-relaxed"
                />
              </div>

              {/* SEND BUTTON */}
              <button
                onClick={
                  activeMode === "single"
                    ? sendMessage
                    : activeMode === "multiple"
                      ? sendMultipleMessages
                      : sendMultipleGroupMessages
                }
                disabled={
                  messageSending ||
                  (activeMode === "multiple" && multipleNumber.length === 0) ||
                  (activeMode === "group" && multipleGroup.length === 0)
                }
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
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR (Default Messages) */}
      <div className="h-full shrink-0 flex flex-col bg-(--sidebar) border-l border-(--border)">
        <div className="p-4 h-[60px] flex items-center justify-between bg-(--header) border-b border-(--border)">
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
