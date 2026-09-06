"use client";

import { useEffect } from "react";

export default function PopupModal({
  isOpen,
  onClose,
  title = "Modal",
  children,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
            paddingBottom: "12px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: 1,
              padding: "4px 8px",
              borderRadius: "var(--radius-sm)",
              transition: "var(--transition)",
            }}
            onMouseOver={(e) => (e.target.style.color = "var(--text-primary)")}
            onMouseOut={(e) => (e.target.style.color = "var(--text-muted)")}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
