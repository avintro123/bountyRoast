"use client";

import { useState } from "react";
import { useRoasts } from "@/context/RoastContext";
import SpectatorBadge from "@/components/SpectatorBadge";

function getTimeAgo(dateStr) {
  if (!dateStr) return "just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

const QUICK_EMOJIS = ["💀", "😭", "🔥", "🍿", "🎯", "🧢"];

export default function RoastComments({ roast, isInline = false }) {
  const { addComment, likeComment } = useRoasts();
  const [commentText, setCommentText] = useState("");
  const [userHandle, setUserHandle] = useState("you");
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [likedMap, setLikedMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const comments = roast?.comments || [];

  const handlePostComment = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!commentText.trim()) return;

    const isTarget =
      userHandle.toLowerCase().replace(/^@/, "").trim() ===
      (roast?.target?.handle || "").toLowerCase();

    addComment(roast.id, {
      handle: userHandle.trim() || "spectator",
      displayName: userHandle.trim() || "Spectator",
      text: commentText.trim(),
      isTarget,
    });

    setCommentText("");
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter submits
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handlePostComment(e);
    }
  };

  const handleInsertEmoji = (emoji, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCommentText((prev) => (prev ? `${prev} ${emoji}` : emoji));
  };

  const handleLike = (commentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (likedMap[commentId]) return; // already liked in this session

    likeComment(roast.id, commentId);
    setLikedMap((prev) => ({ ...prev, [commentId]: true }));
  };

  const handleCopyQuote = (comment, e) => {
    e.preventDefault();
    e.stopPropagation();
    const targetHandle = roast?.target?.handle || "target";
    const authorHandle = comment?.author?.handle || "spectator";
    const quote = `"${comment.text}" — @${authorHandle} on @${targetHandle}'s roast (bountyroast.lol)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(quote).then(() => {
        setCopiedId(comment.id);
        setTimeout(() => setCopiedId(null), 1500);
      });
    }
  };

  return (
    <div
      className={`roast-comments-container ${isInline ? "roast-comments-inline" : "roast-comments-standalone"}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="roast-comments-header">
        <div className="roast-comments-title">
          <span>💬</span>
          <span>Comments & Banter</span>
          <span className="roast-comments-count-pill">
            {comments.length}
          </span>
          {roast?.id && <SpectatorBadge roastId={roast.id} compact />}
        </div>
        <span className="roast-comments-subtitle">
          Replying to <strong className="reply-target-tag">@{roast?.target?.handle || "target"}</strong>
        </span>
      </div>

      {/* Reply Composer */}
      <form onSubmit={handlePostComment} className="roast-composer">
        <div className="roast-composer-avatar">
          <img
            src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${userHandle || "you"}`}
            alt={userHandle}
          />
        </div>

        <div className="roast-composer-main">
          {/* Handle Identity Row */}
          <div className="roast-composer-identity">
            <span className="composer-as-label">Replying as</span>
            {isEditingHandle ? (
              <div className="composer-handle-input-wrap">
                <span className="composer-at">@</span>
                <input
                  type="text"
                  className="composer-handle-field"
                  value={userHandle}
                  onChange={(e) => setUserHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  onBlur={() => setIsEditingHandle(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingHandle(false)}
                  autoFocus
                  maxLength={20}
                />
                <button
                  type="button"
                  className="composer-handle-done"
                  onClick={() => setIsEditingHandle(false)}
                >
                  Done
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="composer-handle-tag"
                onClick={() => setIsEditingHandle(true)}
                title="Click to customize your handle"
              >
                @{userHandle}
                <span className="composer-handle-edit-icon">✏️</span>
              </button>
            )}
          </div>

          {/* Comment Input */}
          <textarea
            className="roast-composer-input"
            placeholder={`Drop your take on @${roast.target.handle}'s roast...`}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />

          {/* Quick Reaction Chips & Submit Bar */}
          <div className="roast-composer-footer">
            <div className="roast-emoji-chips">
              <span className="roast-emoji-hint">Quick:</span>
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="roast-emoji-chip"
                  onClick={(e) => handleInsertEmoji(emoji, e)}
                  title={`Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="roast-composer-submit-group">
              <span className="roast-composer-key-hint">Ctrl+Enter</span>
              <button
                type="submit"
                className="btn btn-cayenne btn-sm btn-reply-post"
                disabled={!commentText.trim()}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comment Thread List */}
      <div className="roast-comments-list">
        {comments.length === 0 ? (
          <div className="roast-comments-empty">
            <span className="empty-icon">🦗</span>
            <p>No comments yet. Be the first spectator to drop a reaction or take!</p>
          </div>
        ) : (
          comments.map((comment, index) => {
            const isLiked = Boolean(likedMap[comment.id]);
            const commentHandle = (comment?.author?.handle || "").toLowerCase();
            const targetHandle = (roast?.target?.handle || "").toLowerCase();
            const roasterHandle = (roast?.roaster?.handle || "").toLowerCase();

            const isTargetAuthor =
              Boolean(comment.isTarget) ||
              (Boolean(commentHandle) && Boolean(targetHandle) && commentHandle === targetHandle);
            const isRoasterAuthor =
              Boolean(commentHandle) && Boolean(roasterHandle) && commentHandle === roasterHandle;

            const authorName =
              comment?.author?.displayName || comment?.author?.handle || "Spectator";
            const authorHandleDisplay = comment?.author?.handle || "spectator";
            const authorAvatar =
              comment?.author?.avatar ||
              `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${authorHandleDisplay}`;

            return (
              <div key={comment.id || index} className="roast-comment-item">
                {/* Vertical thread connecting line */}
                {index < comments.length - 1 && <div className="roast-thread-line" />}

                {/* Commenter Avatar */}
                <div className="roast-comment-avatar">
                  <img
                    src={authorAvatar}
                    alt={authorName}
                  />
                </div>

                {/* Comment Body */}
                <div className="roast-comment-body">
                  <div className="roast-comment-meta">
                    <span className="roast-comment-name">
                      {authorName}
                    </span>
                    <span className="roast-comment-handle">
                      @{authorHandleDisplay}
                    </span>

                    {/* Role Badges */}
                    {isTargetAuthor && (
                      <span className="roast-comment-badge badge-target">
                        🎯 Target Founder
                      </span>
                    )}
                    {isRoasterAuthor && (
                      <span className="roast-comment-badge badge-roaster">
                        🔥 Roaster
                      </span>
                    )}

                    <span className="roast-comment-dot">·</span>
                    <span className="roast-comment-time">
                      {getTimeAgo(comment.createdAt)}
                    </span>
                  </div>

                  <div className="roast-comment-text">
                    {comment.text}
                  </div>

                  {/* Comment Actions (Like & Quote) */}
                  <div className="roast-comment-actions">
                    <button
                      type="button"
                      className={`roast-like-btn ${isLiked ? "liked" : ""}`}
                      onClick={(e) => handleLike(comment.id, e)}
                      title={isLiked ? "Liked!" : "Like this comment"}
                    >
                      <span className="like-icon">{isLiked ? "❤️" : "🤍"}</span>
                      <span className="like-count">{comment.likes || 0}</span>
                    </button>

                    <button
                      type="button"
                      className="roast-quote-btn"
                      onClick={(e) => handleCopyQuote(comment, e)}
                      title="Copy comment quote"
                    >
                      {copiedId === comment.id ? "✓ Copied quote" : "Quote 𝕏"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
