/* =====================================================
   Finora — Avatar
   Shows a user photo, or falls back to their initial
   inside a colored circle.

   Props:
     size       → width/height in px (default 38)
     name       → full name (used for initial + alt text)
     photo      → image URL (optional)
     className  → extra classes for styling
     decorative → hide from screen readers (default false)
   ===================================================== */

import { useState } from 'react';

function Avatar({
  size = 38,
  name = '',
  photo = '',
  className = '',
  decorative = false,
}) {
  // If the image fails to load, swap to the initial fallback
  const [imageFailed, setImageFailed] = useState(false);

  // First grapheme (handles emoji and accented characters safely).
  // Fallback to '?' so it's clear no name was provided.
  const initial = name ? Array.from(name)[0].toUpperCase() : '?';

  const style = {
    width: size,
    height: size,
    minWidth: size,
    fontSize: size * 0.42,
  };

  // Shared a11y attributes — hidden from screen readers if decorative
  const a11yProps = decorative
    ? { 'aria-hidden': 'true' }
    : { role: 'img', 'aria-label': name || 'Profile' };

  // ---------- Photo variant ----------
  if (photo && !imageFailed) {
    return (
      <img
        src={photo}
        alt={decorative ? '' : name || 'Profile'}
        className={`avatar ${className}`}
        style={style}
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    );
  }

  // ---------- Initial fallback ----------
  return (
    <span
      className={`avatar ${className}`}
      style={style}
      title={name || undefined}
      {...a11yProps}
    >
      {initial}
    </span>
  );
}

export default Avatar;