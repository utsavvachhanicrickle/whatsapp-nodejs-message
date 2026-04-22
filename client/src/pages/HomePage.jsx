import { useEffect, useContext, useState } from "react";
import { SocketContext } from "../context/scoketContext";
import { DarkModeContext } from "../context/darkModeContext";

import QR from "../components/QR";
import SendMessage from "../components/SendMessage";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PersonIcon from "@mui/icons-material/Person";

import InputField from "../components/Forms/InputField";
import Button from "../components/Button";

import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, addUser, removeUser } from "../store/slices/userSlice";

import { socket } from "../socket";

function HomePage() {
  const { darkMode, setDarkMode } = useContext(DarkModeContext);

  const {
    qr,
    status,
    activeUser,
    switchUser,
    socketId,
    loading,
    setLoading,
    setStatus,
    setQr,
  } = useContext(SocketContext);

  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);

  const [inputPhone, setInputPhone] = useState("");

  // ================= LOAD USERS =================
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // ================= AUTO SELECT FIRST USER =================
  useEffect(() => {
    if (users?.length > 0 && !activeUser) {
      const user = users[0];
      switchUser(user);

      setStatus(`Connecting: ${user}...`);
      setQr(null);
      setLoading(true);

      socket.emit("start-session", {
        sessionId: user,
        socketId,
      });
    }
  }, [users, activeUser, socketId]);

  const startSession = () => {
    if (!inputPhone.trim()) return alert("Enter phone");
    console.log(socketId);

    if (!socketId) {
      return alert("Socket not connected yet");
    }

    setLoading(true);

    dispatch(
      addUser({
        phone: inputPhone,
        socketId,
        onSuccess: (user) => {
          switchUser(user);

          setStatus(`Connecting: ${user}...`);
          setQr(null);
          setLoading(true);

          socket.emit("start-session", {
            sessionId: user,
            socketId,
          });
        },
      }),
    );

    setInputPhone("");
  };

  const handleSwitchUser = (user) => {
    if (user === activeUser) return;

    switchUser(user);

    setQr(null);
    setStatus(`Connecting: ${user}...`);
    setLoading(true);

    socket.emit("start-session", {
      sessionId: user,
      socketId,
    });
  };
  console.log(
    `qr : ${qr}, status: ${status}, activeUser: ${activeUser}, socketId: ${socketId}`,
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-(--bg) text-(--text-primary)">
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-(--sidebar) border-r p-4 flex flex-col">
        <h2 className="text-xl mb-4 flex justify-center items-center gap-2">
          <PersonIcon /> Users
        </h2>

        <InputField
          value={inputPhone}
          placeholder="Enter phone"
          onChange={(n, v) => setInputPhone(v)}
        />

        <Button onClick={startSession} className="mt-2">
          {loading ? "Adding..." : "Add User"}
        </Button>

        <div className="mt-4 overflow-auto">
          {users?.map((user) => (
            <div
              key={user}
              className={`p-2 mt-2 flex justify-between cursor-pointer rounded ${
                activeUser === user
                  ? "bg-(--primary) text-(--text-inverse)"
                  : "hover:bg-(--bg-secondary)"
              }`}
            >
              <span onClick={() => handleSwitchUser(user)}>{user}</span>

              <Button onClick={() => dispatch(removeUser(user))}>✕</Button>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="p-4 flex justify-between items-center border-b border-(--border)">
          <h1 className="text-xl font-semibold">WhatsApp Dashboard</h1>

          <button
            onClick={() => setDarkMode((p) => !p)}
            className="p-2 rounded hover:bg-(--bg-secondary)"
          >
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 flex-1 overflow-auto">
          <h3 className="mb-4">Status: {status}</h3>

          {loading && (
            <div className="flex justify-center mt-10">
              <div className="w-8 h-8 border-4 border-(--border) border-t-(--primary) rounded-full animate-spin"></div>
            </div>
          )}

          {qr && (
            <div className="flex justify-center mt-6">
              <QR qr={qr} />
            </div>
          )}

          {status.includes("Connected") && activeUser && (
            <div className="mt-6 flex justify-center">
              <SendMessage key={activeUser} sessionId={activeUser} />
              {/* ✅ key forces re-render on switch */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
