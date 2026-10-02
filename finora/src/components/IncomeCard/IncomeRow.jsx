/* =====================================================
   Finora — IncomeRow
   One row in the income list. Mirror of ExpenseRow with
   income-specific classes and a "+" prefix on the amount.

   Props:
     income   → the income object
     onEdit   → called with the income when Edit is clicked
     onDelete → called with the income when Delete is clicked
   ===================================================== */

import { incomeSources } from '../../data/categories';
import Money from '../Button/Money';

// Format "2026-10-01" or full ISO as "Oct 1"
function formatDate(value) {
  if (!value) return '';
  const iso = String(value).slice(0, 10);
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Normalize a source id before comparing so " Salary " still matches "salary"
function findSource(id) {
  if (!id) return null;
  const normalized = String(id).trim().toLowerCase();
  return incomeSources.find(
    (s) => String(s.id).trim().toLowerCase() === normalized
  );
}

function IncomeRow({ income, onEdit, onDelete }) {
  const src = findSource(income.source);
  const label = src?.label || 'Other';
  const icon = src?.icon || 'fa-ellipsis';

  // Whitespace-only notes shouldn't win over the source label
  const cleanNote = income.note?.trim();
  const title = cleanNote || label;

  // Incomes are positive amounts; only show "+" when that's true
  const isPositive = Number(income.amount) > 0;

  return (
    <li className="expense-row">
      <span className="expense-row-icon income-row-icon" aria-hidden="true">
        <i className={`fas ${icon}`}></i>
      </span>

      <div className="expense-row-info">
        <span className="expense-row-title">{title}</span>
        <span className="expense-row-meta">
          {label} · <time dateTime={income.date}>{formatDate(income.date)}</time>
        </span>
      </div>

      <span className="expense-row-amount income-row-amount">
        {isPositive && '+'}
        <Money amount={income.amount} />
      </span>

      <div className="expense-row-actions">
        <button
          type="button"
          className="icon-action"
          onClick={() => onEdit(income)}
          aria-label={`Edit ${title}`}
          title="Edit"
        >
          <i className="fas fa-pen" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          className="icon-action icon-action--danger"
          onClick={() => onDelete(income)}
          aria-label={`Delete ${title}`}
          title="Delete"
        >
          <i className="fas fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    </li>
  );
}

export default IncomeRow;