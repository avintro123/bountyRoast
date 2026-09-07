"use client";

import { useState } from "react";

const spiceLevels = [
  { min: 1, max: 20, label: "Mild 🌶️" },
  { min: 21, max: 75, label: "Medium 🔥" },
  { min: 76, max: 200, label: "Hot 🔥🔥" },
  { min: 201, max: 500, label: "Inferno 💥" },
];

function getSpiceLevel(amount) {
  return (
    spiceLevels.find((l) => amount >= l.min && amount <= l.max) ||
    spiceLevels[spiceLevels.length - 1]
  );
}

export default function BountySlider({ value, onChange }) {
  const [amount, setAmount] = useState(value || 1);
  const spice = getSpiceLevel(amount);

  const handleChange = (e) => {
    const val = parseInt(e.target.value);
    setAmount(val);
    if (onChange) onChange(val);
  };

  return (
    <div style={{ padding: "12px 0" }}>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "36px",
            fontWeight: 800,
            color: "var(--accent-coral)",
            letterSpacing: "-0.02em",
          }}
        >
          ${amount}
        </div>
        <div style={{ marginTop: "4px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              background: "var(--accent-coral-subtle)",
              border: "1px solid var(--accent-coral-border)",
              borderRadius: "var(--radius-full)",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--accent-coral)",
            }}
          >
            {spice.label}
          </span>
        </div>
      </div>

      <input
        type="range"
        min="1"
        max="500"
        step="1"
        value={amount}
        onChange={handleChange}
        style={{
          width: "100%",
          accentColor: "var(--accent-coral)",
          cursor: "pointer",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "var(--text-muted)",
          fontWeight: 600,
          marginTop: "8px",
        }}
      >
        <span>$1</span>
        <span>$50</span>
        <span>$150</span>
        <span>$300</span>
        <span>$500</span>
      </div>
    </div>
  );
}
