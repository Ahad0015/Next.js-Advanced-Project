"use client";

import { useState } from "react";

// Category filter. It is a client component because it holds the selected category;
// the dish grid arrives as `children`, already rendered on the server, so the grid's code
// never ships to the browser. Filtering hides non-matching cards with CSS.
export default function FilterShell({ categories, children }) {
  const [selected, setSelected] = useState("All");
  const active = categories.find((c) => c.name === selected) ?? categories[0];

  return (
    <div data-filter>
      <div role="group" aria-label="Filter by category" className="mb-5 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.name}
            type="button"
            aria-pressed={selected === c.name}
            onClick={() => setSelected(c.name)}
            className={`btn btn-sm ${selected === c.name ? "btn-primary" : "btn-secondary"}`}
          >
            {c.name} <span className="opacity-75">({c.count})</span>
          </button>
        ))}
      </div>

      {selected !== "All" && (
        <style>{`[data-filter] [data-category]:not([data-category=${JSON.stringify(selected)}]) { display: none; }`}</style>
      )}

      <p className="sr-only" role="status">
        Showing {active.count} {active.count === 1 ? "dish" : "dishes"}
        {selected === "All" ? "" : ` in ${selected}`}
      </p>
      {children}
    </div>
  );
}
