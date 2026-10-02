/* =====================================================
   Finora — Calculations
   Pure functions that turn raw record lists into totals,
   breakdowns, budgets, and plain-language insights.

   All functions are safe against:
     • undefined / non-array inputs
     • NaN or non-numeric amounts
     • Date strings that parse as UTC

   None of them touch the network or state.
   ===================================================== */

import { currencies } from '../data/categories';
import { getAllCategories } from './categories';

/* ---------- Helpers ---------- */

// Coerce anything numeric-ish into a finite number, else 0
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// Local-safe date parser: "2026-10-01" → local midnight, not UTC
function parseLocalDate(value) {
  if (!value) return null;
  const iso = String(value).slice(0, 10);
  const d = new Date(iso + 'T00:00:00');
  return Number.isNaN(d.getTime()) ? null : d;
}

// Always work with an array, even if the caller passed undefined
function asArray(value) {
  return Array.isArray(value) ? value : [];
}

/* ---------- Totals ---------- */

export function getTotalSpent(expenses) {
  return asArray(expenses).reduce((sum, e) => sum + toNumber(e.amount), 0);
}

export function getTotalIncome(incomes) {
  return asArray(incomes).reduce((sum, i) => sum + toNumber(i.amount), 0);
}

export function getBalance(expenses, incomes) {
  return getTotalIncome(incomes) - getTotalSpent(expenses);
}

/* ---------- Category breakdown ---------- */

// All expense entries grouped by category, sorted by amount desc.
export function getSpendingByCategory(expenses) {
  const list = asArray(expenses);
  const total = getTotalSpent(list);
  if (total === 0) return [];

  const totals = {};
  list.forEach((e) => {
    const key = e.category || 'other';
    totals[key] = (totals[key] || 0) + toNumber(e.amount);
  });

  // Look up category info once instead of once per entry
  const categories = getAllCategories();
  const byId = new Map(categories.map((c) => [c.id, c]));

  return Object.entries(totals)
    .map(([id, amount]) => {
      const cat = byId.get(id);
      return {
        id,
        label: cat?.label || 'Other',
        icon: cat?.icon || 'fa-ellipsis',
        amount,
        percent: Math.round((amount / total) * 100),
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

/* ---------- Time-based slices ---------- */

// Expenses grouped into 5 calendar weeks of a given month
export function getSpendingByWeek(expenses, date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const weeks = [0, 0, 0, 0, 0];

  asArray(expenses).forEach((e) => {
    const d = parseLocalDate(e.date);
    if (!d) return;
    if (d.getFullYear() !== year || d.getMonth() !== month) return;

    const weekIndex = Math.min(Math.floor((d.getDate() - 1) / 7), 4);
    weeks[weekIndex] += toNumber(e.amount);
  });

  return weeks.map((amount, i) => ({ week: i + 1, amount }));
}

export function getExpensesForMonth(expenses, date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  return asArray(expenses).filter((e) => {
    const d = parseLocalDate(e.date);
    return d && d.getFullYear() === year && d.getMonth() === month;
  });
}

export function getExpensesForPreviousMonth(expenses, date = new Date()) {
  const prev = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return getExpensesForMonth(expenses, prev);
}

/* ---------- Insights ---------- */

// Plain-language observations derived from the user's own data
export function generateInsights(expenses) {
  const list = asArray(expenses);
  const insights = [];

  const thisMonth = getExpensesForMonth(list);
  const lastMonth = getExpensesForPreviousMonth(list);

  const categoryBreakdown = getSpendingByCategory(thisMonth);
  const lastBreakdown = getSpendingByCategory(lastMonth);

  // Top category this month
  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    insights.push(
      `${top.label} was your largest expense this month (${top.percent}% of spending).`
    );
  }

  // Change vs last month for the #2 (or #1) category
  if (categoryBreakdown.length > 0 && lastBreakdown.length > 0) {
    const focus = categoryBreakdown[1] || categoryBreakdown[0];
    const prev = lastBreakdown.find((c) => c.id === focus.id);

    if (prev && prev.amount > 0) {
      const change =
        ((focus.amount - prev.amount) / prev.amount) * 100;
      const rounded = Math.abs(Math.round(change));

      if (rounded >= 5) {
        insights.push(
          change < 0
            ? `You spent ${rounded}% less on ${focus.label} than last month.`
            : `Your ${focus.label} spending increased by ${rounded}% this month.`
        );
      }
    }
  }

  // Overall change
  const totalThis = getTotalSpent(thisMonth);
  const totalLast = getTotalSpent(lastMonth);

  if (totalLast > 0 && totalThis > 0) {
    const change = ((totalThis - totalLast) / totalLast) * 100;
    const rounded = Math.abs(Math.round(change));

    if (rounded >= 5) {
      insights.push(
        change < 0
          ? `Overall spending is down ${rounded}% compared to last month.`
          : `Overall spending is up ${rounded}% compared to last month.`
      );
    }
  }

  return insights;
}

/* ---------- Currency ---------- */

export function getCurrencySymbol(code) {
  const c = currencies.find((x) => x.code === code);
  return c ? c.symbol : '$';
}

/* ---------- Budgets ---------- */

// Whether a date string falls inside the budget's current period
export function isDateInBudgetPeriod(dateStr, budget) {
  const d = parseLocalDate(dateStr);
  if (!d) return false;

  const now = new Date();

  if (budget.period === 'weekly') {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    return d >= sevenDaysAgo && d <= now;
  }

  if (budget.period === 'monthly') {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth()
    );
  }

  // Custom: 30 days from createdAt. If createdAt is missing, treat
  // the budget as starting "long ago" so nothing is filtered out.
  // Yearly: calendar year-to-date
if (budget.period === 'yearly') {
  return d.getFullYear() === now.getFullYear();
}

// Fallback — treat unknown periods as "all time"
return true;
}

/**
 * Given a budget and all expenses, returns:
 *   { spent, percent, remaining, over, level }
 *
 * level is one of: 'ok' | 'warning' | 'danger' | 'over'
 */
export function getBudgetStatus(budget, expenses) {
  const target = budget?.amount || 0;

  const spent = asArray(expenses)
    .filter((e) => e.category === budget?.category)
    .filter((e) => isDateInBudgetPeriod(e.date, budget))
    .reduce((sum, e) => sum + toNumber(e.amount), 0);

  const percent = target > 0 ? Math.round((spent / target) * 100) : 0;
  const remaining = Math.max(target - spent, 0);
  const over = Math.max(spent - target, 0);

  let level = 'ok';
  if (percent >= 100) level = 'over';
  else if (percent >= 90) level = 'danger';
  else if (percent >= 75) level = 'warning';

  return { spent, percent, remaining, over, level };
}

/**
 * Friendly, non-judgmental budget message.
 * The currency symbol is pulled from the budget's currency code
 * (falls back to '$').
 */
export function getBudgetMessage(budget, status, currencyCode) {
  const label = budget?.categoryLabel || 'budget';
  const symbol = getCurrencySymbol(currencyCode || budget?.currency);

  if (status.percent >= 100) {
    return `You've exceeded your ${label} budget by ${symbol}${status.over.toFixed(2)}.`;
  }
  if (status.percent >= 90) {
    return `You're getting close to your ${label} budget.`;
  }
  if (status.percent >= 75) {
    return `You've used ${status.percent}% of your ${label} budget.`;
  }
  return `You have used ${status.percent}% of your ${label} budget.`;
}