import { useState, useMemo } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

function DefaultMessageSidebar({ onSelect, onEdit, onDelete, defaulMessages }) {
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("newest");

  const filteredMessages = useMemo(() => {
    const term = search.toLowerCase();

    const filtered = defaulMessages.filter((m) => {
      return (
        m.title?.toLowerCase().includes(term) ||
        m.message?.toLowerCase().includes(term)
      );
    });

    return [...filtered].sort((a, b) => {
      return sortType === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [defaulMessages, search, sortType]);

  return (
    <div className="w-72  h-full flex flex-col border-r bg-(--sidebar) border-(--border) text-(--text-primary) ">
      {/* HEADER */}
      <div className="p-4 border-b border-(--border)">
        <h2 className="text-lg font-semibold mb-4">Templates</h2>

        {/* SEARCH */}
        <div className="relative mb-4">
          <SearchIcon
            fontSize="small"
            className=" absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary) "
          />

          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className=" w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all bg-(--bg-secondary) border-(--border) text-(--text-primary) placeholder:text-(--text-secondary) focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 "
          />
        </div>

        {/* SORT */}
        <div className="flex items-center justify-between">
          <span className=" text-[11px] uppercase tracking-wider font-semibold text-(--text-secondary)">
            Sorting
          </span>

          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className=" rounded-lg border px-2 py-1 text-xs outline-none  cursor-pointer transition bg-(--bg-secondary) border-(--border) text-(--text-primary) focus:border-(--primary) "
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* MESSAGE LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredMessages.length === 0 ? (
          <div
            className="
              h-full
              flex
              flex-col
              items-center
              justify-center
              text-center
              opacity-50
            "
          >
            <div className="text-4xl mb-3">📭</div>

            <p className="text-sm text-(--text-secondary)">
              No templates found
            </p>
          </div>
        ) : (
          filteredMessages.map((m, i) => (
            <div
              key={m._id || i}
              onClick={() => onSelect(m.message)}
              className="
                group
                relative
                rounded-2xl
                border
                p-4
                cursor-pointer
                transition-all
                duration-200
                bg-(--bg-primary)
                border-(--border)
                hover:border-(--primary)/30
                hover:bg-(--bg-secondary)
                hover:shadow-md
              "
            >
              {/* TEXT */}
              <div className="pr-14">
                <h4
                  className="
                    text-sm
                    font-semibold
                    truncate
                    text-(--text-primary)
                  "
                >
                  {m.title}
                </h4>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-relaxed
                    line-clamp-2
                    text-(--text-secondary)
                  "
                >
                  {m.message}
                </p>
              </div>

              {/* ACTIONS */}
              <div
                className="
                  absolute
                  top-3
                  right-3
                  gap-2
                  opacity-0
                  translate-x-2
                  transition-all
                  duration-200
                  group-hover:opacity-100
                  group-hover:translate-x-0
                "
              >
                {/* EDIT */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(i, m);
                  }}
                  className="
                    p-2
                    rounded-full
                    transition
                    bg-(--bg-secondary)
                    text-(--text-secondary)
                    hover:bg-(--primary)/10
                    hover:text-(--primary)
                  "
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </button>

                {/* DELETE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(m._id);
                  }}
                  className=" p-2 rounded-full transition bg-(--bg-secondary)  text-red-400  hover:bg-red-500/10  hover:text-red-500 "
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DefaultMessageSidebar;
