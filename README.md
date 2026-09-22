# 🔥 BountyRoast

[![CI Quality Gates](https://github.com/avintro123/bountyRoast/actions/workflows/ci.yml/badge.svg)](https://github.com/avintro123/bountyRoast/actions/workflows/ci.yml)

# 🔥 BountyRoast.lol — Pay to Roast. Pay to Survive.

The internet's spiciest founder roast leaderboard. Pay to rank roasts on indie founders. Founders have 72 hours to defend themselves, or stay flame-grilled on **The Grill**.

Inspired by clean, human-crafted indie web design (warm paper minimalism, deep ink typography, and cayenne ember accents).

---

## 🌶️ Core Mechanics

- **The Grill (Ranked Leaderboard)**: Roasts are ranked purely by active bounty size. Higher bounties pin roasts higher.
- **Drop a Roast**: Anyone can drop a bounty on any founder with a spicy take, back it with real cash, and set a 72-hour countdown timer.
- **Fuel the Fire**: Spectators can chip in ($1, $5, $25, etc.) to fuel existing roasts and boost them up the leaderboard.
- **Option A Defense Model**: Targets have 3 strategic options to handle the heat:
  1. **🛡️ Pay to Clear**: Pay current bounty + $1 to extinguish the roast and erase it from the active Grill.
  2. **🎤 Post a Comeback (FREE)**: Pin an official rebuttal directly under the roast card on The Grill.
  3. **🔄 Redirect Flame (FREE)**: Pass the heat to a competitor's handle, creating a new live bounty on The Grill.
- **Hall of Flame**: Archived museum of legendary past roasts, high-stakes pay-to-clears, and viral comebacks.

---

## 🎨 Design System & Aesthetics

- **Human-Crafted Minimalism**: Built with bespoke Vanilla CSS design tokens. No generic AI templates, no tacky crypto glows, no neon noise.
- **Light Mode**: Warm natural linen paper (`#F6F5F0`), crisp white cards (`#FFFFFF`), stone borders (`#E5E2DA`), deep ink text (`#191816`), and cayenne ember accents (`#C93B2B`).
- **Dark Mode**: Understated warm slate (`#141518`), graphite surface cards (`#1E2025`), subtle borders (`#2D3039`), and light typography (`#F4F4F5`).
- **Zero-Flicker Theme Toggle**: React 19 `useSyncExternalStore` + pre-hydration script with `localStorage` persistence.

---

## 🖼️ Dynamic Shareable Roast Cards

- **Edge OG Generator (`/api/og`)**: Generates custom 1200×630 PNG roast cards on demand using Next.js `ImageResponse`.
- **Interactive Share Modal**: Roasters and spectators can preview the card, toggle card themes (Warm Paper vs. Warm Slate), download the high-res PNG, or post directly to 𝕏 with one click.
- **Dynamic Crawler Tags**: Social crawlers (Twitterbot, Discord, Telegram) automatically render rich preview cards when roast links are shared.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: Vanilla CSS Design Tokens (Responsive, Zero Tailwind dependencies)
- **Image Generation**: Edge `next/og` (Satori / Yoga WASM)
- **Audio Effects**: Web Audio API Sound Synthesizer (Zero external audio asset lag)
- **Icons & Avatars**: SVG Dicebear pixel avatars & standard Unicode emojis

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17+ or higher
- npm, pnpm, or yarn

### Installation

```bash
git clone https://github.com/your-username/bountyroast.git
cd bountyroast
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Lint & Quality Check

```bash
npm run lint
```

### Production Build

```bash
npm run build
npm run start
```

---

## 📄 License

MIT License © 2026 BountyRoast.lol
