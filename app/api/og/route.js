import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const handle = searchParams.get("handle") || "shipcaptainAI";
    const name = searchParams.get("name") || handle;
    const bounty = searchParams.get("bounty") || "500";
    const rank = searchParams.get("rank") || "#1";
    const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
    let roast = searchParams.get("roast") || "Another ChatGPT wrapper that will be obsolete next Tuesday. At least the logo is nice.";

    // Neatly truncate very long roasts for card balance
    if (roast.length > 150) {
      roast = roast.slice(0, 147) + "...";
    }

    const isDark = theme === "dark";
    const bgPage = isDark ? "#141518" : "#F6F5F0";
    const bgCard = isDark ? "#1E2025" : "#FFFFFF";
    const borderColor = isDark ? "#2D3039" : "#E5E2DA";
    const textPrimary = isDark ? "#F4F4F5" : "#191816";
    const textSecondary = isDark ? "#A1A1AA" : "#575550";
    const cayenne = isDark ? "#E04836" : "#C93B2B";
    const subtleCayenne = isDark ? "rgba(224, 72, 54, 0.16)" : "rgba(201, 59, 43, 0.08)";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: bgPage,
            padding: "48px 56px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Top Bar Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "32px" }}>🔥</span>
              <span
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  color: textPrimary,
                  letterSpacing: "-0.5px",
                }}
              >
                bountyroast.lol
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: subtleCayenne,
                border: `1.5px solid ${cayenne}`,
                borderRadius: "9999px",
                padding: "8px 20px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "9999px",
                  backgroundColor: cayenne,
                }}
              />
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: cayenne,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Active On The Grill
              </span>
            </div>
          </div>

          {/* Central Roast Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: bgCard,
              borderRadius: "24px",
              border: `2px solid ${borderColor}`,
              padding: "36px 44px",
              marginTop: "20px",
              marginBottom: "20px",
              boxShadow: isDark
                ? "0 12px 36px rgba(0,0,0,0.4)"
                : "0 12px 36px rgba(25, 24, 22, 0.06)",
            }}
          >
            {/* Target Founder Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    backgroundColor: subtleCayenne,
                    border: `1.5px solid ${borderColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    fontWeight: 800,
                    color: cayenne,
                  }}
                >
                  {handle.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "26px",
                      fontWeight: 800,
                      color: textPrimary,
                    }}
                  >
                    @{handle}
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      color: textSecondary,
                      marginTop: "2px",
                    }}
                  >
                    Target Founder · {rank} Rank
                  </span>
                </div>
              </div>

              {/* Bounty Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: cayenne,
                  color: "#FFFFFF",
                  padding: "10px 24px",
                  borderRadius: "9999px",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "16px", opacity: 0.9 }}>BOUNTY</span>
                <span style={{ fontSize: "28px", fontWeight: 800 }}>
                  ${bounty}
                </span>
              </div>
            </div>

            {/* Roast Quote */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "24px",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  fontSize: "30px",
                  lineHeight: "1.35",
                  fontWeight: 500,
                  fontStyle: "italic",
                  color: textPrimary,
                }}
              >
                &ldquo;{roast}&rdquo;
              </span>
            </div>

            {/* Action Callout Footnote */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "16px",
                borderTop: `1.5px solid ${borderColor}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>⏳</span>
                <span style={{ fontSize: "16px", color: textSecondary, fontWeight: 500 }}>
                  72h Defense Window Active · Pay to Clear or Post a Comeback
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: cayenne }}>
                  Defend now at bountyroast.lol →
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <span
              style={{
                fontSize: "15px",
                color: textSecondary,
              }}
            >
              The internet&apos;s spiciest founder roast leaderboard. Pay to Roast. Pay to Survive.
            </span>
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: textSecondary,
              }}
            >
              bountyroast.lol
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
