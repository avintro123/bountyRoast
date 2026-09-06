import Link from "next/link";

export const metadata = {
  title: "404 — Roast Not Found | BountyRoast.lol",
  description: "Even ChatGPT couldn't find this page. It probably got burned to ashes.",
};

export default function NotFound() {
  return (
    <div className="container" style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        className="card card-hot"
        style={{
          maxWidth: "600px",
          width: "100%",
          textAlign: "center",
          padding: "var(--gap-2xl) var(--gap-xl)",
          margin: "40px auto",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "16px", animation: "bounce 2s infinite" }}>
          🪦
        </div>

        <div
          className="font-pixel text-gradient-fire"
          style={{
            fontSize: "clamp(28px, 6vw, 48px)",
            letterSpacing: "4px",
            marginBottom: "12px",
          }}
        >
          404 ERROR
        </div>

        <h2
          className="font-pixel"
          style={{
            fontSize: "14px",
            color: "var(--hot-pink)",
            marginBottom: "20px",
            letterSpacing: "2px",
          }}
        >
          ROAST BURNED TO ASHES
        </h2>

        <p
          style={{
            color: "var(--text-gray)",
            fontSize: "15px",
            lineHeight: 1.6,
            marginBottom: "32px",
            maxWidth: "460px",
            marginInline: "auto",
          }}
        >
          This URL was either cleared by an outbid founder, incinerated by The Grill,
          or you just typed gibberish. Either way, there is nothing to defend here.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" className="btn btn-fire btn-lg">
            🔥 Return to The Grill
          </Link>
          <Link href="/drop" className="btn btn-lime btn-lg">
            🎯 Drop a Roast Instead
          </Link>
        </div>

        <div
          style={{
            marginTop: "32px",
            paddingTop: "20px",
            borderTop: "1px dashed var(--card-border)",
            fontFamily: "var(--font-pixel)",
            fontSize: "10px",
            color: "var(--text-dim)",
            letterSpacing: "1px",
          }}
        >
          BOUNTY: $0 · STATUS: 404 LOST IN THE CLOUD
        </div>
      </div>
    </div>
  );
}
