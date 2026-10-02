/* =====================================================
   Finora — Category helpers

   Combines the built-in expense categories with the user's
   custom categories. Custom categories are stored per-user
   so each account keeps its own set.

   Built-in categories come from data/categories.js and are
   always available. Custom categories are loaded from
   localStorage on every call so changes stay in sync.
   ===================================================== */

import { expenseCategories } from '../data/categories';
import { getActiveEmail } from './activeUser';

/* ---------- Current user ---------- */

function storageKey() {
  return `finora.customCategories.${getActiveEmail()}`;
}

/* ---------- Custom categories (raw) ---------- */

export function getCustomCategories() {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomCategories(list) {
  if (!Array.isArray(list)) return;

  try {
    localStorage.setItem(storageKey(), JSON.stringify(list));
  } catch (err) {
    console.error('Could not save custom categories:', err);
  }
}

export function addCustomCategory(category) {
  if (!category || typeof category.id !== 'string') {
    return getCustomCategories();
  }

  const existing = getCustomCategories();

  // Prevent collisions with built-ins and existing custom ids
  if (findCategory(category.id)) {
    console.warn(`Category id "${category.id}" already exists.`);
    return existing;
  }

  const next = [...existing, category];
  saveCustomCategories(next);
  window.dispatchEvent(new Event('finora:categories-changed'));
  return next;
}

export function deleteCustomCategory(id) {
  const next = getCustomCategories().filter((c) => c.id !== id);
  saveCustomCategories(next);
  window.dispatchEvent(new Event('finora:categories-changed'));
  return next;
}

/* ---------- Merged view ---------- */

// Merged list of built-in + custom categories.
export function getAllCategories() {
  return [...expenseCategories, ...getCustomCategories()];
}

// Look up a category by id, searching built-ins first.
export function findCategory(id) {
  if (!id) return null;

  const builtIn = expenseCategories.find((c) => c.id === id);
  if (builtIn) return builtIn;

  return getCustomCategories().find((c) => c.id === id) || null;
}