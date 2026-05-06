import { useState, useMemo } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "../Button";
import EventNoteIcon from "@mui/icons-material/EventNote";

function DefaultMessageSidebar({
  onSelect,
  onEdit,
  onDelete,
  defaulMessages,
}) {
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("newest");

  const filteredMessages = useMemo(() => {
    let result = defaulMessages.filter((m) => {
      const term = search.toLowerCase();
      return (
        m.title?.toLowerCase().includes(term) ||
        m.message?.toLowerCase().includes(term)
      );
    });

    if (sortType === "newest") {
      return result.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else {
      return result.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }
  }, [defaulMessages, search, sortType]);

  return (
    <div className="w-72 min-h-screen max-h-screen p-4 bg-(--sidebar) border-r border-(--border) overflow-y-auto">
      
      <h3 className="mb-3 font-semibold text-(--text-primary) flex justify-center gap-1.5">
        <EventNoteIcon />
        Templates
      </h3>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--bg-secondary) focus:outline-none"
        />

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="px-2 py-2 text-sm rounded-lg border border-(--border) bg-(--bg-secondary) cursor-pointer"
        >
          <option value="newest">new</option>
          <option value="oldest">old</option>
        </select>
      </div>

      {filteredMessages.length === 0 && (
        <p className="text-sm text-(--text-secondary)">
          No templates found
        </p>
      )}

      {filteredMessages.map((m, i) => (
        <div
          key={i}
          className="group relative p-3 mb-3 rounded-xl border border-(--border)
                     hover:bg-(--bg-secondary) transition-all duration-200"
        >

          <div
            onClick={() => onSelect(m.message)}
            className="cursor-pointer pr-16"
          >
            <p className="font-medium text-(--text-primary) truncate">
              {m.title}
            </p>

            <p className="text-sm text-(--text-secondary) line-clamp-2">
              {m.message}
            </p>
          </div>

          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition duration-200">
            <Button
              variant="ghost"
              onClick={() => onEdit(i, m)}
              className="p-1 hover:bg-(--btn-primary-hover)"
            >
              <EditIcon fontSize="small" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => onDelete(m._id)}
              className="p-1 hover:bg-red-500/20"
            >
              <DeleteIcon fontSize="small" className="text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DefaultMessageSidebar;