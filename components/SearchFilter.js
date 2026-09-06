"use client";

import { useState } from "react";

const FILTERS = [
  { key: "all", label: "All Bounties" },
  { key: "none", label: "🎯 Active" },
  { key: "defended", label: "🛡️ Defended" },
  { key: "redirected", label: "🔄 Redirected" },
  { key: "expired", label: "☠️ Expired" },
];

export default function SearchFilter({
  onSearch,
  onFilter,
  activeFilter = "all",
}) {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  return (
    <div className="search-filter-bar">
      {/* Category Filter Pills (Outbid style) */}
      <div className="filter-pills">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-pill ${activeFilter === f.key ? "filter-active" : ""}`}
            onClick={() => onFilter(f.key)}
            id={`filter-${f.key}`}
          >
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Clean Search Input */}
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Filter by @handle or take..."
          value={query}
          onChange={handleSearch}
          id="leaderboard-search"
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => {
              setQuery("");
              onSearch("");
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
