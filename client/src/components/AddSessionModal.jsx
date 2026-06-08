import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Button from "./Button";
import InputField from "./Forms/InputField";

function AddSessionModal({ isOpen, onClose, onAdd, loading }) {
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-(--bg-primary) w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-(--border) flex justify-between items-center bg-(--header)">
          <h2 className="text-xl font-semibold text-(--text-primary)">Add New WhatsApp Session</h2>
          <button onClick={onClose} className="text-(--text-secondary) hover:text-(--text-primary)">
            <CloseIcon />
          </button>
        </div>
        
        <div className="p-8">
          <p className="text-sm text-(--text-secondary) mb-6">
            Enter the phone number you want to link. This will create a new session folder on the server.
          </p>
          
          <InputField
            label="Phone Number"
            value={phone}
            placeholder="e.g. 919876543210"
            onChange={(n, v) => setPhone(v)}
            className="mb-8"
          />
          
          <div className="flex gap-4 justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-(--text-secondary) hover:text-(--text-primary)"
            >
              Cancel
            </button>
            <Button 
              onClick={() => {
                onAdd(phone);
                setPhone("");
              }}
              loading={loading}
              className="px-8"
            >
              {!loading ? "Start Session" : "loading..."}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddSessionModal;
