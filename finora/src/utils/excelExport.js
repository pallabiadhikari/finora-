/* =====================================================
   Finora — Excel export
   Builds a 4-sheet workbook from the user's records:
     1. Expenses
     2. Income
     3. Monthly Summary
     4. Weekly Summary

   Then triggers a download named "finora-export-YYYY-MM-DD.xlsx"
   using the user's local date (not UTC).
   ===================================================== */

import * as XLSX from 'xlsx';

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

// Format a Date as "YYYY-MM-DD" using its LOCAL components
// (avoids the UTC shift that .toISOString() would cause).
function formatLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// The Monday of the week containing the given date, as YYYY-MM-DD
function weekStartKey(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return null;

  const day = d.getDay(); // 0 = Sun, 1 = Mon
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return formatLocalISO(d);
}

/* ---------- Main export ---------- */

export function exportAllToExcel(data) {
  const { expenses = [], incomes = [] } = data || {};

  /* ---------- Sheet 1: Expenses ---------- */
  const expenseRows = expenses.map((e) => ({
    Date: e.date || '',
    Title: e.note || '',
    Category: e.category || '',
    'Payment Method': e.paymentMethod || '',
    Amount: toNumber(e.amount),
  }));

  /* ---------- Sheet 2: Income ---------- */
  const incomeRows = incomes.map((i) => ({
    Date: i.date || '',
    Source: i.source || '',
    Note: i.note || '',
    Amount: toNumber(i.amount),
  }));

  /* ---------- Sheet 3: Monthly Summary ---------- */
  const monthlyMap = {};

  function ensureMonth(month) {
    if (!monthlyMap[month]) {
      monthlyMap[month] = { income: 0, expenses: 0 };
    }
    return monthlyMap[month];
  }

  expenses.forEach((e) => {
    const month = String(e.date || '').slice(0, 7);
    if (!month) return;
    ensureMonth(month).expenses += toNumber(e.amount);
  });

  incomes.forEach((i) => {
    const month = String(i.date || '').slice(0, 7);
    if (!month) return;
    ensureMonth(month).income += toNumber(i.amount);
  });

  const monthlyRows = Object.keys(monthlyMap)
    .sort()
    .map((month) => {
      const { income, expenses: spent } = monthlyMap[month];
      return {
        Month: month,
        Income: income,
        Expenses: spent,
        Balance: income - spent,
      };
    });

  /* ---------- Sheet 4: Weekly Summary ---------- */
  const weeklyMap = {};

  function ensureWeek(week) {
    if (!weeklyMap[week]) {
      weeklyMap[week] = { income: 0, expenses: 0 };
    }
    return weeklyMap[week];
  }

  expenses.forEach((e) => {
    const k = weekStartKey(e.date);
    if (!k) return;
    ensureWeek(k).expenses += toNumber(e.amount);
  });

  incomes.forEach((i) => {
    const k = weekStartKey(i.date);
    if (!k) return;
    ensureWeek(k).income += toNumber(i.amount);
  });

  const weeklyRows = Object.keys(weeklyMap)
    .sort()
    .map((week) => {
      const { income, expenses: spent } = weeklyMap[week];
      return {
        'Week starting': week,
        Income: income,
        Expenses: spent,
        Balance: income - spent,
      };
    });

  /* ---------- Build workbook ---------- */
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(expenseRows),
    'Expenses'
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(incomeRows),
    'Income'
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(monthlyRows),
    'Monthly Summary'
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(weeklyRows),
    'Weekly Summary'
  );

  /* ---------- Download ---------- */
  const filename = `finora-export-${formatLocalISO(new Date())}.xlsx`;
  XLSX.writeFile(wb, filename);
}