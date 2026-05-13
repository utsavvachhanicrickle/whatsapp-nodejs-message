import React, { useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";

function WhatsappGroupMessageSidebar({
  groups,
  multipleGroup,
  setMultipleGroup,
  setIsGroupMode,
  isStandalone = true,
  search = "",
  sortOrder = "asc"
}) {

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
    <div className={`h-full flex flex-col ${isStandalone ? 'w-80 bg-(--sidebar) border-r border-(--border)' : 'w-full'}`}>
      {/* 📌 FIXED HEADER */}
      {isStandalone && (
        <div className="flex flex-col gap-0">
          {/* TOP ACTIONS */}
          <div className="p-4 flex items-center justify-between border-b border-(--border) bg-(--header)">
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsGroupMode(false)}
                  className="px-3 py-1 text-xs font-medium rounded-full text-(--text-secondary) hover:bg-(--bg-secondary) transition-all"
                >
                  Personal
                </button>
                <button 
                  onClick={() => setIsGroupMode(true)}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-(--primary) text-white transition-all shadow-sm"
                >
                  Groups
                </button>
             </div>
          </div>

          {/* SEARCH & SORT */}
          <div className="p-3 flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search groups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border-none rounded-lg bg-(--bg-secondary) focus:ring-1 focus:ring-(--primary) outline-none text-(--text-primary)"
              />
              <SearchIcon className="absolute left-3 top-2.5 text-(--text-secondary)" fontSize="small" />
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-(--text-secondary)">
                {multipleGroup.length > 0 ? `${multipleGroup.length} selected` : `All Groups (${groups.length})`}
              </span>
              <div className="flex gap-3 items-center">
                <button onClick={handleSelectAll} className="text-[11px] font-bold text-(--primary) hover:underline uppercase tracking-wider">
                  {multipleGroup.length === groups.length ? "Clear" : "All"}
                </button>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="text-[11px] font-bold bg-transparent border-none outline-none text-(--text-secondary) uppercase tracking-wider cursor-pointer"
                >
                  <option value="asc">A-Z</option>
                  <option value="desc">Z-A</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📜 SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-(--border)">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center opacity-40">
             <SearchIcon sx={{ fontSize: 48 }} className="mb-2" />
             <p className="text-sm">No groups found</p>
          </div>
        ) : (
          filteredGroups.map((g) => {
            const selected = isSelected(g);
            return (
              <div
                key={g.id}
                onClick={() => toggleGroup(g)}
                className={`group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-(--border)/50 transition-all
                  ${selected ? "bg-(--bg-active)" : "hover:bg-(--bg-secondary)"}`}
              >
                {/* CHECKBOX */}
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selected}
                    readOnly
                    className="w-4 h-4 cursor-pointer accent-(--primary) rounded"
                  />
                </div>

                {/* AVATAR */}
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold shrink-0">
                  <span className="text-xs">{g.name.slice(0, 2).toUpperCase()}</span>
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate ${selected ? 'text-(--primary)' : 'text-(--text-primary)'}`}>
                    {g.name}
                  </h4>
                  <p className="text-[10px] text-(--text-secondary) truncate opacity-60">ID: {g.id.slice(0, 15)}...</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default WhatsappGroupMessageSidebar;
