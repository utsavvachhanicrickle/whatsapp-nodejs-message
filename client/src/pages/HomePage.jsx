import { useContext, useEffect, useState } from "react";
import { socket } from "../socket";
import QR from "../components/QR";
import SendMessage from "../components/SendMessage";
import { userServices } from "../services/user.services";
import { UserContext } from "../context/userContext";
import { DarkModeContext } from "../context/darkModeContext";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PersonIcon from "@mui/icons-material/Person";
import InputField from "../components/InputField";
import Button from "../components/Button";

function HomePage() {
  const { darkMode, setDarkMode } = useContext(DarkModeContext);
  const { users, setUsers } = useContext(UserContext);

  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState("Idle");
  const [inputPhone, setInputPhone] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= SOCKET EVENTS =================
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

  // ================= ADD USER =================
  const startSession = async () => {
    if (!inputPhone) {
      alert("Enter phone");
      return;
    }

    setLoading(true);

    const newUser = await userServices.addUser(
      inputPhone,
      inputPhone,
      socket.id
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
    setQr(null);
    setStatus(`Connected: ${user} ✅`);
    setLoading(false);
  };

  useEffect(() => {
    if (users && users.length > 0 && !activeUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSwitchUser(users[0]);
    }
  }, [users, activeUser]);

  const removeSession = async (phone) => {
    await userServices.removeUser(phone, socket.id);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
      
      <div className="w-64 bg-(--sidebar) border-r border-(--border) p-4 flex flex-col">
        
        <h2 className="text-xl mb-4 font-semibold text-center flex items-center gap-2 justify-center">
          <PersonIcon />
          Users
        </h2>

        <InputField
          type="text"
          name="phone"
          placeholder="Enter phone"
          value={inputPhone}
          onChange={(name, value) => setInputPhone(value)}
        />

        <Button
          onClick={startSession}
          variant="primary"
          className="mt-2"
        >
          Add User
        </Button>

        <div className="mt-4 flex-1 overflow-auto">
          {users.map((user) => (
            <div
              key={user}
              className={`p-2 mt-2 rounded flex justify-between items-center cursor-pointer transition ${
                activeUser === user
                  ? "bg-(--primary) text-(--text-inverse)"
                  : "bg-(--bg-secondary) hover:bg-(--border)"
              }`}
            >
              <span onClick={() => handleSwitchUser(user)}>
                {user}
              </span>

              <Button
                onClick={() => removeSession(user)}
                variant="danger"
                className="px-2 py-1 text-xs"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">
        
        {/* HEADER */}
        <div className="bg-(--card) border-b border-(--border) p-4 flex justify-between items-center">
          
          <h1 className="text-2xl font-bold">
            WhatsApp Dashboard
          </h1>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="p-2 rounded-lg hover:bg-(--bg-secondary) transition"
          >
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-auto">
          
          <h3 className="text-lg mb-4">
            Status: {status}
          </h3>

          {loading && (
            <div className="flex justify-center mt-10">
              <div className="w-10 h-10 border-4 border-(--border) border-t-(--primary) rounded-full animate-spin"></div>
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