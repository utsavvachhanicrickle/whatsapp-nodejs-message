import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ChatIcon from "@mui/icons-material/Chat";
import GroupsIcon from "@mui/icons-material/Groups";
import AddLinkIcon from "@mui/icons-material/AddLink";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LockResetIcon from "@mui/icons-material/LockReset";
import { DarkModeContext } from "../context/darkModeContext";
import ChangePasswordModal from "./ChangePasswordModal";

function VerticalNav({ 
  users, 
  activeUser, 
  onSwitchUser, 
  onAddSession, 
  onLogout,
  onDeleteUser,
  hideAddDelete = false
}) {
  const { darkMode, setDarkMode } = useContext(DarkModeContext);
  const [showSettings, setShowSettings] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-16 h-full bg-(--nav-bar) border-r border-(--border) flex flex-col items-center py-4 justify-between relative z-50">
      {/* Top Section: Active Sessions */}
      <div className="flex flex-col gap-4 w-full items-center overflow-y-auto custom-scrollbar flex-1 pb-4">
        {/* Profile Avatar (Current User or default) */}
        <button 
          onClick={() => navigate("/")}
          title="Go to Home"
          className="w-10 h-10 rounded-full bg-(--primary) flex items-center justify-center text-white font-bold mb-2 shadow-sm shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
        >
          US
        </button>

        <div className="w-8 h-px bg-(--border) mb-2 shrink-0" />

        {/* List of Sessions */}
        {users?.map((user) => (
          <div key={user} className="group relative">
            <button
              onClick={() => onSwitchUser(user)}
              className={`w-10 h-10 rounded-full transition-all flex items-center justify-center font-bold text-xs shadow-sm ${
                activeUser === user
                  ? "bg-(--primary) text-white ring-2 ring-(--primary) ring-offset-2 ring-offset-(--bg-primary)"
                  : "bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--bg-active)"
              }`}
              title={user}
            >
              {user.slice(-2)}
            </button>
            
            {/* Hover Tooltip & Delete button */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 bg-(--bg-primary) border border-(--border) px-3 py-1.5 rounded-lg shadow-xl z-100 whitespace-nowrap animate-fade-in">
               <span className="text-xs font-semibold text-(--text-primary)">{user}</span>
               {!hideAddDelete && (
                 <button 
                   onClick={(e) => { e.stopPropagation(); onDeleteUser(e, user); }}
                   className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded transition-colors"
                 >
                   <DeleteIcon sx={{ fontSize: 14 }} />
                 </button>
               )}
            </div>
          </div>
        ))}
        
        {!hideAddDelete && (
          <button
            onClick={onAddSession}
            className="w-10 h-10 rounded-full text-(--text-secondary) bg-(--bg-secondary) hover:bg-(--bg-active) transition-all flex items-center justify-center mt-2 border-2 border-dashed border-(--border) shrink-0"
            title="Add New Session"
          >
            <AddLinkIcon fontSize="small" />
          </button>
        )}

        <div className="w-8 h-px bg-(--border) my-2 shrink-0" />

        {/* Assigned to Me / Shared Chats button */}
        <div className="group relative">
          <button
            onClick={() => onSwitchUser("shared-chats")}
            className={`w-10 h-10 rounded-full transition-all flex items-center justify-center font-bold text-xs shadow-sm ${
              activeUser === "shared-chats"
                ? "bg-(--primary) text-white ring-2 ring-(--primary) ring-offset-2 ring-offset-(--bg-primary)"
                : "bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--bg-active)"
            }`}
            title="Assigned to Me"
          >
            <AssignmentIndIcon fontSize="small" />
          </button>
          
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 bg-(--bg-primary) border border-(--border) px-3 py-1.5 rounded-lg shadow-xl z-100 whitespace-nowrap animate-fade-in">
             <span className="text-xs font-semibold text-(--text-primary)">Assigned to Me</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Settings */}
      <div className="flex flex-col gap-4 w-full items-center pt-4 border-t border-(--border)">
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-full transition-all ${
              showSettings ? "bg-(--bg-active) text-(--primary)" : "text-(--text-secondary) hover:bg-(--bg-secondary)"
            }`}
          >
            <SettingsIcon />
          </button>

          {showSettings && (
            <div className="absolute bottom-0 left-16 mb-2 w-48 bg-(--bg-primary) rounded-lg shadow-xl border border-(--border) animate-fade-in overflow-hidden z-100">
              <button
                onClick={() => {
                  setDarkMode(!darkMode);
                  setShowSettings(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-(--bg-secondary) text-(--text-primary) transition-colors"
              >
                {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setIsPasswordModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-(--bg-secondary) text-(--text-primary) transition-colors"
              >
                <LockResetIcon fontSize="small" />
                Change Password
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  if (hideAddDelete) {
                    navigate("/");
                  } else {
                    navigate("/default-keywords-replye");
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-(--bg-secondary) text-(--text-primary) transition-colors"
              >
                {hideAddDelete ? (
                  <>
                    <ChatIcon fontSize="small" />
                    <span>Back to Home</span>
                  </>
                ) : (
                  <>
                    <ReplyIcon fontSize="small" />
                    <span>Auto Reply Settings</span>
                  </>
                )}
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-(--bg-secondary) text-red-500 transition-colors"
              >
                <LogoutIcon fontSize="small" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </div>
  );
}

export default VerticalNav;
