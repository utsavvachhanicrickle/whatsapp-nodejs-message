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

    const handleReady = ({ sessionId }) => {
      setQr(null);
      setStatus(`Connected: ${sessionId} ✅`);
      setLoading(false);
    };

    const handleSessionRemoved = ({ sessionId }) => {
      dispatch(removeUser(sessionId));

      if (activeUser?.id === sessionId) {
        setActiveUser(null);
        setQr(null);
        setStatus("Idle");
      }
    };

    socket.on("qr", handleQR);
    socket.on("ready", handleReady);
    socket.on("session-removed", handleSessionRemoved);

    return () => {
      socket.off("qr", handleQR);
      socket.off("ready", handleReady);
      socket.off("session-removed", handleSessionRemoved);
    };
  }, [activeUser, dispatch]);

  // ================= ADD USER =================
  const startSession = () => {
    if (!inputPhone.trim()) return alert("Enter phone");

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

  // ================= SWITCH USER =================
  const handleSwitchUser = (user) => {
    setActiveUser(user);
    setQr(null);
    setStatus(`Connected: ${user.phone} ✅`);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-(--bg) text-(--text-primary)">

      {/* ================= SIDEBAR ================= */}
      <div className="w-full md:w-64 bg-(--sidebar) border-b md:border-b-0 md:border-r border-(--border) p-3 md:p-4 flex flex-col">

        <h2 className="text-lg md:text-xl mb-3 md:mb-4 font-semibold flex items-center gap-2 justify-center">
          <PersonIcon />
          Users
        </h2>

        <InputField
          type="text"
          name="phone"
          placeholder="Enter phone"
          value={inputPhone}
          onChange={(n, v) => setInputPhone(v)}
        />

        <Button onClick={startSession} variant="primary" className="mt-2">
          {loading ? "Adding..." : "Add User"}
        </Button>

        {/* ================= USER LIST ================= */}
        <div className="mt-4 flex-1 overflow-y-auto max-h-40 md:max-h-none">

          {users?.map((user) => (
            <div
              key={user.id}
              className={`p-2 mt-2 rounded flex justify-between items-center cursor-pointer transition text-sm md:text-base ${
                activeUser?.id === user.id
                  ? "bg-(--primary) text-(--text-inverse)"
                  : "bg-(--bg-secondary) hover:bg-(--border)"
              }`}
            >
              <span
                className="truncate max-w-37.5"
                onClick={() => handleSwitchUser(user)}
              >
                {user}
              </span>

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
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="bg-(--card) border-b border-(--border) p-3 md:p-4 flex justify-between items-center">

          <h1 className="text-lg md:text-2xl font-bold">
            WhatsApp Dashboard
          </h1>

          <button
            onClick={() => setDarkMode((p) => !p)}
            className="p-2 rounded-lg hover:bg-(--bg-secondary)"
          >
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-3 md:p-6 overflow-auto">

          <h3 className="text-sm md:text-lg mb-4">
            Status: {status}
          </h3>

          {loading && (
            <div className="flex justify-center mt-10">
              <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-(--border) border-t-(--primary) rounded-full animate-spin"></div>
            </div>
          )}

          {qr && (
            <div className="flex justify-center mt-4 md:mt-6">
              <QR qr={qr} />
            </div>
          )}

          {status.includes("Connected") && activeUser && (
            <div className="mt-4 md:mt-6 flex justify-center">
              <SendMessage sessionId={activeUser} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default HomePage;