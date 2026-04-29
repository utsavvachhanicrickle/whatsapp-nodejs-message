import React, { useState, useMemo } from "react";
import Button from "../Button";

function WhatsappGroupMessageSidebar({
  groups,
  multipleGroup,
  setMultipleGroup,
}) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const isSelected = (g) => multipleGroup.some((item) => item.id === g.id);

  const toggleGroup = (g) => {
    if (isSelected(g)) {
      setMultipleGroup((prev) => prev.filter((item) => item.id !== g.id));
    } else {
      setMultipleGroup((prev) => [...prev, g]);
    }
  };

  const filteredGroups = useMemo(() => {
    if (!groups) return [];

    let filtered = groups.filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase()),
    );

    filtered.sort((a, b) => {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

    return filtered;
  }, [groups, search, sortOrder]);

  const handleSelectAll = () => {
    if (multipleGroup.length === groups.length) {
      setMultipleGroup([]);
    } else {
      setMultipleGroup(groups);
    }
  };

  return (
    <div className="w-72 min-h-screen max-h-screen p-4 bg-(--sidebar) border-r border-(--border) overflow-y-auto">
      {/* HEADER */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-(--text-primary)">
            Groups ({multipleGroup.length})
          </h3>
          <Button onClick={handleSelectAll} className="text-xs px-2 py-1">
            {multipleGroup.length === groups?.length
              ? "Unselect All"
              : "Select All"}
          </Button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 text-sm border rounded bg-(--bg-primary) text-(--text-primary) outline-none focus:border-green-500"
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-sm border rounded px-1 bg-(--bg-primary)"
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-2">
        {filteredGroups.length === 0 && (
          <p className="text-sm text-(--text-secondary) text-center mt-4">
            No groups found
          </p>
        )}

        {filteredGroups.map((g) => {
          const selected = isSelected(g);

          return (
            <div
              key={g.id}
              onClick={() => toggleGroup(g)} // Direct click to add/remove
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer
                transition-all duration-200 select-none
                ${
                  selected
                    ? "bg-(--bg-select) border-green-500 shadow-sm"
                    : "border-(--border) hover:bg-(--bg-secondary)"
                }`}
            >
              {/* CHECKBOX (Visual only, click handled by parent div) */}
              <input
                type="checkbox"
                checked={selected}
                readOnly
                className="w-4 h-4 cursor-pointer accent-green-600"
              />

              <div className="flex-1 truncate">
                <p
                  className={`font-medium truncate ${selected ? "text-green-700" : "text-(--text-primary)"}`}
                >
                  {g.name}
                </p>
                <p className="text-[10px] text-(--text-secondary) truncate opacity-60">
                  {g.id}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WhatsappGroupMessageSidebar;
