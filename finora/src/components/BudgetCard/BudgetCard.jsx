/* =====================================================
   Finora — BudgetCard
   Displays a single budget with:
     • Category icon + label
     • Period pill (Weekly / Monthly / Custom)
     • Budget / Spent / Remaining amounts
     • Progress bar (clamped 0–100%)
     • Status message (safe / warning / danger / over)
     • Edit + Delete actions

   Props:
     budget   → the budget object
     status   → { spent, remaining, percent, level } computed by parent
     message  → human-readable status line
     onEdit   → called with the budget when Edit is clicked
     onDelete → called with the budget when Delete is clicked
   ===================================================== */

import { findCategory } from '../../utils/categories';
import Money from '../Button/Money';

// Human-readable period names
const PERIOD_LABELS = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
};

// Safe default in case status is missing (defensive)
const FALLBACK_STATUS = {
  spent: 0,
  remaining: 0,
  percent: 0,
  level: 'safe',
};

function BudgetCard({
  budget,
  status = FALLBACK_STATUS,
  message,
  onEdit,
  onDelete,
}) {
  const cat = findCategory(budget.category);
  const icon = cat?.icon || 'fa-ellipsis';

  // Prefer the live category label; fall back to the stored one
  const title = cat?.label || budget.categoryLabel || 'Other';

  const periodLabel = PERIOD_LABELS[budget.period] || 'Custom';

  // Clamp and sanitize the percent — guards against NaN / Infinity / negatives
  const rawPercent = Number(status.percent);
  const percent = Number.isFinite(rawPercent)
    ? Math.max(0, Math.min(100, Math.round(rawPercent)))
    : 0;

  // The bar fill uses the same clamped value
  const fillWidth = `${percent}%`;

  const level = status.level || 'safe';

  return (
    <div className={`budget-card budget-card--${level}`}>
      {/* ---------- Header: icon + title + period ---------- */}
      <div className="budget-card-head">
        <div className="budget-card-title">
          <i className={`fas ${icon}`} aria-hidden="true"></i>
          <span>{title}</span>
        </div>
        <span className="budget-card-period">{periodLabel}</span>
      </div>

      {/* ---------- Numbers ---------- */}
      <div className="budget-card-numbers">
        <div>
          <span className="budget-card-label">Budget</span>
          <span className="budget-card-value">
            <Money amount={budget.amount} />
          </span>
        </div>
        <div>
          <span className="budget-card-label">Spent</span>
          <span className="budget-card-value">
            <Money amount={status.spent} />
          </span>
        </div>
        <div>
          <span className="budget-card-label">Remaining</span>
          <span className="budget-card-value">
            <Money amount={status.remaining} />
          </span>
        </div>
      </div>

      {/* ---------- Progress bar ---------- */}
      <div
        className="budget-card-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${title} budget used: ${percent}%`}
      >
        <span className="budget-card-fill" style={{ width: fillWidth }} />
      </div>

      <div className="budget-card-percent">{percent}%</div>

      {/* ---------- Status message ---------- */}
      {message && (
        <p
          className={`budget-card-message budget-card-message--${level}`}
        >
          {message}
        </p>
      )}

      {/* ---------- Actions ---------- */}
      <div className="budget-card-actions">
        <button
          type="button"
          className="text-button"
          onClick={() => onEdit(budget)}
        >
          <i className="fas fa-pen" aria-hidden="true"></i> Edit
        </button>
        <button
          type="button"
          className="text-button text-button--danger"
          onClick={() => onDelete(budget)}
        >
          <i className="fas fa-trash" aria-hidden="true"></i> Delete
        </button>
      </div>
    </div>
  );
}

export default BudgetCard;