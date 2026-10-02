/* =====================================================
   Finora — Active user
   Tracks which account is currently signed in, per browser.
   Used by per-user storage (profiles, custom categories)
   so multiple accounts on the same device stay separate.

   This is a convenience cache, not a security boundary —
   the token in api.js is what actually authenticates API calls.
   ===================================================== */

const KEY = 'finora.activeEmail';

export function setActiveEmail(email) {
  if (!email) return;
  try {
    localStorage.setItem(KEY, String(email).trim().toLowerCase());
  } catch {
    // Ignore storage errors — nothing critical depends on this
  }
}

export function getActiveEmail() {
  try {
    return localStorage.getItem(KEY) || 'guest';
  } catch {
    return 'guest';
  }
}

export function clearActiveEmail() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}