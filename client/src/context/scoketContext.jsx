import { useEffect, useState, createContext, useRef } from "react";
import { Outlet } from "react-router-dom";
import { socket } from "../socket";
import { useDispatch } from "react-redux";
import { removeUser } from "../store/slices/userSlice";

export const SocketContext = createContext();

export const SocketContextProvider = () => {
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState("Idle");
  const [activeUser, setActiveUser] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  // 🔥 track latest active session (prevents stale updates)
  const activeSessionRef = useRef(null);

  // ================= SOCKET CONNECT =================
  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      setSocketId(socket.id);
      console.log("Socket connected:", socket.id);
    };

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, []);

  
  // ================= SOCKET EVENTS =================
  useEffect(() => {
    const handleQR = ({ sessionId, qr }) => {
      // ❗ ignore old session events
      if (activeSessionRef.current !== sessionId) return;

      setQr(qr);
      setStatus(`Scan QR for ${sessionId}`);
      setLoading(false);
    };

    const handleReady = ({ sessionId }) => {
      if (activeSessionRef.current !== sessionId) return;

      setQr(null);
      setStatus(`Connected: ${sessionId} ✅`);
      setLoading(false);
    };

    const handleSessionRemoved = ({ sessionId }) => {
      dispatch(removeUser(sessionId));

      if (activeSessionRef.current === sessionId) {
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
  }, [dispatch]);

  // ================= SWITCH USER =================
  const switchUser = async (user) => {
    if (!user) return;

    // 🔥 reset UI instantly
    setLoading(true);
    setQr(null);
    setStatus(`Connecting: ${user}...`);

    setActiveUser(user);
    activeSessionRef.current = user;

    // 🔥 wait for socket (promise style)
    const waitForSocket = () =>
      new Promise((resolve) => {
        if (socket.connected) return resolve(socket.id);
        socket.once("connect", () => resolve(socket.id));
      });

    const id = await waitForSocket();
    setSocketId(id);

    console.log("waiting", id);
    // 🔥 trigger backend again (IMPORTANT)
    socket.emit("start-session", {
      sessionId: user,
      socketId: id,
    });
  };

  return (
    <SocketContext.Provider
      value={{
        qr,
        status,
        activeUser,
        socketId,
        loading,
        setStatus,
        setQr,
        setLoading,
        switchUser,
      }}
    >
      <Outlet />
    </SocketContext.Provider>
  );
};
