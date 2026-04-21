import { useEffect, useState } from "react";
import { socket } from "../socket";
import QR from "../components/QR";
import SendMessage from "../components/SendMessage";
import { userServices } from "../services/user.services";
import { useUserContext } from "../context/userContext";
import { useDarkModeContext } from "../context/darkModeContext";

function HomePage() {

  const { darkMode, setDarkMode } = useDarkModeContext();
  const { users, setUsers } = useUserContext();

  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState("Idle");
  const [inputPhone, setInputPhone] = useState("");}
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket:", socket.id);
    });

    socket.on("qr", ({ sessionId, qr }) => {
      setQr(qr);
      setStatus(`Scan QR for ${sessionId}`);
      setLoading(false);
    });

    socket.on("authenticated", ({ sessionId }) => {
      setStatus(`Authenticated: ${sessionId}`);
    });

    socket.on("ready", ({ sessionId }) => {
      setQr(null);
      setStatus(`Connected: ${sessionId} ✅`);
      setLoading(false);
    });

    socket.on("disconnected", ({ sessionId }) => {
      setStatus(`Disconnected: ${sessionId} ❌`);
    });

    socket.on("session-removed", ({ sessionId }) => {
      setUsers((prev) => prev.filter((u) => u !== sessionId));

      if (activeUser === sessionId) {
        setActiveUser(null);
        setQr(null);
        setStatus("Idle");
      }
    });

    return () => {
      socket.off("qr");
      socket.off("ready");
      socket.off("authenticated");
      socket.off("disconnected");
      socket.off("session-removed");
    };
  }, [activeUser]);

  const startSession = async () => {
    if (!inputPhone) return alert("Enter phone");

    setLoading(true);

    const newUser = await userServices.addUser(
      inputPhone,
      inputPhone,
      socket.id,
    );

    setUsers((prev) => [...prev, newUser]);
    setActiveUser(newUser);
    setInputPhone("");
    setLoading(false);
  };

  const removeSession = async (phone) => {
    try {
      const result = await userServices.removeUser(phone, socket.id);
      if (result.status === "success") {
        setUsers((prev) => prev.filter((u) => u !== phone));
        if (activeUser === phone) {
          setActiveUser(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen">
      
      <div className="navbar"> 
        <h1 className="text-2xl mb-4">WhatsApp Dashboard</h1>
        <button onClick={() => setDarkMode((prev) => !prev)} className="bg-gray-700 text-white p-2 rounded">
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

      </div>
      <div>
        
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <h2 className="text-xl mb-4">Users</h2>

        <input
          className="p-2 text-black rounded"
          placeholder="Enter phone"
          value={inputPhone}
          onChange={(e) => setInputPhone(e.target.value)}
        />

        <button
          onClick={startSession}
          className="bg-green-500 mt-2 p-2 rounded"
        >
          Add User
        </button>

        <div className="mt-4 flex-1 overflow-auto">
          {users.map((user) => (
            <div
              key={user}
              className={`p-2 mt-2 rounded flex justify-between ${
                activeUser === user ? "bg-green-600" : "bg-gray-700"
              }`}
            >
              <span onClick={() => setActiveUser(user)}>{user}</span>

              <button
                onClick={() => removeSession(user)}
                className="text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        <h3>Status: {status}</h3>

        {loading && <p>Loading...</p>}

        {qr && (
          <div className="mt-4">
            <QR qr={qr} />
          </div>
        )}

        {status.includes("Connected") && activeUser && (
          <SendMessage sessionId={activeUser} />
        )}
      </div>
      </div>

    </div>
  );
}

export default HomePage;


import { useState } from "react";
import { messageServices } from "../services/message.services";

function SendMessage({ sessionId }) {
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    await messageServices.SendMessageServices(sessionId, number, message);
    setNumber("");
    setMessage("");
  };

  return (
    <div>
      <h3>Send Message</h3>

      <input
        placeholder="Enter number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />

      <input
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default SendMessage; function QR({ qr }) {
  if (!qr) return null;

  return (
    <div>
      <h3>Scan QR</h3>
      <img src={qr} alt="QR Code" width={300} />
    </div>
  );
}

export default QR;  
    creats here only css acoordings to this  @import "tailwindcss";

:root {
  --bg: #f4f6f8;
  --card: #ffffff;
  --text: #111827;
  --muted: #6b7280;
  --primary: #22c55e;
  --sidebar: #111827;
  --sidebar-text: #ffffff;
  --border: #e5e7eb;
}


[data-theme="dark"] {
  --bg: #0f172a;
  --card: #1e293b;
  --text: #f8fafc;
  --muted: #94a3b8;
  --primary: #22c55e;
  --sidebar: #020617;
  --sidebar-text: #f8fafc;
  --border: #334155;
}

body {
  background-color: var(--bg);
  color: var(--text);
  transition: all 0.3s ease;
}   