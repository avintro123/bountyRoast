// Helper: compute expiry date (72 hours from createdAt)
function expiry(createdAt) {
  return new Date(new Date(createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString();
}

// Helper: create an already-expired timestamp (for demo variety)
function expiredAt(createdAt) {
  return new Date(new Date(createdAt).getTime() + 1000).toISOString(); // expired 1s after creation
}

export const mockRoasts = [
  {
    id: "roast-001",
    target: {
      handle: "shipcaptainAI",
      displayName: "Captain Ship",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=shipcaptain",
      bio: "Building the future of AI-powered shipping logistics 🚢",
    },
    roastText:
      "Another ChatGPT wrapper that will be obsolete next Tuesday. At least the logo is nice.",
    bountyAmount: 347,
    roaster: {
      handle: "toxicdev99",
      displayName: "Toxic Dev",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=toxicdev",
    },
    createdAt: "2026-09-04T14:23:00Z",
    expiresAt: expiry("2026-09-04T14:23:00Z"),
    upvotes: 284,
    spectatorContributions: 89,
    defenseStatus: "none",
    defenseText: null,
    isHot: true,
    tags: ["ai", "wrapper", "saas"],
  },
  {
    id: "roast-002",
    target: {
      handle: "notionkiller",
      displayName: "NotionKiller.io",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=notionkiller",
      bio: "The productivity app that's going to replace Notion (for real this time)",
    },
    roastText:
      "Your 'Notion killer' just killed my browser tab. 4GB of RAM for a to-do list. Impressive.",
    bountyAmount: 203,
    roaster: {
      handle: "ramwatcher",
      displayName: "RAM Watcher",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ramwatcher",
    },
    createdAt: "2026-09-04T18:45:00Z",
    expiresAt: expiry("2026-09-04T18:45:00Z"),
    upvotes: 198,
    spectatorContributions: 54,
    defenseStatus: "defended",
    defenseText:
      "At least we HAVE users. Your GitHub has 2 stars and one is from your mom.",
    isHot: true,
    tags: ["productivity", "notion", "performance"],
  },
  {
    id: "roast-003",
    target: {
      handle: "vibecodeking",
      displayName: "Vibe Code King",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=vibecodeking",
      bio: "Shipped 47 apps this year. All of them vibe-coded. None of them profitable.",
    },
    roastText:
      "Congrats on your 47th SaaS launch this month. I'm sure THIS one will crack $10 MRR.",
    bountyAmount: 156,
    roaster: {
      handle: "realisticfounder",
      displayName: "Realistic Founder",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=realistic",
    },
    createdAt: new Date(Date.now() - 68 * 60 * 60 * 1000).toISOString(), // 68 hours ago — urgent!
    get expiresAt() { return new Date(new Date(this.createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString(); },
    upvotes: 312,
    spectatorContributions: 41,
    defenseStatus: "none",
    defenseText: null,
    isHot: true,
    tags: ["indie", "vibe-coding", "serial-launcher"],
  },
  {
    id: "roast-004",
    target: {
      handle: "blockchainbro",
      displayName: "Web4 Visionary",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=blockchain",
      bio: "Web3 was too mainstream. Building Web4. It's like Web3 but with more buzzwords.",
    },
    roastText:
      "Your 'Web4 platform' is just a Google Form with a wallet connect button. Stay decentralized king 👑",
    bountyAmount: 129,
    roaster: {
      handle: "web2enjoyer",
      displayName: "Web2 Enjoyer",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=web2",
    },
    createdAt: "2026-09-04T22:00:00Z",
    expiresAt: expiry("2026-09-04T22:00:00Z"),
    upvotes: 245,
    spectatorContributions: 33,
    defenseStatus: "redirected",
    defenseText: null,
    redirectedTo: "cryptomaxi",
    isHot: false,
    tags: ["web3", "crypto", "buzzwords"],
  },
  {
    id: "roast-005",
    target: {
      handle: "aiagentguru",
      displayName: "AI Agent Guru",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=aiagent",
      bio: "My AI agent will replace your entire engineering team (it can write Hello World)",
    },
    roastText:
      "Your AI agent couldn't automate a light switch. But sure, it'll replace software engineers. 🤖",
    bountyAmount: 98,
    roaster: {
      handle: "actualengineer",
      displayName: "Actual Engineer",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=actualeng",
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago — safe timer
    get expiresAt() { return new Date(new Date(this.createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString(); },
    upvotes: 167,
    spectatorContributions: 22,
    defenseStatus: "none",
    defenseText: null,
    isHot: false,
    tags: ["ai", "agents", "hype"],
  },
  {
    id: "roast-006",
    target: {
      handle: "saasprincess",
      displayName: "SaaS Princess",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=saasprincess",
      bio: "Building in public. $0 MRR but the vibes are immaculate ✨",
    },
    roastText:
      "12 months of 'building in public' and the only thing you've built is a following of other people also building nothing.",
    bountyAmount: 87,
    roaster: {
      handle: "quietbuilder",
      displayName: "Quiet Builder",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=quietbuilder",
    },
    createdAt: "2026-09-05T08:15:00Z",
    expiresAt: expiry("2026-09-05T08:15:00Z"),
    upvotes: 203,
    spectatorContributions: 18,
    defenseStatus: "defended",
    defenseText:
      "At least I have 50k followers. Your product has 50k lines of code nobody asked for.",
    isHot: false,
    tags: ["build-in-public", "mrr", "vibes"],
  },
  {
    id: "roast-007",
    target: {
      handle: "landingpagehero",
      displayName: "Landing Page Hero",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=landingpage",
      bio: "I make landing pages for SaaS founders. My landing page is still under construction.",
    },
    roastText:
      "A landing page builder whose own landing page has been 'coming soon' for 8 months. The cobbler's children have no shoes.",
    bountyAmount: 72,
    roaster: {
      handle: "designskeptic",
      displayName: "Design Skeptic",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=designskeptic",
    },
    createdAt: "2026-09-04T19:30:00Z",
    expiresAt: expiry("2026-09-04T19:30:00Z"),
    upvotes: 134,
    spectatorContributions: 15,
    defenseStatus: "defended",
    defenseText:
      "It's called STRATEGY. I'm building anticipation. Google it. Oh wait, you can't because your SEO tool doesn't even rank.",
    isHot: false,
    tags: ["landing-page", "irony", "design"],
  },
  {
    id: "roast-008",
    target: {
      handle: "microfounder",
      displayName: "Micro SaaS Mike",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=microfounder",
      bio: "Bootstrapped to $37/mo ARR. Living the dream 🚀",
    },
    roastText:
      "$37 MRR and calling yourself a 'founder.' My kid's lemonade stand has better unit economics.",
    bountyAmount: 55,
    roaster: {
      handle: "vcbacked",
      displayName: "VC Backed Chad",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=vcbacked",
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago — plenty of time
    get expiresAt() { return new Date(new Date(this.createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString(); },
    upvotes: 89,
    spectatorContributions: 12,
    defenseStatus: "none",
    defenseText: null,
    isHot: false,
    tags: ["micro-saas", "bootstrapped", "mrr"],
  },
  {
    id: "roast-009",
    target: {
      handle: "pivotmaster",
      displayName: "Pivot Master",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=pivotmaster",
      bio: "On my 9th pivot. This time it's different (it's not).",
    },
    roastText:
      "9 pivots in 2 years. At this point you're not a startup, you're a compass with ADHD.",
    bountyAmount: 43,
    roaster: {
      handle: "stayontrack",
      displayName: "Stay On Track",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=stayontrack",
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    get expiresAt() { return new Date(new Date(this.createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString(); },
    upvotes: 156,
    spectatorContributions: 8,
    defenseStatus: "none",
    defenseText: null,
    isHot: false,
    tags: ["pivot", "startup", "adhd"],
  },
  {
    id: "roast-010",
    target: {
      handle: "nocodeninj4",
      displayName: "No-Code Ninja",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=nocode",
      bio: "Built a $0 empire with Bubble and duct tape 🥷",
    },
    roastText:
      "Your no-code app crashes when more than 3 people use it. But at least you saved money not hiring developers.",
    bountyAmount: 34,
    roaster: {
      handle: "fullstackfrank",
      displayName: "Full Stack Frank",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=fullstack",
    },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago — halfway through
    get expiresAt() { return new Date(new Date(this.createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString(); },
    upvotes: 78,
    spectatorContributions: 5,
    defenseStatus: "none",
    defenseText: null,
    isHot: false,
    tags: ["no-code", "bubble", "scaling"],
  },
  {
    id: "roast-011",
    target: {
      handle: "threadgod",
      displayName: "Thread God",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=threadgod",
      bio: "I write 30-tweet threads about productivity while procrastinating on my own product.",
    },
    roastText:
      "Your 30-tweet thread on 'how I 10x'd my productivity' has 47 likes. Your product has 4 users. The math isn't mathing.",
    bountyAmount: 21,
    roaster: {
      handle: "shortposter",
      displayName: "Short Poster",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=shortposter",
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago — fresh
    get expiresAt() { return new Date(new Date(this.createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString(); },
    upvotes: 92,
    spectatorContributions: 3,
    defenseStatus: "none",
    defenseText: null,
    isHot: false,
    tags: ["twitter", "threads", "engagement"],
  },
  {
    id: "roast-012",
    target: {
      handle: "darkmodeboss",
      displayName: "Dark Mode Boss",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=darkmode",
      bio: "Every app I build has dark mode. That's the entire feature list.",
    },
    roastText:
      "Your app's only feature is dark mode. Even your roadmap is in the dark.",
    bountyAmount: 5,
    roaster: {
      handle: "lightmoderebell",
      displayName: "Light Mode Rebel",
      avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=lightmode",
    },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago — very fresh
    get expiresAt() { return new Date(new Date(this.createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString(); },
    upvotes: 23,
    spectatorContributions: 0,
    defenseStatus: "none",
    defenseText: null,
    isHot: false,
    tags: ["dark-mode", "features", "minimal"],
  },
];

export const mockTickerEvents = [
  "🔥 @shipcaptainAI just got roasted for $347",
  "🛡️ @notionkiller defended for $204 — 'At least we HAVE users'",
  "🎯 New target: @vibecodeking — 47 launches, 0 profits",
  "💰 Spectators added $89 to keep @shipcaptainAI at #1",
  "🔄 @blockchainbro redirected the flame to @cryptomaxi",
  "🛡️ @saasprincess posted a comeback for $87 — legendary rebuttal",
  "🔥 @aiagentguru caught a $98 bounty — 'Your AI can't automate a light switch'",
  "💰 @landingpagehero defense triggered a 134-upvote war",
  "🎯 @microfounder roasted for $55 — lemonade stand economics",
  "🔥 NEW ROAST: @pivotmaster — 'a compass with ADHD'",
];

export const mockStats = {
  activeRoasts: 42,
  totalBounties: 12847,
  spectatorsOnline: 1247,
  roastsToday: 18,
  defensesThisHour: 3,
  biggestBountyEver: 1205,
};

export const hallOfFlame = [
  {
    target: "@deleted_startup",
    roastText: "Your startup was so forgettable, even the Wayback Machine refused to cache it.",
    bountyAmount: 892,
    finalStatus: "expired",
    legend: true,
  },
  {
    target: "@former_unicorn",
    roastText: "From $1B valuation to $0 in 6 months. That's not a pivot, that's a nosedive.",
    bountyAmount: 1205,
    finalStatus: "defended",
    legend: true,
  },
  {
    target: "@gpteverything",
    roastText: "You put GPT in a calculator app and called it innovation. The calculator was already smarter.",
    bountyAmount: 567,
    finalStatus: "cleared",
    legend: true,
  },
];
