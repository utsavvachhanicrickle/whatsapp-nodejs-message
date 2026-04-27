import { useState } from "react";
import toast from "../../utils/Toast"

function AddContactModal({ onClose }) {
  const [mode, setMode] = useState("single");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [bulk, setBulk] = useState("");

  const reset = () => {
    setName("");
    setNumber("");
    setBulk("");
  };

  const handleClose = () => {
    reset();     
    onClose();
  };

  const save = () => {
    let existing = JSON.parse(localStorage.getItem("contacts")) || [];

    if (mode === "single") {
      if (!name || !number) return toast.error("Fill all fields");
      existing.push({ name, number });
    } else {
      const lines = bulk.split("\n");
      lines.forEach((line) => {
        const [n, num] = line.split(",");
        if (n && num) {
          existing.push({ name: n.trim(), number: num.trim() });
        }
      });
    }

    localStorage.setItem("contacts", JSON.stringify(existing));

    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="w-100 p-6 rounded-2xl shadow-md bg-(--card) border border-(--border)">

        <h2 className="text-xl font-semibold mb-4">
          Add Contact
        </h2>

        {/* MODE SWITCH */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("single")}            className="px-3 py-1 rounded border border-(--btn-outline-border) text-(--btn-outline-text) hover:bg-(--primary) hover:text-white"
          >
            Single
          </button>

          <button
            onClick={() => setMode("bulk")}
            className="px-3 py-1 rounded border border-(--btn-outline-border) text-(--btn-outline-text) hover:bg-(--primary) hover:text-white"
          >
            Bulk
          </button>
        </div>

        {mode === "single" ? (
          <>
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 mb-2 rounded border border-(--border) bg-(--bg-primary)"
            />

            <input
              placeholder="Number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full p-2 rounded border border-(--border) bg-(--bg-primary)"
            />
          </>
        ) : (
          <textarea
            placeholder="name,number\nname,number"
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            className="w-full p-2 rounded border border-(--border) bg-(--bg-primary) h-32"
          />
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 mt-4">

          <button
            onClick={handleClose}
            className="px-4 py-2 border border-(--btn-outline-border) text-(--btn-outline-text) rounded"
          >
            Cancel
          </button>

          <button
            onClick={save}
            className="px-4 py-2 rounded bg-(--btn-primary-bg) text-(--btn-primary-text) hover:bg-(--btn-primary-hover)"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddContactModal;