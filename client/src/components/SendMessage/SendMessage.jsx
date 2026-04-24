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
} from "../../store/slices/contactSlices";
import {
  fetchDefaultMessage,
  addDefaultMessage,
  updateDefaultMessage,
  deleteDefaultMessage,
} from "../../store/slices/defaultMessagesSlices";

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
  const [message, setMessage] = useState("");
  const [messageSending, setMessageSEnding] = useState(false);

  const [openBox, setOpenBox] = useState(false);
  const [addContact, setAddContact] = useState(true);

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

  const sendMessage = async () => {
    if (!number || !message) return alert("Fill all fields");
    setMessageSEnding(true);
    await messageServices.SendMessageServices(
      sessionId,
      number,
      `${message} \n\n ------------------------------ \n\n  *this* message is sends from *Utsav Vachhani* and this will be Part of the autmation of messages sending`,
    );

    setMessageSEnding(false);
    setMessage("");
    setNumber("");
    setName("");
  };

  useEffect(() => {
    dispatch(fetchContactSlice());
    dispatch(fetchDefaultMessage());
  }, [dispatch]);

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
    console.log(id);
    
    dispatch(deleteContactSlice(id));
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
      alert("Only one PDF allowed. Remove current file first.");
      return;
    }
    if (selectedFile.type !== "application/pdf") {
      alert("Only PDF allowed");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!parsedContacts.length) {
      return alert("No valid contacts found");
    }

    try {
      setLoading(true);

      const res = await dispatch(
        bulkUploadContactsSlice(parsedContacts),
      ).unwrap();

      alert(`Created: ${res.created}, Failed: ${res.failed}`);

      setParsedContacts([]);
      setFile(null);
      handleCancle();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <ContactSidebar
        contacts={contacts}
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
      />

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
                accept="application/pdf"
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
                <input
                  placeholder="Contact Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-3 border border-(--border) rounded bg-(--bg-primary)"
                />

                <input
                  placeholder="Phone Number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="p-3 border border-(--border) rounded bg-(--bg-primary)"
                />

                <textarea
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="p-3 border border-(--border) rounded bg-(--bg-primary)"
                />

                <button
                  onClick={sendMessage}
                  className="py-3 bg-(--btn-primary-bg) text-white rounded flex gap-4 justify-center"
                >
                  {!messageSending ? (
                    <>
                      <SendIcon />
                      <p>Send Message</p>
                    </>
                  ) : (
                    <div className="h-8 w-8 border-4 border-(--border) border-t-(--primary) rounded-full animate-spin"></div>
                  )}
                </button>
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
