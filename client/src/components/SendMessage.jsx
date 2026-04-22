import { useEffect, useState } from "react";
import { messageServices } from "../services/message.services";
import InputField from "./InputField";

function SendMessage({ sessionId }) {
  const [number, setNumber] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(JSON.parse(localStorage.getItem("messageData")) || []);
  }, []);

  const sendMessage = async () => {
    if (!number || !message) {
      alert("Fill all fields");
      return;
    }

    setData(data.find((item) => item.value === number) ? data : [...data, { label: contactPerson, value: number, message }]);
    JSON.stringify(
      localStorage.setItem(
        "messageData",
        JSON.stringify([...data, { label: contactPerson, value: number, message }]),
      ),
    );


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
    console.log(value);
    
    const selected = data.find((item) => item.value === value);
    if (selected) {
      setContactPerson(selected.label);
      setNumber(selected.value);
      setMessage("");
    }
  };

  return (
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
  );
}

export default SendMessage;
