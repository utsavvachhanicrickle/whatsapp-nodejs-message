import { useState } from "react";
import { messageServices } from "../services/message.services";

function SendMessage({ sessionId }) {
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!number || !message) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);
      await messageServices.SendMessageServices(
        sessionId,
        number,
        message
      );
      setNumber("");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-(--card) p-6 rounded-2xl shadow-md border border-(--border) max-w-xl w-full mx-auto">
      
      <h3 className="text-xl font-semibold mb-4 text-(--text-primary)">
        Send Message
      </h3>

      {/* Phone Input */}
      <input
        className="w-full p-3 mb-3 rounded-lg border border-(--border) bg-(--bg-primary) text-(--text-primary) 
        focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition"
        placeholder="Enter phone number (without +91)"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />

      {/* Message Input */}
      <textarea
        className="w-full p-3 mb-4 rounded-lg border border-(--border) bg-(--bg-primary) text-(--text-primary) 
        focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition resize-none"
        placeholder="Enter your message..."
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
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