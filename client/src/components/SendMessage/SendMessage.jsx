import { useState, useEffect } from "react";
import { messageServices } from "../../services/message.services";
import {
  contectFormData,
  messageTempleteFormData,
} from "../../utils/constants/sendMessageFields";

import ContactSidebar from "./ContactSidebar";
import DefaultMessageSidebar from "./DefaultMessageSidebar";
import Button from "../Button";
import AddEntityForm from "./AddEntityForm";

import AddIcCallIcon from "@mui/icons-material/AddIcCall";
import AddBoxIcon from "@mui/icons-material/AddBox";

function SendMessage({ sessionId }) {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const [openBox, setOpenBox] = useState(false);
  const [addContact, setAddContact] = useState(true);

  const [editContactId, setEditContactId] = useState(null);
  const [editTemplateId, setEditTemplateId] = useState(null);

  const [contactDetails, setContactDetails] = useState({});
  const [templateDetails, setTemplateDetails] = useState({});

  const [refresh, setRefresh] = useState(0);

  const sendMessage = async () => {
    if (!number || !message) return alert("Fill all fields");

    await messageServices.SendMessageServices(
      sessionId,
      number,
      `${message} \n\n this message is sends from Utsav and this will be Part of the autmation of messages sending`,
    );

    setMessage("");
    setNumber("");
    setName("");
  };

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
    let data = JSON.parse(localStorage.getItem("contacts")) || [];

    if (editContactId !== null) {
      data[editContactId] = formData;
    } else {
      data.push(formData);
    }

    localStorage.setItem("contacts", JSON.stringify(data));
    handleCancle();
  };

  const handleMessageTempleteSubmit = (formData) => {
    let data = JSON.parse(localStorage.getItem("defaultMessages")) || [];

    if (editTemplateId !== null) {
      data[editTemplateId] = {
        label: formData.title,
        value: formData.message,
      };
    } else {
      data.push({
        label: formData.title,
        value: formData.message,
      });
    }

    localStorage.setItem("defaultMessages", JSON.stringify(data));
    handleCancle();
  };

  const handleDeleteContect = (index) => {
    let data = JSON.parse(localStorage.getItem("contacts")) || [];

    data.splice(index, 1);

    localStorage.setItem("contacts", JSON.stringify(data));

    setRefresh((prev) => prev + 1); // 🔥 trigger reload
  };

  const handleDeleteDefaultMessage = (index) => {
    let data = JSON.parse(localStorage.getItem("defaultMessages")) || [];

    data.splice(index, 1);

    localStorage.setItem("defaultMessages", JSON.stringify(data));

    setRefresh((prev) => prev + 1); // 🔥 trigger reload
  };

  return (
    <div className="flex h-full">
      <ContactSidebar
        refresh={refresh}
        onSelect={(c) => {
          setName(c.name);
          setNumber(c.phoneNumber);
        }}
        onEdit={(index, item) => {
          setOpenBox(true);
          setAddContact(true);
          setEditContactId(index);
          setContactDetails(item);
        }}
        onDelete={handleDeleteContect}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-(--border) bg-(--card)">
          <Button className="gap-2 flex" onClick={handleAddedContect}>
            <AddIcCallIcon />
            Add Contact
          </Button>

          <h2 className="text-xl font-semibold">Send Message</h2>

          <Button className="gap-2 flex" onClick={handleAddMessageTemplete}>
            <AddBoxIcon />
            Add Template
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
                className="py-3 bg-(--btn-primary-bg) text-white rounded"
              >
                Send Message
              </button>
            </>
          )}
        </div>
      </div>

      <DefaultMessageSidebar
        refresh={refresh}
        onSelect={(msg) => setMessage(msg)}
        onEdit={(index, item) => {
          setOpenBox(true);
          setAddContact(false);
          setEditTemplateId(index);
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
