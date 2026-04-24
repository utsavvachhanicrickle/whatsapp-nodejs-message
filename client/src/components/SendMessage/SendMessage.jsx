import { useState, useEffect } from "react";
import { messageServices } from "../../services/message.services";
import {
  contectFormData,
  messageTempleteFormData,
} from "../../utils/constants/sendMessageFields";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchContactSlice,
  addContactSlice,
  updateContactSlice,
  deleteContactSlice,
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
    if (!file) return;

    try {
      const res = await dispatch(bulkUploadPDFSlice(file)).unwrap();

      alert(`Created: ${res.created}, Failed: ${res.failed}`);

      setFile(null);
      handleCancle();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
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
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-(--text-inverse) p-6 rounded-xl w-[90%] max-w-lg shadow-xl">
                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                      Upload Employees (PDF)
                    </h2>
                  </div>

                  {/* DROP AREA */}
                  <div
                    className="border-2 border-dashed border-(--border) rounded-lg p-6 text-center cursor-pointer hover:bg-(--bg-secondary) transition"
                    onClick={() => document.getElementById("pdfInput").click()}
                  >
                    <p className="text-(--text-secondary)">
                      {file ? "File selected" : "Click or Drag & Drop PDF here"}
                    </p>

                    <input
                      id="pdfInput"
                      type="file"
                      accept="application/pdf"
                      multiple={false}
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                  </div>

                  {file && (
                    <div className="mt-3 p-3 border rounded bg-(--bg-secondary)">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-(--text-secondary)">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={handleCancle}>
                      Cancel
                    </Button>

                    <Button
                      onClick={handleUpload}
                      disabled={!file || loading}
                      className="px-4 py-2 rounded bg-(--btn-primary-bg) text-white disabled:opacity-50"
                    >
                      {loading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
              </div>
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
