import "./globals.css";
import MarqueeTicker from "@/components/MarqueeTicker";
import Navbar from "@/components/Navbar";
import Providers from "@/app/providers";

export const metadata = {
  title: "BountyRoast.lol — Pay to Roast. Pay to Survive.",
  description:
    "The internet's spiciest leaderboard. Pay to roast indie founders. Pay to defend yourself. The grill never stops. 🔥",
  keywords: "roast, bounty, indie hackers, founders, SaaS, viral, leaderboard",
  openGraph: {
    title: "BountyRoast.lol — Pay to Roast. Pay to Survive. 🔥",
    description:
      "Drop a bounty on any founder. They defend or get flame-grilled. The internet decides who burns.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
