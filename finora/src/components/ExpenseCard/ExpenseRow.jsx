/* =====================================================
   Finora — ExpenseRow
   One row in the expenses list. Shows the category icon,
   title (note or category label), date, amount, and
   edit/delete actions.

   Props:
     expense  → the expense object
     onEdit   → called with the expense when Edit is clicked
     onDelete → called with the expense when Delete is clicked
   ===================================================== */

import { findCategory } from '../../utils/categories';
import Money from '../Button/Money';

// Format "2026-10-01" or full ISO as "Oct 1"
function formatDate(value) {
  if (!value) return '';
  const iso = String(value).slice(0, 10); // keep YYYY-MM-DD only
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function ExpenseRow({ expense, onEdit, onDelete }) {
  const category = findCategory(expense.category);
  const label = category?.label || 'Other';
  const icon = category?.icon || 'fa-ellipsis';

  // Whitespace-only notes shouldn't win over the category label
  const cleanNote = expense.note?.trim();
  const title = cleanNote || label;

  // Expenses are stored as positive numbers; the "-" is a display convention.
  // If the amount is ever stored negative, avoid "--$x".
  const isNegative = Number(expense.amount) < 0;
  const showMinus = !isNegative;

  return (
    <li className="expense-row">
      <span className="expense-row-icon" aria-hidden="true">
        <i className={`fas ${icon}`}></i>
      </span>

      <div className="expense-row-info">
        <span className="expense-row-title">{title}</span>
        <span className="expense-row-meta">
          {label} · <time dateTime={expense.date}>{formatDate(expense.date)}</time>
        </span>
      </div>

      <span className="expense-row-amount">
        {showMinus && '-'}
        <Money amount={expense.amount} />
      </span>

      <div className="expense-row-actions">
        <button
          type="button"
          className="icon-action"
          onClick={() => onEdit(expense)}
          aria-label={`Edit ${title}`}
          title="Edit"
        >
          <i className="fas fa-pen" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          className="icon-action icon-action--danger"
          onClick={() => onDelete(expense)}
          aria-label={`Delete ${title}`}
          title="Delete"
        >
          <i className="fas fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    </li>
  );
}

export default ExpenseRow;