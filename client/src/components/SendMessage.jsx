import { useState } from "react";
import axios from "axios";

function SendMessage({ sessionId }) {
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    try {
      await axios.post("http://localhost:3000/send", {
        sessionId,
        number,
        message,
      });

      alert("Message Sent ✅");
    } catch (err) {
      console.log(err);
      alert("Error sending message ❌");
    }
  };

  return (
    <div>
      <h3>Send Message</h3>

      <input
        placeholder="Phone number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />

      <input
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default SendMessage;