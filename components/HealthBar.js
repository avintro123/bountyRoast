"use client";

export default function HealthBar({ value = 50, max = 100, label = "" }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div style={{ width: "100%", margin: "10px 0" }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "var(--text-muted)",
            fontWeight: 500,
            marginBottom: "6px",
          }}
        >
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: "8px",
          background: "var(--bg-subtle)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "var(--accent-coral)",
            borderRadius: "var(--radius-full)",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
