// 1. Converts Database Row (snake_case) -> Frontend Object (camelCase)
export function fromDbRoast(row, comments = []) {
  return {
    id: row.id,
    target: {
      handle: row.target_handle,
      displayName: row.target_name,
      avatar:
        row.target_avatar ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${row.target_handle}`,
      bio: "",
    },
    roastText: row.roast_text,
    bountyAmount: Number(row.bounty_amount),
    roaster: {
      handle: row.roaster_handle || "you",
      displayName: row.roaster_name || "You",
      avatar:
        row.roaster_avatar ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=you`,
    },
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    upvotes: row.upvotes || 0,
    spectatorContributions: row.spectator_contributions || 0,
    defenseStatus: row.defense_status || "none",
    defenseText: row.defense_text || null,
    isHot: Number(row.bounty_amount) >= 100,
    comments: (comments || []).map(fromDbComment),
  };
}

// 2. Converts Frontend Roast -> Database Row format
export function toDbRoast(roast) {
  return {
    id: roast.id,
    target_handle: roast.target.handle,
    target_name: roast.target.displayName || roast.target.handle,
    target_avatar: roast.target.avatar,
    roast_text: roast.roastText,
    bounty_amount: roast.bountyAmount,
    roaster_handle: roast.roaster?.handle || "you",
    roaster_name: roast.roaster?.displayName || "You",
    roaster_avatar: roast.roaster?.avatar,
    defense_status: roast.defenseStatus || "none",
    defense_text: roast.defenseText || null,
    upvotes: roast.upvotes || 0,
    spectator_contributions: roast.spectatorContributions || 0,
    created_at: roast.createdAt,
    expires_at: roast.expiresAt,
  };
}

// 3. Converts Database Comment -> Frontend format
export function fromDbComment(row) {
  return {
    id: row.id,
    author: {
      handle: row.author_handle,
      displayName: row.author_name,
      avatar:
        row.author_avatar ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${row.author_handle}`,
    },
    text: row.text,
    createdAt: row.created_at,
    likes: row.likes || 0,
    isTarget: Boolean(row.is_target),
  };
}

export function toDbComment(comment, roastId) {
  return {
    id: comment.id,
    roast_id: roastId, // Links this comment to its parent roast
    author_handle: comment.author?.handle || "you",
    author_name: comment.author?.displayName || "You",
    author_avatar: comment.author?.avatar || null,
    text: comment.text,
    likes: comment.likes || 0,
    is_target: Boolean(comment.isTarget),
    created_at: comment.createdAt || new Date().toISOString(),
  };
}
