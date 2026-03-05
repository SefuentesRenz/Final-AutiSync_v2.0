// Badge Icon Resolution Utility
// Resolves badge icons from icon_url, handling broken/placeholder URLs gracefully.
// Falls back to a title-based emoji map when icon_url is a non-emoji URL.
// Supports real CDN image URLs (e.g., cdnjs.cloudflare.com/twemoji).

import React from 'react';

// Known working CDN domains — URLs from these are treated as real images
const TRUSTED_CDN_DOMAINS = [
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'twemoji.maxcdn.com',
  'raw.githubusercontent.com',
  'i.imgur.com',
];

function isTrustedUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    return TRUSTED_CDN_DOMAINS.some(domain => hostname.includes(domain));
  } catch {
    return false;
  }
}

const TITLE_EMOJI_MAP = {
  // Academic - Identification
  'Skill Spotter': '🔍',
  'Recognition Rookie': '🧩',
  'Recognition Pro': '🎯',

  // Academic - Numbers
  'Number Ninja': '🔢',
  'Number Strategist': '⚔️',
  'Number Sensei': '👑',

  // Academic - Colors
  'Color Spotter': '🌈',
  'Color Explorer': '🖌️',
  'Color Master': '🎨',

  // Academic - Puzzles
  'Puzzle Starter': '🧠',
  'Puzzle Thinker': '🔓',
  'Puzzle Mastermind': '🏆',

  // Academic - Matching
  'Match Maker': '🔗',
  'Match Finder': '🔗',
  'Logic Matcher': '🧠',
  'Perfect Matcher': '🎯',

  // Academic - Visual Memory
  'Memory Observer': '👀',
  'Memory Builder': '🧠',
  'Memory Champion': '🏅',

  // Cashier Game
  'Cash Register Starter': '🛒',
  'Counter Helper': '💵',
  'Checkout Champion': '🧾',
  'Cash Handling Master': '💰',
  'Trusted Cashier': '🏪',

  // Money Value
  'Money Explorer': '💵',
  'Value Identifier': '🧮',
  'Money Smart Star': '👑',

  // Social Greetings
  'First Greeting': '👋',
  'Friendly Speaker': '😊',
  'Social Confidence Star': '🌟',

  // Hygiene
  'Hygiene Starter': '🧼',
  'Clean Habit Builder': '�',
  'Hygiene Hero': '🦸',

  // Household Chores
  'Chore Starter': '🧹',
  'Helpful Hands': '🧺',
  'Household Helper Hero': '🏆',

  // Street Crossing / Safety
  'Safety Learner': '🚶',
  'Street Smart': '🚦',
  'Safety Champion': '🏆',
  'Brave Crosser': '🚸',
  'First Step Crosser': '🚦',
  'Street Smart Explorer': '🛣️',

  // Emotions
  'Emotion Spotter': '🙂',
  'Emotion Explorer': '🧭',
  'Emotion Navigator': '🌈',
  'Emotion Analyst': '🧠',
  'Emotional Insight Seeker': '🌊',
  'Emotion Master': '👑',
  'Emotion Specialist': '🌟',

  // Routines / Streaks
  'Routine Starter': '🌱',
  'Routine Builder': '🔁',
  'Consistency Champ': '📅',
  'Habit Hero': '🏅',
  'Consistency Legend': '💪',
  'Routine Master': '👑',
  'Dedication Star': '🔥',

  // Chore-specific
  'Dishwashing Pro': '🍽️',
  'Floor Care Expert': '🧹',
  'Table Setting Star': '🍴',
  'Bed Making Master': '🛏️',
  'Plant Care Hero': '🌱',
  'Sweep Master': '🧹',

  // General / Legacy
  'Academic Star': '📖',
  'First Step': '⭐',
  'Perfect Scorer': '💯',
  'High Achiever': '🏅',
  'Daily Life Hero': '🏠',
  'All-Rounder': '🌟',
  'Variety Champion': '🎯',
};

/**
 * Resolve the display icon for a badge.
 * - If icon_url is a trusted CDN URL, return the URL (to be rendered as <img>).
 * - If icon_url is an emoji (not a URL), use it directly.
 * - If icon_url is a broken placeholder URL, use title-based emoji fallback.
 * - Falls back to 🏆 if nothing else matches.
 */
export function resolveBadgeIcon(badge) {
  const iconUrl = badge?.icon_url;

  // If icon_url is a trusted CDN URL, return it as-is for <img> rendering
  if (iconUrl && iconUrl.startsWith('http') && isTrustedUrl(iconUrl)) {
    return iconUrl;
  }

  // If icon_url exists and is NOT a URL, it's an emoji — use it directly
  if (iconUrl && !iconUrl.startsWith('http')) {
    return iconUrl;
  }

  // icon_url is missing or is a broken URL — try title-based lookup
  const title = badge?.title || '';

  // First try exact match in the map
  if (TITLE_EMOJI_MAP[title]) {
    return TITLE_EMOJI_MAP[title];
  }

  // Some titles have emojis embedded (e.g., "🚸 Brave Crosser") — extract the leading emoji
  const leadingEmoji = title.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
  if (leadingEmoji) {
    return leadingEmoji[0];
  }

  // Try partial title match as last resort
  const cleanTitle = title.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]\s*/u, '').trim();
  if (TITLE_EMOJI_MAP[cleanTitle]) {
    return TITLE_EMOJI_MAP[cleanTitle];
  }

  // Default fallback
  return '🏆';
}

/**
 * Check if a resolved icon is a URL (needs <img> rendering).
 */
export function isIconUrl(icon) {
  return typeof icon === 'string' && icon.startsWith('http');
}

/**
 * React component that renders a badge icon.
 * Automatically handles both emoji strings and image URLs.
 */
export function BadgeIcon({ icon, alt = 'badge', className = '' }) {
  if (isIconUrl(icon)) {
    return React.createElement('img', {
      src: icon,
      alt,
      className: `inline-block w-8 h-8 object-contain ${className}`.trim(),
    });
  }
  return React.createElement('span', null, icon);
}

export default resolveBadgeIcon;
