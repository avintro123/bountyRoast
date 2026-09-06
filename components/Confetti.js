"use client";

import { useCallback } from "react";

// Color palettes for different events
const PALETTES = {
  fire: ["#ff2d78", "#ffd600", "#ff3333", "#ff6b00", "#ff2d78"],
  defense: ["#00ff88", "#bfff00", "#00d4ff", "#00ff88", "#bfff00"],
  immune: ["#7b2fff", "#00d4ff", "#ff2d78", "#7b2fff", "#bfff00"],
};

function createParticle(x, y, palette) {
  const el = document.createElement("div");
  el.className = "confetti-particle";

  const color = palette[Math.floor(Math.random() * palette.length)];
  const size = 6 + Math.random() * 8;
  const angle = Math.random() * 360;
  const velocity = 200 + Math.random() * 400;
  const vx = Math.cos((angle * Math.PI) / 180) * velocity;
  const vy = Math.sin((angle * Math.PI) / 180) * velocity - 200; // bias upward
  const rotation = Math.random() * 720 - 360;
  const duration = 800 + Math.random() * 1200;

  // Random shape: square, rectangle, or circle
  const shapes = ["square", "rect", "circle"];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];

  el.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: ${shape === "rect" ? size * 2 : size}px;
    height: ${size}px;
    background: ${color};
    border-radius: ${shape === "circle" ? "50%" : "0"};
    pointer-events: none;
    z-index: 99999;
    box-shadow: 0 0 6px ${color};
  `;

  document.body.appendChild(el);

  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = (currentTime - startTime) / 1000;
    const progress = elapsed / (duration / 1000);

    if (progress >= 1) {
      el.remove();
      return;
    }

    const currentX = x + vx * elapsed * 0.3;
    const currentY = y + vy * elapsed * 0.3 + 0.5 * 600 * elapsed * elapsed;
    const currentRotation = rotation * progress;
    const opacity = 1 - progress;

    el.style.transform = `translate(${currentX - x}px, ${currentY - y}px) rotate(${currentRotation}deg)`;
    el.style.opacity = opacity;

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

export function triggerConfetti(type = "fire", originEl = null) {
  const palette = PALETTES[type] || PALETTES.fire;
  const particleCount = type === "immune" ? 60 : type === "defense" ? 45 : 30;

  // Determine origin point
  let x, y;
  if (originEl) {
    const rect = originEl.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  } else {
    x = window.innerWidth / 2;
    y = window.innerHeight / 2;
  }

  for (let i = 0; i < particleCount; i++) {
    setTimeout(() => {
      createParticle(
        x + (Math.random() - 0.5) * 40,
        y + (Math.random() - 0.5) * 40,
        palette
      );
    }, Math.random() * 200);
  }
}

// React hook for easy confetti triggering
export function useConfetti() {
  const fire = useCallback((type = "fire", el = null) => {
    triggerConfetti(type, el);
  }, []);

  return fire;
}

// Component version (for rendering as JSX if needed)
export default function Confetti({ trigger, type = "fire" }) {
  if (trigger) {
    triggerConfetti(type);
  }
  return null;
}
