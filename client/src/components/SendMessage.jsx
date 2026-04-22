import { useState } from "react";
import { messageServices } from "../services/message.services";
import InputField from "./Forms/InputField";
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

    const exists = data.some((item) => item.value === number);

    const updatedData = exists
      ? data
      : [...data, { label: `${contactPerson} (${number})`, value: number }];

    setData(updatedData);
    localStorage.setItem("messageData", JSON.stringify(updatedData));

    try {
      setLoading(true);
      await messageServices.SendMessageServices(
        sessionId,
        number,
        `\n- Sent via WhatsApp Web Automation Tool - session: ${sessionId} \n\n - ${message} \n -- ${new Date().toLocaleString()}`,
      );

      setNumber("");
      setMessage("");
      setContactPerson("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-(--card) p-6 rounded-2xl shadow-md border border-(--border)">
          <h3 className="text-xl font-semibold mb-4 text-(--text-primary)">
            Send Message
          </h3>

          <div className="max-h-40 overflow-y-auto border border-(--border) rounded-lg mb-3">
            <InputField
              type="select"
              placeholder="Select Contact Person"
              name="selects"
              value={contactPerson}
              options={data}
              onChange={(n, v) => {
                const selected = data.find((item) => item.value === v);
                if (selected) {
                  setContactPerson(selected.label.split(" (")[0]);
                  setNumber(selected.value);
                }
              }}
            />
          </div>

          <InputField
            placeholder="Enter Contact Name"
            value={contactPerson}
            onChange={(n, v) => setContactPerson(v)}
          />

          <InputField
            placeholder="Enter phone number"
            value={number}
            onChange={(n, v) => setNumber(v)}
          />

          <InputField
            type="textarea"
            placeholder="Enter message..."
            value={message}
            onChange={(n, v) => setMessage(v)}
            rows={4}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition mt-2 ${
              loading
                ? "bg-(--border) text-(--text-secondary) cursor-not-allowed"
                : "bg-(--btn-primary-bg) text-(--btn-primary-text) hover:bg-(--btn-primary-hover)"
            }`}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>

        <div className="bg-(--card) p-6 rounded-2xl shadow-md border border-(--border)">
          <h3 className="text-xl font-semibold mb-4 text-(--text-primary)">
            Default Messages
          </h3>

          <div className="max-h-40 overflow-y-auto border border-(--border) rounded-lg mb-3">
            <InputField
              type="select"
              placeholder="Select Default Message"
              name="selects"
              value={defaultMessage}
              options={defaultMessagesOptions}
              onChange={(n, v) => {
                const selected = defaultMessagesOptions.find(
                  (item) => item.value === v,
                );
                setMessage(selected ? selected.value : "");
                setDefaultMessage(v);
              }}
            />
          </div>

          <InputField
            placeholder="Add new default message"
            value={defaultMessage}
            onChange={(n, v) => setDefaultMessage(v)}
          />

          <Button
            type="button"
            disabled={loading}
            onClick={() => {
              if (!defaultMessage) return;

              const exists = defaultMessagesOptions.some(
                (item) => item.value === defaultMessage,
              );

              const updated = exists
                ? defaultMessagesOptions
                : [
                    ...defaultMessagesOptions,
                    { label: defaultMessage, value: defaultMessage },
                  ];

              setDefaultMessagesOptions(updated);
              localStorage.setItem("defaultMessages", JSON.stringify(updated));

              setDefaultMessage("");
            }}
            className="w-full mt-2"
          >
            Save Default
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SendMessage;
