import { useEffect, useState, useContext } from "react";
import { socket } from "../socket";
import QR from "../components/QR";
import SendMessage from "../components/SendMessage";

import { DarkModeContext } from "../context/darkModeContext";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PersonIcon from "@mui/icons-material/Person";

import InputField from "../components/InputField";
import Button from "../components/Button";

import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, addUser, removeUser } from "../store/slices/userSlice";

function HomePage() {
  const { darkMode, setDarkMode } = useContext(DarkModeContext);

  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);

  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState("Idle");
  const [inputPhone, setInputPhone] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= LOAD USERS =================
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // ================= SOCKET EVENTS =================
  useEffect(() => {
    const handleQR = ({ sessionId, qr }) => {
      setQr(qr);
      setStatus(`Scan QR for ${sessionId}`);
      setLoading(false);
    };

    const handleAuthenticated = ({ sessionId }) => {
      setStatus(`Authenticated: ${sessionId}`);
    };

    const handleReady = ({ sessionId }) => {
      setQr(null);
      setStatus(`Connected: ${sessionId} ✅`);
      setLoading(false);
    };

    const handleDisconnected = ({ sessionId }) => {
      setStatus(`Disconnected: ${sessionId} ❌`);
    };

    const handleSessionRemoved = ({ sessionId }) => {
      dispatch(removeUser(sessionId));

      if (activeUser === sessionId) {
        setActiveUser(null);
        setQr(null);
        setStatus("Idle");
      }
    };

    socket.on("qr", handleQR);
    socket.on("authenticated", handleAuthenticated);
    socket.on("ready", handleReady);
    socket.on("disconnected", handleDisconnected);
    socket.on("session-removed", handleSessionRemoved);

    return () => {
      socket.off("qr", handleQR);
      socket.off("authenticated", handleAuthenticated);
      socket.off("ready", handleReady);
      socket.off("disconnected", handleDisconnected);
      socket.off("session-removed", handleSessionRemoved);
    };
  }, [activeUser, dispatch]);

  // ================= ADD USER =================
  const startSession = () => {
    if (!inputPhone.trim()) {
      alert("Enter phone");
      return;
    }

    setLoading(true);

    dispatch(
      addUser({
        phone: inputPhone,
        socketId: socket.id,
        onSuccess: (user) => {
          setActiveUser(user);
          setStatus(`Connected: ${user.phone}`);
        },
      }),
    );

    setInputPhone("");
    setLoading(false);
  };
  console.log("users", users);
  // ================= SWITCH USER =================
  const handleSwitchUser = (user) => {
    setActiveUser(user);
    setQr(null);
    setStatus(`Connected: ${user} ✅`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
      {/* ================= SIDEBAR ================= */}
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

        <Button onClick={startSession} variant="primary" className="mt-2">
          {loading ? "Adding..." : "Add User"}
        </Button>

        <div className="mt-4 flex-1 overflow-auto">
          {users?.map((user) => (
            <div
              key={user.id}
              className={`p-2 mt-2 rounded flex justify-between items-center cursor-pointer transition ${
                activeUser?.id === user.id
                  ? "bg-(--primary) text-(--text-inverse)"
                  : "bg-(--bg-secondary) hover:bg-(--border)"
              }`}
            >
              <span onClick={() => handleSwitchUser(user)}>{user}</span>

              <Button
                onClick={() => dispatch(removeUser(user.id))}
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
          <h1 className="text-2xl font-bold">WhatsApp Dashboard</h1>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="p-2 rounded-lg hover:bg-(--bg-secondary) transition"
          >
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-auto">
          <h3 className="text-lg mb-4">Status: {status}</h3>

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
