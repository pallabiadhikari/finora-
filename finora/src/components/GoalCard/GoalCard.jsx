/* =====================================================
   Finora — GoalCard
   Displays a savings goal with:
     • Icon + name + target date
     • Progress percentage + bar
     • Saved / Target / Remaining amounts
     • "Completed" state when saved >= target
     • Add savings / Edit / Delete actions

   Props:
     goal          → the goal object
     onEdit        → called with the goal when Edit is clicked
     onDelete      → called with the goal when Delete is clicked
     onAddSavings  → called with the goal when Add savings is clicked
   ===================================================== */

import { goalIcons } from '../../data/categories';
import Money from '../Button/Money';

// ---------- Helpers ----------

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

// Normalize id matching (trim + lowercase) so " Piggy " matches "piggy"
function findGoalIcon(id) {
  if (!id) return null;
  const normalized = String(id).trim().toLowerCase();
  return goalIcons.find(
    (g) => String(g.id).trim().toLowerCase() === normalized
  );
}

// Coerce anything numeric-ish into a finite number, else 0
function toFinite(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function GoalCard({ goal, onEdit, onDelete, onAddSavings }) {
  // ---------- Icon ----------
  const iconData = findGoalIcon(goal.icon);
  const icon = iconData?.icon || 'fa-star';

  // ---------- Numbers ----------
  const saved = toFinite(goal.saved);
  const target = toFinite(goal.target);
  const remaining = Math.max(target - saved, 0);
  const complete = target > 0 && saved >= target;

  // Percent — sanitized and rounded
  const rawPercent = target > 0 ? (saved / target) * 100 : 0;
  const percent = Math.max(0, Math.round(rawPercent));

  // Bar fill is clamped to 100% so it never overflows the track
  const fillWidth = `${Math.min(percent, 100)}%`;

  return (
    <div className={`goal-card${complete ? ' goal-card--complete' : ''}`}>
      {/* ---------- Header ---------- */}
      <div className="goal-card-head">
        <span className="goal-card-icon" aria-hidden="true">
          <i className={`fas ${icon}`}></i>
        </span>

        <div className="goal-card-title">
          <span className="goal-card-name">{goal.name}</span>
          {goal.targetDate && (
            <span className="goal-card-date">
              Target:{' '}
              <time dateTime={goal.targetDate}>
                {formatDate(goal.targetDate)}
              </time>
            </span>
          )}
        </div>

        <span className="goal-card-percent">{percent}%</span>
      </div>

      {/* ---------- Progress bar ---------- */}
      <div
        className="goal-card-track"
        role="progressbar"
        aria-valuenow={Math.min(percent, 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${goal.name} progress: ${percent}%`}
      >
        <span className="goal-card-fill" style={{ width: fillWidth }} />
      </div>

      {/* ---------- Numbers ---------- */}
      <div className="goal-card-numbers">
        <div>
          <span className="goal-card-label">Saved</span>
          <span className="goal-card-value">
            <Money amount={saved} />
          </span>
        </div>
        <div>
          <span className="goal-card-label">Target</span>
          <span className="goal-card-value">
            <Money amount={target} />
          </span>
        </div>
        <div>
          <span className="goal-card-label">
            {complete ? 'Status' : 'Remaining'}
          </span>
          <span className="goal-card-value">
            {complete ? (
              <>
                Completed{' '}
                <span aria-hidden="true">🎉</span>
              </>
            ) : (
              <Money amount={remaining} />
            )}
          </span>
        </div>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="goal-card-actions">
        {!complete && (
          <button
            type="button"
            className="text-button"
            onClick={() => onAddSavings(goal)}
          >
            <i className="fas fa-plus" aria-hidden="true"></i> Add savings
          </button>
        )}
        <button
          type="button"
          className="text-button"
          onClick={() => onEdit(goal)}
        >
          <i className="fas fa-pen" aria-hidden="true"></i> Edit
        </button>
        <button
          type="button"
          className="text-button text-button--danger"
          onClick={() => onDelete(goal)}
        >
          <i className="fas fa-trash" aria-hidden="true"></i> Delete
        </button>
      </div>
    </div>
  );
}

export default GoalCard;