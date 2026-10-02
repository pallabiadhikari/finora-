/* =====================================================
   Finora — Notification helpers

   Thin wrappers around the notification API. Mutations
   refetch the list so callers always get the fresh state.
   Errors propagate to the caller — pages already handle them.

   Also exports no-op stubs for legacy helpers so imports
   don't break during the migration to server-side notifications.
   ===================================================== */

import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearNotifications,
} from './api';

/* ---------- Internal ---------- */

// Notify the rest of the app that notification state changed
// (TopBar listens for this to refresh the unread count).
function emitChange() {
  try {
    window.dispatchEvent(new Event('finora:notifications-changed'));
  } catch {
    // Non-browser env — ignore
  }
}

// Guard against missing ids — bad ids hit /api/notifications/undefined/...
function requireId(id, action) {
  if (!id) {
    throw new Error(`Cannot ${action}: missing notification id`);
  }
}

/* ---------- Read ---------- */

// List all notifications for the current user.
// Throws on API failure — callers should try/catch.
export async function getNotifications() {
  const res = await listNotifications();
  return res?.notifications || [];
}

/* ---------- Write ---------- */

// Mark a single notification as read, return the fresh list.
export async function markRead(id) {
  requireId(id, 'mark read');
  await markNotificationRead(id);
  const next = await getNotifications();
  emitChange();
  return next;
}

// Mark every notification as read, return the fresh list.
export async function markAllRead() {
  await markAllNotificationsRead();
  const next = await getNotifications();
  emitChange();
  return next;
}

// Delete a single notification, return the fresh list.
export async function removeNotification(id) {
  requireId(id, 'delete');
  await deleteNotification(id);
  const next = await getNotifications();
  emitChange();
  return next;
}

// Delete every notification. Short-circuits to [] since we
// know the list is empty after the API call succeeds.
export async function clearAll() {
  await clearNotifications();
  emitChange();
  return [];
}

/* ---------- Legacy stubs ----------
   These used to do work when notifications were local-only.
   They're kept as no-ops so existing imports don't break while
   the app migrates to server-side notifications.
   TODO: remove once App.jsx stops importing the ensure* helpers.
------------------------------------------------------------------ */

export function pushNotification() {}
export function ensureWelcomeNotification() {}
export function ensureDailyReminder() {}
export function ensureBudgetAlerts() {}