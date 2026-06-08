import { useEffect, useContext, useState } from "react";
import { SocketContext } from "../context/scoketContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, addUser, removeUser } from "../store/slices/userSlice";
import { socket } from "../socket";
import { logout } from "../store/slices/authSlices";
import toast from "../utils/Toast";

// Components
import VerticalNav from "../components/VerticalNav";
import QRModal from "../components/QRModal";
import AddSessionModal from "../components/AddSessionModal";
import SendMessage from "../components/SendMessage/SendMessage";
import VerifiedIcon from "@mui/icons-material/Verified";
import LogoutIcon from "@mui/icons-material/Logout";

function HomePage() {
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
  const { users, loading: usersLoading } = useSelector((state) => state.user);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Handle Initial User
  useEffect(() => {
    if (usersLoading || activeUser) return;
    if (users && users.length > 0) {
      const user = users[0];
      handleSwitchUser(user);
    } else if (users && users.length === 0) {
      handleSwitchUser("shared-chats");
    }
  }, [users, usersLoading, activeUser]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleAddSession = async (phone) => {
    if (!phone.trim()) return toast.error("Enter phone");
    if (!socketId) return toast.error("Socket not connected yet");

    setLoading(true);
    try {
      const res = await dispatch(addUser({ phone, socketId })).unwrap();
      const user = res;
      handleSwitchUser(user);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("❌ Add user failed:", err);
    }
    setLoading(false);
  };

  const handleSwitchUser = (user) => {
    if (user === "shared-chats") {
      switchUser(user);
      setQr(null);
      setStatus("Viewing Shared Chats");
      setLoading(false);
      return;
    }

    if (user === activeUser && status.includes("Connected")) return;

    switchUser(user);
    setQr(null);
    setStatus(`Connecting: ${user}...`);
    setLoading(true);

    socket.emit("start-session", {
      sessionId: user,
      socketId,
    });
  };

  const handleDeleteUser = async (e, user) => {
    e.stopPropagation();
    if (deletingUser === user) return;

    setDeletingUser(user);
    setLoading(true);
    try {
      await dispatch(removeUser({ phone: user, socketId })).unwrap();
      if (activeUser === user) {
        switchUser(null);
        setStatus("No active session");
        setQr(null);
      }
      toast.success("Session removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove session");
    }
    setDeletingUser(null);
    setLoading(false);
  };

  const isConnected =
    activeUser === "shared-chats" ||
    status.toLowerCase().includes("ready") ||
    status.toLowerCase().includes("connected");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-(--bg-app)">
      <VerticalNav
        users={users}
        activeUser={activeUser}
        onSwitchUser={handleSwitchUser}
        onAddSession={() => setIsAddModalOpen(true)}
        onLogout={handleLogout}
        onDeleteUser={handleDeleteUser}
      />

      <div className="flex-1 h-full bg-(--bg-chat) relative flex flex-col min-w-0">
        {!activeUser ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-(--bg-primary)">
            <div className="w-64 h-64 opacity-20 mb-8 grayscale">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WA"
                className="w-full h-full"
              />
            </div>
            <h1 className="text-3xl font-light text-(--text-primary) mb-4">
              WhatsApp Web Admin
            </h1>
            <p className="text-(--text-secondary) max-w-md leading-relaxed">
              Select a WhatsApp session from the sidebar or add a new one to
              start sending messages.
            </p>
            <div className="mt-12 flex items-center gap-2 text-(--text-secondary) text-xs">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>End-to-end encrypted</span>
            </div>
          </div>
        ) : (
          <div className="h-full w-full flex flex-col">
            <div className="h-15 bg-(--header) border-b border-(--border) flex items-center justify-between px-6 shrink-0 z-30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
                  {activeUser.slice(-2)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-(--text-primary)">
                      {activeUser}
                    </h2>
                    {isConnected && (
                      <VerifiedIcon
                        sx={{ fontSize: 16 }}
                        className="text-(--primary)"
                      />
                    )}
                  </div>
                  <p className="text-xs text-(--text-secondary) flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500" : "bg-orange-400"}`}
                    />
                    {status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-(--text-secondary)">
                {activeUser !== "shared-chats" && (
                  <button
                    onClick={(e) => handleDeleteUser(e, activeUser)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="Remove Session & Data"
                  >
                    <LogoutIcon sx={{ fontSize: 16 }} />
                    <span>Remove Session</span>
                  </button>
                )}
              </div>
            </div>

            {/* Main Chat/Component Area */}
            <div className="flex-1 overflow-hidden relative">
              {/* QR Section Overlay */}
              {qr && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/5backdrop-blur-sm">
                  <QRModal qr={qr} onClose={() => setQr(null)} />
                </div>
              )}

              {/* Loader Overlay */}
              {loading && !qr && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-(--bg-chat)/40 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-(--border) border-t-(--primary) rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-(--text-secondary)">
                      {status}
                    </p>
                  </div>
                </div>
              )}

              {/* SendMessage Component (This handles the contact list sidebar) */}
              <div className="h-full w-full overflow-hidden">
                <SendMessage key={activeUser} sessionId={activeUser} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddSessionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSession}
        loading={loading}
      />
    </div>
  );
}

export default HomePage;
