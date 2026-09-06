"use client";

import { useEffect, useRef } from "react";

export default function FlameParticles({ intensity = 5 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = ["#ff2d78", "#ffd600", "#ff3333", "#ff8800", "#ffaa00"];
    const particles = [];

    for (let i = 0; i < intensity; i++) {
      const particle = document.createElement("div");
      particle.className = "flame-particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDelay = `${Math.random() * 2}s`;
      particle.style.animationDuration = `${1 + Math.random() * 1.5}s`;
      particle.style.width = `${4 + Math.random() * 6}px`;
      particle.style.height = particle.style.width;
      container.appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, [intensity]);

  return <div ref={containerRef} className="flame-container" />;
}
