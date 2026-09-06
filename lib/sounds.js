"use client";

let audioCtx = null;
let muted = false;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency, duration, type = "square", volume = 0.15, ramp = null) {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume if suspended (browser autoplay policy)
  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  if (ramp) {
    osc.frequency.linearRampToValueAtTime(ramp, ctx.currentTime + duration);
  }

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

// 🔥 Fuel — quick ascending "coin" chirp
export function playFuel() {
  playTone(600, 0.08, "square", 0.12);
  setTimeout(() => playTone(900, 0.1, "square", 0.12), 80);
}

// 🛡️ Defend — shield "ding" chord
export function playDefend() {
  playTone(523, 0.15, "sine", 0.15); // C
  setTimeout(() => playTone(659, 0.15, "sine", 0.15), 100); // E
  setTimeout(() => playTone(784, 0.25, "sine", 0.12), 200); // G
}

// ⚡ Immune — deep bass + sparkle sweep
export function playImmune() {
  playTone(120, 0.3, "sawtooth", 0.18);
  setTimeout(() => playTone(800, 0.15, "sine", 0.1, 1600), 150);
  setTimeout(() => playTone(1200, 0.2, "sine", 0.08, 2000), 300);
  setTimeout(() => playTone(1600, 0.3, "triangle", 0.06), 450);
}

// ☠️ Expire — descending "game over" tone
export function playExpire() {
  playTone(440, 0.2, "square", 0.12);
  setTimeout(() => playTone(330, 0.2, "square", 0.1), 200);
  setTimeout(() => playTone(220, 0.4, "square", 0.08), 400);
}

// 🔄 Redirect — whoosh sweep
export function playRedirect() {
  playTone(300, 0.3, "sawtooth", 0.1, 800);
}

// 🔔 Notification — gentle ping
export function playNotification() {
  playTone(880, 0.1, "sine", 0.08);
  setTimeout(() => playTone(1100, 0.15, "sine", 0.06), 100);
}

// Mute controls
export function setMuted(val) {
  muted = val;
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}
