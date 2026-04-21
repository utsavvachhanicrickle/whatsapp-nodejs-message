import { useContext, useEffect, useState } from "react";
import { socket } from "../socket";
import QR from "../components/QR";
import SendMessage from "../components/SendMessage";
import { userServices } from "../services/user.services";
import { UserContext } from "../context/userContext";
import { DarkModeContext } from "../context/darkModeContext";

function HomePage() {
  const { darkMode, setDarkMode } = useContext(DarkModeContext);
  const { users, setUsers } = useContext(UserContext);

  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState("Idle");
  const [inputPhone, setInputPhone] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // SOCKET EVENTS
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
  }, [activeUser, setUsers]);

  // ADD USER
  const startSession = async () => {
    if (!inputPhone) return alert("Enter phone");

    setLoading(true);

    const newUser = await userServices.addUser(
      inputPhone,
      inputPhone,
      socket.id,
    );

    if (newUser) {
      setUsers((prev) => [...prev, newUser]);
      setActiveUser(newUser);
    }

    setInputPhone("");
    setLoading(false);
  };

  const handleSwitchUser = (user) => {
    setActiveUser(user);

    // reset UI for new session
    setQr(null);
    setStatus(`Switched to ${user}`);
    setLoading(false);
  };
  
  // REMOVE USER
  const removeSession = async (phone) => {
    await userServices.removeUser(phone, socket.id);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-64 bg-(--sidebar) text-(--sidebar-text) p-4 flex flex-col">
        <h2 className="text-xl mb-4 font-semibold">Users</h2>

        <input
          className="p-2 rounded text-white bg-(--input) border border-(--border) focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter phone"
          value={inputPhone}
          onChange={(e) => setInputPhone(e.target.value)}
        />

        <button
          onClick={startSession}
          className="bg-green-500 hover:bg-green-600 mt-2 p-2 rounded"
        >
          Add User
        </button>

        <div className="mt-4 flex-1 overflow-auto">
          {users.map((user) => (
            <div
              key={user}
              className={`p-2 mt-2 rounded flex justify-between cursor-pointer ${
                activeUser === user
                  ? "bg-green-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              <span onClick={() => handleSwitchUser(user)}>{user}</span>

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
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="bg-(--card) border-b border-(--border) p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">WhatsApp Dashboard</h1>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-auto">
          <h3 className="text-lg mb-4">Status: {status}</h3>

          {loading && (
            <div className="flex justify-center mt-10">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
            </div>
          )}

          {qr && (
            <div className="flex justify-center mt-6">
              <QR qr={qr} />
            </div>
          )}

          {status.includes("Connected") && activeUser && (
            <div className="mt-6 flex justify-center">
              <SendMessage sessionId={activeUser} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
