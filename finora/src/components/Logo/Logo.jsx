/* =====================================================
   Finora — Brand logo
   A self-contained SVG mark (rounded square + stylized F
   + rising accent line + gold dot).

   Props:
     size            → width/height in px (default 40)
     withBackground  → show the rounded gradient square (default true)
     variant         → 'default' (deep teal) | 'light' (brighter teal)
     decorative      → hide from screen readers (default false)
     title           → accessible label (default 'Finora')
     className       → extra classes on the <svg> for styling
   ===================================================== */

function Logo({
  size = 40,
  withBackground = true,
  variant = 'default',
  decorative = false,
  title = 'Finora',
  className = '',
}) {
  // Brand colors are intentionally fixed — the logo shouldn't
  // shift with the light/dark theme, unlike the rest of the UI.
  const bgStart = variant === 'light' ? '#3FA391' : '#1F6E60';
  const bgEnd = variant === 'light' ? '#2A8E7C' : '#185749';
  const stroke = '#FFFFFF';
  const dotColor = '#D9A961';

  // Unique gradient id so multiple logos on one page don't clash
  const gradientId = `finora-bg-${variant}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? 'true' : undefined}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={bgStart} />
          <stop offset="1" stopColor={bgEnd} />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      {withBackground && (
        <rect
          x="0"
          y="0"
          width="64"
          height="64"
          rx="16"
          fill={`url(#${gradientId})`}
        />
      )}

      {/* The F — vertical stroke */}
      <rect x="18" y="18" width="5" height="28" rx="2.5" fill={stroke} />

      {/* The F — top arm */}
      <path d="M23 20 L42 20 L42 25 L23 25 Z" fill={stroke} />

      {/* The F — middle arm (shorter, hints at a rising chart) */}
      <rect x="23" y="30" width="12" height="5" rx="2" fill={stroke} />

      {/* Rising accent line — from middle to top-right corner */}
      <path
        d="M28 38 L44 22"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Gold dot at the peak */}
      <circle cx="45" cy="21" r="3.5" fill={dotColor} />
    </svg>
  );
}

export default Logo;