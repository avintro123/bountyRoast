"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRoasts } from "@/context/RoastContext";
import { shareDroppedRoast } from "@/lib/share";
import BountySlider from "@/components/BountySlider";
import PopupModal from "@/components/PopupModal";

const CHAR_LIMIT = 140;

export default function DropRoastPage() {
  const router = useRouter();
  const { addRoast } = useRoasts();
  const [step, setStep] = useState(1);
  const [handle, setHandle] = useState("");
  const [roastText, setRoastText] = useState("");
  const [bountyAmount, setBountyAmount] = useState(5);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedRoast, setSubmittedRoast] = useState(null);

  const charCount = roastText.length;
  const isValid =
    handle.trim().length > 0 &&
    roastText.trim().length > 0 &&
    roastText.length <= CHAR_LIMIT;

  const handleSubmit = () => {
    setShowPreview(false);
    const newRoast = addRoast({
      handle: handle.replace(/^@/, "").trim(),
      roastText: roastText.trim(),
      bountyAmount,
    });
    setSubmittedRoast(newRoast);
    setShowSuccess(true);
  };

  if (showSuccess) {
    const cleanHandle = handle.replace(/^@/, "").trim();
    return (
      <div
        className="container"
        style={{ maxWidth: "600px", padding: "60px 20px" }}
      >
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "48px 32px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ fontSize: "44px", marginBottom: "16px" }}>🔥</div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Your Roast is Live
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              lineHeight: 1.6,
              maxWidth: "440px",
              margin: "0 auto 24px",
            }}
          >
            @{cleanHandle} has been placed on The Grill with a ${bountyAmount}{" "}
            bounty.
          </p>

          {/* X Notification Preview */}
          <div
            style={{
              textAlign: "left",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "8px",
              }}
            >
              <span>𝕏 BountyRoast Bot</span>
              <span
                style={{
                  color: "var(--text-muted)",
                  fontWeight: 400,
                  fontSize: "12px",
                }}
              >
                @bountyroast_bot · just now
              </span>
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              🚨 <strong>@{cleanHandle}</strong>, someone just dropped a{" "}
              <strong>${bountyAmount}</strong> bounty on your head on
              BountyRoast.lol:
              <br />
              <br />
              &ldquo;{roastText}&rdquo;
              <br />
              <br />
              Defend yourself →{" "}
              <span style={{ color: "var(--accent-coral)" }}>
                bountyroast.lol/defend/{submittedRoast?.id || "new"}
              </span>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/" className="btn btn-coral">
              View on The Grill
            </Link>
            <button
              className="btn btn-outline"
              onClick={() =>
                shareDroppedRoast({
                  id: submittedRoast?.id,
                  targetHandle: cleanHandle,
                  bountyAmount,
                  roastText,
                })
              }
            >
              Share on 𝕏
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setStep(1);
                setHandle("");
                setRoastText("");
                setBountyAmount(5);
                setShowSuccess(false);
                setSubmittedRoast(null);
              }}
            >
              Drop Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ maxWidth: "640px", padding: "40px 20px 80px" }}
    >
      {/* Back Link */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-muted)",
          }}
        >
          ← Back to The Grill
        </Link>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          Drop a Roast
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "14px",
            maxWidth: "460px",
            margin: "0 auto",
          }}
        >
          Place a bounty on any founder or project. Write a sharp take and rank
          them on the public Grill leaderboard.
        </p>
      </div>

      {/* Step Indicators */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "32px",
        }}
      >
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              maxWidth: "80px",
              height: "4px",
              borderRadius: "var(--radius-full)",
              background:
                s <= step ? "var(--accent-coral)" : "var(--border-subtle)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {/* Form Container */}
      <div>
        {/* Step 1: Target */}
        {step >= 1 && (
          <div
            className="card"
            style={{
              marginBottom: "20px",
              border:
                step === 1
                  ? "1px solid var(--accent-coral)"
                  : "1px solid var(--border-subtle)",
            }}
          >
            <div
              className="form-group"
              style={{ marginBottom: step === 1 && handle ? "16px" : "0" }}
            >
              <label
                className="form-label"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>Step 1: Pick Your Target</span>
                {step > 1 && (
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent-coral)",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                )}
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  @
                </span>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "32px" }}
                  placeholder="founder_handle"
                  value={handle}
                  onChange={(e) =>
                    setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                  }
                  disabled={step > 1}
                />
              </div>

              {handle && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "12px",
                    padding: "10px 14px",
                    background: "var(--bg-subtle)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <img
                    src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${handle}`}
                    alt="avatar"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  />
                  <div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      @{handle}
                    </span>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Target identified
                    </p>
                  </div>
                </div>
              )}
            </div>

            {step === 1 && handle.trim() && (
              <button
                className="btn btn-coral"
                onClick={() => setStep(2)}
                style={{ width: "100%", marginTop: "12px" }}
              >
                Continue to Roast →
              </button>
            )}
          </div>
        )}

        {/* Step 2: Roast Text */}
        {step >= 2 && (
          <div
            className="card"
            style={{
              marginBottom: "20px",
              border:
                step === 2
                  ? "1px solid var(--accent-coral)"
                  : "1px solid var(--border-subtle)",
            }}
          >
            <div
              className="form-group"
              style={{ marginBottom: step === 2 && roastText ? "16px" : "0" }}
            >
              <label
                className="form-label"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>Step 2: Write Your Roast</span>
                {step > 2 && (
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent-coral)",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                )}
              </label>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginBottom: "8px",
                }}
              >
                Short, witty, and accurate. Maximum 140 characters.
              </p>
              <textarea
                className="form-textarea"
                placeholder="Another ChatGPT wrapper that will be obsolete by next Tuesday..."
                value={roastText}
                onChange={(e) => setRoastText(e.target.value)}
                maxLength={CHAR_LIMIT}
                rows={3}
                disabled={step > 2}
              />
              <div
                style={{
                  textAlign: "right",
                  fontSize: "11px",
                  color:
                    charCount > 120
                      ? "var(--accent-coral)"
                      : "var(--text-muted)",
                  marginTop: "4px",
                  fontWeight: 600,
                }}
              >
                {charCount}/{CHAR_LIMIT}
              </div>
            </div>

            {step === 2 && roastText.trim().length > 0 && (
              <button
                className="btn btn-coral"
                onClick={() => setStep(3)}
                style={{ width: "100%", marginTop: "12px" }}
              >
                Continue to Bounty →
              </button>
            )}
          </div>
        )}

        {/* Step 3: Bounty Amount */}
        {step >= 3 && (
          <div
            className="card"
            style={{
              marginBottom: "20px",
              border: "1px solid var(--accent-coral)",
            }}
          >
            <div className="form-group">
              <label className="form-label">Step 3: Set Your Bounty</label>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginBottom: "12px",
                }}
              >
                Higher bounties rank higher on the public Grill leaderboard.
                Minimum $5.
              </p>
              <BountySlider value={bountyAmount} onChange={setBountyAmount} />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowPreview(true)}
                disabled={!isValid}
              >
                Preview
              </button>
              <button
                className="btn btn-coral btn-lg"
                onClick={handleSubmit}
                disabled={!isValid}
                style={{ flex: 1 }}
              >
                Deploy Roast · ${bountyAmount}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <PopupModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Preview Roast Card"
      >
        <div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "14px",
            }}
          >
            This is how your roast will appear on The Grill:
          </p>
          <div
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <img
                src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${handle}`}
                alt="avatar"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  @{handle || "target"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Just dropped
                </div>
              </div>
            </div>

            <blockquote
              style={{
                fontSize: "14px",
                lineHeight: 1.5,
                color: "var(--text-primary)",
                borderLeft: "2px solid var(--accent-coral)",
                paddingLeft: "10px",
                fontStyle: "italic",
                marginBottom: "12px",
              }}
            >
              &ldquo;{roastText}&rdquo;
            </blockquote>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "baseline",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Bounty
              </span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "var(--accent-coral)",
                }}
              >
                ${bountyAmount}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn btn-outline"
              onClick={() => setShowPreview(false)}
            >
              Edit
            </button>
            <button
              className="btn btn-coral"
              style={{ flex: 1 }}
              onClick={handleSubmit}
            >
              Confirm & Deploy (${bountyAmount})
            </button>
          </div>
        </div>
      </PopupModal>
    </div>
  );
}
