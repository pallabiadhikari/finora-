/* =====================================================
   Finora — Local user profile + settings helpers

   These helpers keep per-browser, per-user state:
     • Profile (name, phone, photo, name-change counter)
       keyed by email so multiple accounts stay separate.
     • App settings (currency, theme, date format, privacy).
     • Onboarding completion flag.

   Storage layout:
     finora.settings              → global app settings
     finora.profile.<email>       → per-user profile
     finora.setupComplete         → "true" once onboarding is done

   All reads fall back to sensible defaults on corrupt or
   missing data. Writes are wrapped in try/catch so a full
   or disabled localStorage doesn't crash the app.
   ===================================================== */

import { getUserByEmail } from './auth';
import { getActiveEmail } from './activeUser';
import {
  DEFAULT_CURRENCY,
  DEFAULT_DATE_FORMAT,
  DEFAULT_THEME,
} from '../data/categories';

const SETTINGS_KEY = 'finora.settings';
const PROFILE_KEY_PREFIX = 'finora.profile.';
const SETUP_KEY = 'finora.setupComplete';

// Default settings — sourced from data/categories.js so the
// app has one source of truth for these values.
const DEFAULT_SETTINGS = {
  currency: DEFAULT_CURRENCY,
  theme: DEFAULT_THEME,
  dateFormat: DEFAULT_DATE_FORMAT,
  privateView: false,
};

const NAME_CHANGE_LIMIT = 3;

/* ---------- Email normalization ---------- */

// Accepts a string or { email } object. Returns a lowercase,
// trimmed email, or 'guest' when nothing usable is provided.
function normalizeEmail(input) {
  if (typeof input === 'string') {
    const e = input.trim().toLowerCase();
    return e || 'guest';
  }
  if (input && typeof input.email === 'string') {
    const e = input.email.trim().toLowerCase();
    return e || 'guest';
  }
  return 'guest';
}

export function getProfileKey(email) {
  return PROFILE_KEY_PREFIX + normalizeEmail(email);
}

/* ---------- Active user (re-exported for compatibility) ---------- */

// Kept so existing imports from this module keep working.
// The canonical implementation lives in activeUser.js.
export { getActiveEmail };

/* ---------- Profile ---------- */

/**
 * Read the profile for an email.
 * Merges with the local account record (name fallback).
 */
export function getUser(email) {
  const normalized = normalizeEmail(email);
  const key = PROFILE_KEY_PREFIX + normalized;

  // Read stored profile
  let profile = null;
  try {
    const raw = localStorage.getItem(key);
    if (raw) profile = JSON.parse(raw);
  } catch {
    profile = null;
  }

  // Fall back to the local account record for the name
  const account =
    normalized !== 'guest' ? getUserByEmail(normalized) : null;
  const accountName = account?.name || '';

  const base = {
    name: accountName,
    email: normalized === 'guest' ? '' : normalized,
    phone: '',
    photo: '',
    nameChanges: { month: '', count: 0 },
  };

  if (!profile || typeof profile !== 'object') return base;

  return {
    ...base,
    ...profile,
    // Prefer stored name; fall back to the account's name
    name:
      typeof profile.name === 'string' && profile.name.trim()
        ? profile.name
        : accountName,
    nameChanges: profile.nameChanges || { month: '', count: 0 },
  };
}

/**
 * Overwrite the stored profile for a user.
 * Fires `finora:profile-changed` so listeners can refresh.
 */
export function saveUser(email, user) {
  const key = getProfileKey(email);

  try {
    localStorage.setItem(key, JSON.stringify(user));
  } catch (err) {
    console.error('Could not save profile:', err);
    return;
  }

  window.dispatchEvent(new Event('finora:profile-changed'));
}

/* ---------- Name change tracking ---------- */

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}`;
}

/**
 * Returns { count, limit, remaining, month } for the current
 * calendar month. Counter resets automatically on month rollover.
 */
export function getNameChangeInfo(email) {
  const user = getUser(email);
  const month = currentMonthKey();
  const stored = user.nameChanges || { month: '', count: 0 };

  const count = stored.month === month ? stored.count : 0;
  const remaining = Math.max(NAME_CHANGE_LIMIT - count, 0);

  return { count, limit: NAME_CHANGE_LIMIT, remaining, month };
}

/**
 * Records a name change for the month, preserving other
 * profile fields (photo, phone, etc.).
 */
export function recordNameChange(email, newName) {
  const month = currentMonthKey();
  const current = getUser(email);
  const stored = current.nameChanges || { month: '', count: 0 };
  const currentCount = stored.month === month ? stored.count : 0;

  const updated = {
    ...current,
    name: newName,
    nameChanges: {
      month,
      count: currentCount + 1,
    },
  };

  saveUser(email, updated);
  return getNameChangeInfo(email);
}

/* ---------- Settings ---------- */

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const stored = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    // Merge with defaults so a partial object doesn't drop keys
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event('finora:settings-changed'));
  } catch (err) {
    console.error('Could not save settings:', err);
  }
}

/* ---------- Onboarding ---------- */

export function isSetupComplete() {
  try {
    return localStorage.getItem(SETUP_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markSetupComplete() {
  try {
    localStorage.setItem(SETUP_KEY, 'true');
  } catch (err) {
    console.error('Could not mark setup complete:', err);
  }
}

export function resetSetup() {
  try {
    localStorage.removeItem(SETUP_KEY);
  } catch {
    // ignore
  }
}