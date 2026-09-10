// 1. Converts Database Row (snake_case) -> Frontend Object (camelCase)
export function fromDbRoast(row, comments = []) {
  const targetHandle = row.target_handle || "target";
  const roasterHandle = row.roaster_handle || "you";
  return {
    id: row.id,
    target: {
      handle: targetHandle,
      displayName: row.target_name || targetHandle,
      avatar:
        row.target_avatar ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${targetHandle}`,
      bio: "",
    },
    roastText: row.roast_text,
    bountyAmount: Number(row.bounty_amount),
    roaster: {
      handle: roasterHandle,
      displayName: row.roaster_name || "You",
      avatar:
        row.roaster_avatar ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${roasterHandle}`,
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
  const targetHandle = roast.target?.handle || "target";
  const roasterHandle = roast.roaster?.handle || "you";
  return {
    id: roast.id,
    target_handle: targetHandle,
    target_name: roast.target?.displayName || targetHandle,
    target_avatar: roast.target?.avatar || null,
    roast_text: roast.roastText,
    bounty_amount: roast.bountyAmount,
    roaster_handle: roasterHandle,
    roaster_name: roast.roaster?.displayName || "You",
    roaster_avatar: roast.roaster?.avatar || null,
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
  const handle = row.author_handle || "spectator";
  return {
    id: row.id,
    author: {
      handle: handle,
      displayName: row.author_name || handle,
      avatar:
        row.author_avatar ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${handle}`,
    },
    text: row.text || "",
    createdAt: row.created_at || new Date().toISOString(),
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
