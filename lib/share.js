/**
 * Twitter / X Share Intent Utilities for BountyRoast.lol
 */

const BASE_SITE_URL =
  typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "https://bountyroast.lol";

/**
 * Open Twitter/X intent in a centered popup window
 */
export function openTwitterShare(tweetText, shareUrl = BASE_SITE_URL) {
  const encodedText = encodeURIComponent(tweetText);
  const encodedUrl = encodeURIComponent(shareUrl);
  const intentUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;

  if (typeof window !== "undefined") {
    const width = 600;
    const height = 480;
    const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
    const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);

    window.open(
      intentUrl,
      "share_tweet",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  }
}

/**
 * Share a specific roast from the detail page or card
 */
export function shareRoast({ id, targetHandle, bountyAmount, roastText }) {
  const url = `${BASE_SITE_URL}/roast/${id}`;
  const text = `🚨 @${targetHandle} is currently on The Grill on BountyRoast.lol with a $${bountyAmount} bounty!\n\n"${roastText}"\n\nDefend yourself or watch it burn:`;
  openTwitterShare(text, url);
}

/**
 * Share after dropping a brand new roast
 */
export function shareDroppedRoast({ id, targetHandle, bountyAmount, roastText }) {
  const url = `${BASE_SITE_URL}/roast/${id || ""}`;
  const text = `🎯 I just put @${targetHandle} on The Grill on BountyRoast.lol with a $${bountyAmount} bounty!\n\n"${roastText}"\n\nPay to out-roast or stay grilled:`;
  openTwitterShare(text, url);
}

/**
 * Share defense actions (cleared, comeback, redirect, immune)
 */
export function shareDefense({ type, targetHandle, cost, retargetHandle, id }) {
  const url = `${BASE_SITE_URL}/roast/${id}`;
  let text = "";

  switch (type) {
    case "clear":
      text = `🛡️ I just paid $${cost} to clear my name on @bountyroast_lol! The Grill couldn't handle the heat. 🔥`;
      break;
    case "comeback":
      text = `🎤 I just clapped back on @bountyroast_lol! Read my defense on The Grill:`;
      break;
    case "redirect":
      text = `🔄 I just redirected the @bountyroast_lol flame to @${retargetHandle}! Good luck, you're on The Grill now 🔥`;
      break;
    case "immune":
      text = `⚡ Just unlocked permanent immunity on @bountyroast_lol. Can't roast perfection. 🛡️`;
      break;
    default:
      text = `🛡️ I just defended myself on @bountyroast_lol!`;
  }

  openTwitterShare(text, url);
}
