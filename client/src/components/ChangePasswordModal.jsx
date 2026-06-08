import { useState } from "react";
import { authModules } from "../modules/authModules";
import CloseIcon from "@mui/icons-material/Close";
import LockResetIcon from "@mui/icons-material/LockReset";

function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      return alert("Please fill all fields");
    }
    if (newPassword !== confirmPassword) {
      return alert("New passwords do not match");
    }
    setLoading(true);
    try {
      await authModules.changePassword({ oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-(--bg-primary) border border-(--border) rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-(--border) bg-(--header)">
          <div className="flex items-center gap-2 text-(--primary)">
            <LockResetIcon />
            <h3 className="font-semibold text-lg text-(--text-primary)">Change Password</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-(--text-secondary) hover:bg-(--bg-secondary) transition-colors"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              required
              className="w-full px-4 py-3 text-sm border-none rounded-xl bg-(--bg-secondary) focus:ring-1 focus:ring-(--primary) outline-none text-(--text-primary)"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="w-full px-4 py-3 text-sm border-none rounded-xl bg-(--bg-secondary) focus:ring-1 focus:ring-(--primary) outline-none text-(--text-primary)"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full px-4 py-3 text-sm border-none rounded-xl bg-(--bg-secondary) focus:ring-1 focus:ring-(--primary) outline-none text-(--text-primary)"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 border-t border-(--border) pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold uppercase text-(--text-secondary) hover:bg-(--bg-secondary) rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold uppercase text-white bg-(--primary) hover:bg-(--primary-hover) rounded-lg transition-all shadow-md disabled:opacity-55 flex items-center justify-center min-w-24"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
