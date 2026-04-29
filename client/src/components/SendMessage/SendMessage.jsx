import { useState, useEffect } from "react";
import { messageServices } from "../../services/message.services";
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
import Button from "../Button";
import AddEntityForm from "./AddEntityForm";

import AddIcCallIcon from "@mui/icons-material/AddIcCall";
import AddBoxIcon from "@mui/icons-material/AddBox";
import SendIcon from "@mui/icons-material/Send";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";

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

  const footerMessage = `

------------------------------

*Automated Message*

This message was sent automatically.  
Please do not reply to this message.

Thank you for your cooperation.`;

  const sendMessage = async () => {
    if (!number || !message) return toast.error("Fill all fields");
    setMessageSEnding(true);
    await messageServices.SendMessageServices(
      sessionId,
      number,
      `${message} ${footerMessage}`,
    );

    setMessageSEnding(false);
    setMessage("");
    setNumber("");
    setName("");
  };

  const sendMultipleMessages = async () => {
    if (multipleNumber.length === 0 || !message)
      return toast.error("fill all fields");
    setMessageSEnding(true);
    await messageServices.SendMultipleMessagesServices(
      sessionId,
      multipleNumber,
      `${message} ${footerMessage}`,
    );
    setMessage(null);
    setMessage("");
    setMultipleNumber([]);
    setMessageSEnding(false);
  };

  const sendMultipleGroupMessages = async () => {
    if (multipleGroup.length === 0 || !message) {
      return toast.error("fill all fields");
    }
    setMessageSEnding(true);
    await messageServices.SendMultipleGroupMessagesServices(
      sessionId,
      multipleGroup,
      `${message} ${footerMessage}`,
    );
    setMessage(null);
    setMultipleGroup([]);
    setMessage("");
    setMessageSEnding(false);
  };

  useEffect(() => {
    dispatch(fetchContactSlice());
    dispatch(fetchDefaultMessage());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchGroups(sessionId));
  }, [dispatch, sessionId]);

  const handleAddedContect = () => {
    setOpenBox(true);
    setAddContact(true);
    setEditContactId(null);
    setContactDetails({});
  };

  const handleMulipleAddContect = () => {
    setMutltipleContentAdd(true);
  };

  const handleAddMessageTemplete = () => {
    setOpenBox(true);
    setAddContact(false);
    setEditTemplateId(null);
    setTemplateDetails({});
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

  const handleDeleteContect = (id) => {
    dispatch(deleteContactSlice(id));
  };

  const onBulkDelete = (multipleContents) => {
    dispatch(bulkDeleteContactsSlice(multipleContents));
    setMultipleNumber([]);
  };

  const handleMessageTempleteSubmit = (formData) => {
    console.log(formData);

    if (editTemplateId !== null) {
      dispatch(updateDefaultMessage({ id: editTemplateId, formData }));
    } else {
      dispatch(addDefaultMessage(formData));
    }
    handleCancle();
  };

  const handleDeleteDefaultMessage = (id) => {
    dispatch(deleteDefaultMessage(id));
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (file) {
      toast.error("Only one PDF allowed. Remove current file first.");
      return;
    }
    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF allowed");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!parsedContacts.length) {
      return toast.error("No valid contacts found");
    }

    try {
      setLoading(true);

      const res = await dispatch(
        bulkUploadContactsSlice(parsedContacts),
      ).unwrap();

      toast.success(`Created: ${res.created}, Failed: ${res.failed}`);

      setParsedContacts([]);
      setFile(null);
      handleCancle();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {!isGroup ? (
        <ContactSidebar
          contacts={contacts}
          multipleNumber={multipleNumber}
          setMultipleNumber={setMultipleNumber}
          onSelect={(c) => {
            setName(c.name);
            setNumber(c.phoneNumber);
          }}
          onEdit={(index, item) => {
            setOpenBox(true);
            setAddContact(true);
            setEditContactId(item._id);
            setContactDetails(item);
          }}
          onDelete={handleDeleteContect}
          onBulkDelete={onBulkDelete}
        />
      ) : (
        <WhatsappGroupMessageSidebar
          groups={groups}
          multipleGroup={multipleGroup}
          setMultipleGroup={setMultipleGroup}
        />
      )}

      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-3xl flex flex-col">
          <div className="flex flex-col gap-4 p-4 border-b border-(--border) bg-(--card)">
            <div className="items-center text-center ">
              <h2 className="text-xl font-semibold">Send Message</h2>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                onClick={handleAddedContect}
              >
                <AddIcCallIcon />
                <span className="hidden xl:inline">Add Contact</span>
              </Button>

              <Button
                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                onClick={handleMulipleAddContect}
              >
                <LibraryAddIcon />
                <span className="hidden xl:inline">Add Multiple</span>
              </Button>

              <Button
                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                onClick={handleAddMessageTemplete}
              >
                <AddBoxIcon />
                <span className="hidden xl:inline">Add Template</span>
              </Button>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-4">
            {multipleContentAdd && (
              <FileUploadModal
                isOpen={multipleContentAdd}
                file={file}
                setFile={setFile}
                loading={loading}
                onUpload={handleUpload}
                onCancel={handleCancle}
                title="Upload Employees (PDF)"
                setParsedContacts={setParsedContacts}
              />
            )}
            {openBox ? (
              addContact ? (
                <AddEntityForm
                  handleSubmit={handleContectSubmit}
                  editEntityId={editContactId}
                  handleCancle={handleCancle}
                  entity={contactDetails}
                  formDataFields={contectFormData.field(
                    editContactId,
                    contactDetails,
                  )}
                  formDataButtons={contectFormData.buttons}
                />
              ) : (
                <AddEntityForm
                  handleSubmit={handleMessageTempleteSubmit}
                  editEntityId={editTemplateId}
                  handleCancle={handleCancle}
                  entity={templateDetails}
                  formDataFields={messageTempleteFormData.field(
                    editTemplateId,
                    templateDetails,
                  )}
                  formDataButtons={messageTempleteFormData.buttons}
                />
              )
            ) : (
              <>
                <div className="p-6 flex flex-col gap-6">
                  {/* TOGGLE MODE */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsMultiple(false);
                        setIsGroup(false);
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        !isMultiple && !isGroup
                          ? "bg-(--btn-primary-bg) text-white"
                          : "bg-(--bg-secondary)"
                      }`}
                    >
                      Single
                    </button>

                    <button
                      onClick={() => {
                        setIsMultiple(true);
                        setIsGroup(false);
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        isMultiple
                          ? "bg-(--btn-primary-bg) text-white"
                          : "bg-(--bg-secondary)"
                      }`}
                    >
                      Multiple
                    </button>

                    <button
                      onClick={() => {
                        setIsMultiple(false);
                        setIsGroup(true);
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        isGroup
                          ? "bg-(--btn-primary-bg) text-white"
                          : "bg-(--bg-secondary)"
                      }`}
                    >
                      Group
                    </button>
                  </div>

                  {/* ================= SINGLE ================= */}
                  {!isMultiple && !isGroup && (
                    <div className="bg-(--card) p-5 rounded-xl border border-(--border) flex flex-col gap-4 shadow-sm">
                      <h2 className="text-lg font-semibold">
                        Send to Single Contact
                      </h2>

                      <input
                        placeholder="Contact Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-3 border rounded bg-(--bg-primary)"
                      />

                      <input
                        placeholder="Phone Number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className="p-3 border rounded bg-(--bg-primary)"
                      />

                      <textarea
                        placeholder="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="p-3 border rounded bg-(--bg-primary) min-h-30"
                      />

                      <button
                        onClick={sendMessage}
                        className="py-3 bg-(--btn-primary-bg) text-white rounded-lg flex items-center justify-center gap-3"
                      >
                        {!messageSending ? (
                          <>
                            <SendIcon />
                            Send Message
                          </>
                        ) : (
                          <div className="h-6 w-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </button>
                    </div>
                  )}

                  {/* ================= MULTIPLE ================= */}
                  {isMultiple && (
                    <div className="bg-(--card) p-5 rounded-xl border border-(--border) flex flex-col gap-4 shadow-sm">
                      <h2 className="text-lg font-semibold">
                        Send to Multiple Contacts
                      </h2>

                      {/* SELECTED CONTACTS */}
                      <div className="border rounded-lg p-3 bg-(--bg-secondary)">
                        {multipleNumber.length === 0 ? (
                          <p className="text-sm text-(--text-secondary)">
                            No contacts selected
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2 min-h-45 max-h-45 overflow-auto">
                            {multipleNumber.map((c) => (
                              <div
                                key={c._id}
                                className="px-3 py-1 min-h-8 max-h-12 rounded-full bg-(--btn-primary-bg) text-white text-sm flex items-center gap-2"
                              >
                                {c.name}
                                <span
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setMultipleNumber((prev) =>
                                      prev.filter((p) => p._id !== c._id),
                                    )
                                  }
                                >
                                  ✕
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* MESSAGE */}
                      <textarea
                        placeholder="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="p-3 border rounded bg-(--bg-primary) min-h-30"
                      />

                      <button
                        onClick={sendMultipleMessages}
                        disabled={multipleNumber.length === 0}
                        className="py-3 bg-(--btn-primary-bg) text-white rounded-lg flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {!messageSending ? (
                          <>
                            <SendIcon />
                            Send to {multipleNumber.length} Contacts
                          </>
                        ) : (
                          <div className="h-6 w-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </button>
                    </div>
                  )}

                  {isGroup && (
                    <div className="bg-(--card) p-5 rounded-xl border border-(--border) flex flex-col gap-4 shadow-sm">
                      <h2 className="text-lg font-semibold">
                        Send to Multiple Groups
                      </h2>

                      <div className="border rounded-lg p-3 bg-(--bg-secondary)">
                        {multipleGroup.length === 0 ? (
                          <p className="text-sm text-(--text-secondary)">
                            No Groups selected
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2 min-h-45 max-h-45 overflow-auto">
                            {multipleGroup.map((c) => (
                              <div
                                key={c._id}
                                className="px-3 py-1 min-h-8 max-h-12 rounded-full bg-(--btn-primary-bg) text-white text-sm flex items-center gap-2"
                              >
                                {c.name}
                                <span
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setMultipleGroup((prev) =>
                                      prev.filter((p) => p._id !== c._id),
                                    )
                                  }
                                >
                                  ✕
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <textarea
                        placeholder="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="p-3 border rounded bg-(--bg-primary) min-h-30"
                      />

                      <button
                        onClick={sendMultipleGroupMessages}
                        disabled={multipleGroup.length === 0}
                        className="py-3 bg-(--btn-primary-bg) text-white rounded-lg flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {!messageSending ? (
                          <>
                            <SendIcon />
                            Send to {multipleGroup.length} Group
                          </>
                        ) : (
                          <div className="h-6 w-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <DefaultMessageSidebar
        defaulMessages={defaulMessages}
        onSelect={(msg) => setMessage(msg)}
        onEdit={(index, item) => {
          setOpenBox(true);
          setAddContact(false);
          setEditTemplateId(item._id);
          setTemplateDetails({
            title: item.label,
            message: item.value,
          });
        }}
        onDelete={handleDeleteDefaultMessage}
      />
    </div>
  );
}

export default SendMessage;
