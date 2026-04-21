import { useEffect, useState } from "react";
import { socket } from "./socket";
import QR from "./components/QR";
import SendMessage from "./components/SendMessage";
import axios from "axios";

function App() {
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState("Not Connected");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    socket.on("qr", (data) => {
      setQr(data.qr);
      setStatus("Scan QR");
    });

    socket.on("ready", () => {
      setQr(null);
      setStatus("Connected ✅");
    });

    socket.on("disconnected", () => {
      setStatus("Disconnected ❌");
    });

    return () => {
      socket.off("qr");
      socket.off("ready");
      socket.off("disconnected");
    };
  }, []);

  const startSession = async () => {
    if (!sessionId) return alert("Enter sessionId");

    await axios.post("http://localhost:3000/start", {
      sessionId,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>WhatsApp Web Client</h2>

      <input
        placeholder="Enter Session ID"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
      />

      <button onClick={startSession}>Start Session</button>

      <h3>Status: {status}</h3>

      <QR qr={qr} />

      {status === "Connected ✅" && (
        <SendMessage sessionId={sessionId} />
      )}
    </div>
  );
}

export default App;