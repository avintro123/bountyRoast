import "./globals.css";
import MarqueeTicker from "@/components/MarqueeTicker";
import Navbar from "@/components/Navbar";
import Providers from "@/app/providers";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://bounty-roast.vercel.app"
  ),
  title: "BountyRoast.lol — Pay to Roast. Pay to Survive. 🔥",
  description:
    "The internet's spiciest leaderboard. Pay to roast indie founders. Pay to defend yourself. The grill never stops. 🔥",
  keywords: "roast, bounty, indie hackers, founders, SaaS, viral, leaderboard",
  openGraph: {
    title: "BountyRoast.lol — Pay to Roast. Pay to Survive. 🔥",
    description:
      "Drop a bounty on any founder. They defend or get flame-grilled. The internet decides who burns.",
    url: "https://bounty-roast.vercel.app",
    siteName: "BountyRoast.lol",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "BountyRoast — The Internet's Spiciest Leaderboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BountyRoast.lol — Pay to Roast. Pay to Survive. 🔥",
    description:
      "Drop a bounty on any founder. They defend or get flame-grilled. The internet decides who burns.",
    images: ["/api/og"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("bountyroast_theme");if(s==="dark"){document.documentElement.setAttribute("data-theme","dark");document.documentElement.classList.add("dark");}else{document.documentElement.setAttribute("data-theme","light");document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Providers>
          <MarqueeTicker />
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
