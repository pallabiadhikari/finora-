/* =====================================================
   Finora — Validation helpers

   Used by forms across the app:
     • Auth (login, signup, reset password)
     • Settings (profile, password change)
     • Onboarding (setup wizard)
   ===================================================== */

/* ---------- Email ---------- */

/**
 * Returns true when the string looks like a valid email.
 * Simple, permissive pattern — good enough for client-side UX.
 * The real check happens on the server (email verification).
 */
export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ---------- Password ---------- */

/**
 * Evaluates a password against Finora's rules.
 * Always returns the same six keys so callers can render a
 * consistent checklist.
 */
export function getPasswordRules(password) {
  const pw = typeof password === 'string' ? password : '';
  return {
    length: pw.length >= 8,
    noSpaces: pw === pw.trim(),
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

/** True when every rule in getPasswordRules() passes. */
export function isStrongEnoughPassword(password) {
  const rules = getPasswordRules(password);
  return Object.values(rules).every(Boolean);
}

/**
 * Human-readable error for the first failing password rule.
 * Returns '' when the password is fine.
 */
export function getPasswordErrorMessage(password) {
  const rules = getPasswordRules(password);
  if (!rules.length) return 'Password must be at least 8 characters.';
  if (!rules.upper) return 'Password must include an uppercase letter.';
  if (!rules.lower) return 'Password must include a lowercase letter.';
  if (!rules.number) return 'Password must include a number.';
  if (!rules.special) return 'Password must include a special character.';
  if (!rules.noSpaces) return 'Password must not start or end with spaces.';
  return '';
}