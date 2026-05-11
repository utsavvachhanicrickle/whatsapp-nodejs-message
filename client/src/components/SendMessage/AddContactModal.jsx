import { useState } from "react";
import toast from "../../utils/Toast";

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
      if (!name || !number) {
        return toast.error("Fill all fields");
      }

      existing.push({
        name,
        number,
      });
    } else {
      const lines = bulk.split("\n");

      lines.forEach((line) => {
        const [n, num] = line.split(",");

        if (n && num) {
          existing.push({
            name: n.trim(),
            number: num.trim(),
          });
        }
      });
    }

    localStorage.setItem("contacts", JSON.stringify(existing));

    toast.success("Contact added");

    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="
          w-[400px]
          rounded-2xl
          border
          p-6
          shadow-xl
          bg-(--bg-primary)
          border-(--border)
          text-(--text-primary)
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">Add Contact</h2>

          <button
            onClick={handleClose}
            className="
              text-(--text-secondary)
              hover:text-(--text-primary)
              transition
            "
          >
            ✕
          </button>
        </div>

        {/* MODE SWITCH */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setMode("single")}
            className={`
              px-4 py-2 rounded-lg border transition-all duration-200
              ${
                mode === "single"
                  ? "bg-(--primary) text-white border-(--primary)"
                  : "border-(--border) text-(--text-secondary) hover:bg-(--bg-secondary)"
              }
            `}
          >
            Single
          </button>

          <button
            onClick={() => setMode("bulk")}
            className={`
              px-4 py-2 rounded-lg border transition-all duration-200
              ${
                mode === "bulk"
                  ? "bg-(--primary) text-white border-(--primary)"
                  : "border-(--border) text-(--text-secondary) hover:bg-(--bg-secondary)"
              }
            `}
          >
            Bulk
          </button>
        </div>

        {/* SINGLE MODE */}
        {mode === "single" ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border
                p-3
                outline-none
                transition
                bg-(--bg-secondary)
                border-(--border)
                text-(--text-primary)
                placeholder:text-(--text-secondary)
                focus:border-(--primary)
                focus:ring-2
                focus:ring-(--primary)/20
              "
            />

            <input
              type="text"
              placeholder="Enter number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="
                w-full
                rounded-xl
                border
                p-3
                outline-none
                transition
                bg-(--bg-secondary)
                border-(--border)
                text-(--text-primary)
                placeholder:text-(--text-secondary)
                focus:border-(--primary)
                focus:ring-2
                focus:ring-(--primary)/20
              "
            />
          </div>
        ) : (
          <textarea
            placeholder="name,number&#10;name,number"
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            className="
              w-full
              h-36
              rounded-xl
              border
              p-3
              resize-none
              outline-none
              transition
              bg-(--bg-secondary)
              border-(--border)
              text-(--text-primary)
              placeholder:text-(--text-secondary)
              focus:border-(--primary)
              focus:ring-2
              focus:ring-(--primary)/20
            "
          />
        )}

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="
              px-5 py-2 rounded-xl border transition
              border-(--border)
              text-(--text-secondary)
              hover:bg-(--bg-secondary)
            "
          >
            Cancel
          </button>

          <button
            onClick={save}
            className="
              px-5 py-2 rounded-xl transition
              bg-(--primary)
              text-white
              hover:bg-(--primary-hover)
            "
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddContactModal;
