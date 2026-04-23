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

function SendMessage({ sessionId }) {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messageSending, setMessageSEnding] = useState(false);

  const [openBox, setOpenBox] = useState(false);
  const [addContact, setAddContact] = useState(true);

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

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-(--border) bg-(--card)">
          <Button className="gap-2 flex" onClick={handleAddedContect}>
            <AddIcCallIcon />
            <p className="hidden xl:block">Add Contact</p>
          </Button>

          <h2 className="text-xl font-semibold ">Send Message</h2>

          <Button className="gap-2 flex" onClick={handleAddMessageTemplete}>
            <AddBoxIcon />
            <p className="hidden xl:block">Add Template</p>
          </Button>
        </div>

        <div className="p-6 flex flex-col gap-4">
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
