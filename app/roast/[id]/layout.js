import { mockRoasts } from "@/data/mockRoasts";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const roast = mockRoasts.find((r) => r.id === id);

  if (!roast) {
    return {
      title: "Roast on The Grill — BountyRoast.lol",
    };
  }

  const targetHandle = roast.target?.handle || "founder";
  const bounty = roast.bountyAmount || 500;
  const roastText = roast.roastText || "";
  const ogImageUrl = `/api/og?handle=${encodeURIComponent(targetHandle)}&bounty=${encodeURIComponent(bounty)}&roast=${encodeURIComponent(roastText)}&theme=light`;

  return {
    title: `@${targetHandle} is on The Grill ($${bounty} Bounty) — BountyRoast.lol`,
    description: `"${roastText}" — Defend yourself or stay flame-grilled.`,
    openGraph: {
      title: `@${targetHandle} is on The Grill — $${bounty} Bounty 🔥`,
      description: `"${roastText}"`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Roast on @${targetHandle}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `@${targetHandle} on The Grill ($${bounty} Bounty) 🔥`,
      description: `"${roastText}"`,
      images: [ogImageUrl],
    },
  };
}

export default function RoastDetailLayout({ children }) {
  return children;
}
