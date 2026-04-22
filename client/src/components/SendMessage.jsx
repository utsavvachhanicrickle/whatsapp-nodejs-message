import { useEffect, useState } from "react";
import { messageServices } from "../services/message.services";
import InputField from "./InputField";
import Button from "./Button";

function SendMessage({ sessionId }) {
  const [number, setNumber] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(
    JSON.parse(localStorage.getItem("messageData")) || [],
  );
  const [defaultMessage, setDefaultMessage] = useState("");
  const [defaultMessagesOptions, setDefaultMessagesOptions] = useState(
    JSON.parse(localStorage.getItem("defaultMessages")) || [],
  );

  const sendMessage = async () => {
    if (!number || !message) {
      alert("Fill all fields");
      return;
    }

    console.log(
      data.find((item) => item.value === number),
      number,
    );

    const exists = data.some((item) => item.value === number);

    let updatedData = exists
      ? data
      : [...data, { label: contactPerson + " (" + number + ")", value: number }];

    setData(updatedData);
    localStorage.setItem("messageData", JSON.stringify(updatedData));

    try {
      setLoading(true);
      await messageServices.SendMessageServices(sessionId, number, message);
      setNumber("");
      setMessage("");
      setContactPerson("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const setSelectOption = (value) => {
    const selected = data.find((item) => item.value === value);
    if (selected) {
      setContactPerson(selected.label.split(" (")[0]);
      setNumber(selected.value);
      setMessage("");
    }
  };
  const handlesDefaultMessageClicks = () => {
    if (!defaultMessage) {
      alert("Please enter a default message.");
      return;
    }

    const exists = defaultMessagesOptions.some(
      (item) => item.value === defaultMessage,
    );

    let updated = exists
      ? defaultMessagesOptions
      : [
          ...defaultMessagesOptions,
          { label: defaultMessage, value: defaultMessage },
        ];

    setDefaultMessagesOptions(updated);
    localStorage.setItem("defaultMessages", JSON.stringify(updated));

    setDefaultMessage("");
  };

  const handlesDefaultMessage = (value) => {
    const selected = defaultMessagesOptions.find(
      (item) => item.value === value,
    );
    setMessage(selected ? selected.value : "");
    setDefaultMessage(value);
  };

  return (
    <>
      <div className="bg-(--card) p-6 rounded-2xl shadow-md border border-(--border) max-w-xl w-full mx-auto">
        <h3 className="text-xl font-semibold mb-4 text-(--text-primary)">
          Send Message
        </h3>

        <InputField
          type="select"
          placeholder="Select Contact Person"
          name="selects"
          value={contactPerson}
          options={data}
          onChange={(name, value) => setSelectOption(value)}
        />

        <InputField
          placeholder="Enter Contact Person Name"
          value={contactPerson}
          onChange={(name, value) => setContactPerson(value)}
        />

        {/* Phone Input */}
        <InputField
          placeholder="Enter phone number (without +91)"
          value={number}
          onChange={(name, value) => setNumber(value)}
        />

        {/* Message Input */}
        <InputField
          type="textarea"
          placeholder="Enter your message..."
          value={message}
          onChange={(name, value) => setMessage(value)}
          rows={4}
        />

        {/* Button */}
        <button
          onClick={sendMessage}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            loading
              ? "bg-(--border) text-(--text-secondary) cursor-not-allowed"
              : "bg-(--btn-primary-bg) text-(--btn-primary-text) hover:bg-(--btn-primary-hover)"
          }`}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </div>

      <div className="bg-(--card) p-6 rounded-2xl shadow-md border border-(--border) max-w-xl w-full mx-auto">
        <h3 className="text-xl font-semibold mb-4 text-(--text-primary)">
          Set Default Message
        </h3>
        <InputField
          type="select"
          placeholder="Select Default Message Options"
          name="selects"
          value={defaultMessage}
          options={defaultMessagesOptions}
          onChange={(name, value) => handlesDefaultMessage(value)}
        />

        <InputField
          placeholder="Enter your default message..."
          value={defaultMessage}
          onChange={(name, value) => setDefaultMessage(value)}
        />

        <Button
          type="button"
          onClick={handlesDefaultMessageClicks}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            loading
              ? "bg-(--border) text-(--text-secondary) cursor-not-allowed"
              : "bg-(--btn-primary-bg) text-(--btn-primary-text) hover:bg-(--btn-primary-hover)"
          }`}
        >
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </>
  );
}

export default SendMessage;
