/* =====================================================
   Finora — EditGoalForm
   Form for editing an existing savings goal. Rendered
   inside a Modal, pre-filled with the current values.

   Contract (same as AddGoalForm):
     onSave is async — it awaits the actual persistence.
     We show success/error only after it resolves/rejects.

   Props:
     goal     → the goal object being edited
     onSave   → async (updatedGoal) => void
     onCancel → close the modal without saving
   ===================================================== */

import { useState } from 'react';
import { goalIcons } from '../../data/categories';
import { useToast } from '../Toast/ToastContext';

// Today in YYYY-MM-DD
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function EditGoalForm({ goal, onSave, onCancel }) {
  const { showToast } = useToast();

  const [name, setName] = useState(goal.name || '');

  // `??` avoids `String(undefined)` → "undefined"
  const [target, setTarget] = useState(String(goal.target ?? ''));
  const [saved, setSaved] = useState(String(goal.saved ?? ''));

  // Date inputs need "YYYY-MM-DD" — trim full ISO if needed
  const [targetDate, setTargetDate] = useState(
    (goal.targetDate || '').slice(0, 10)
  );

  // Fall back to the first available icon if the stored value is invalid
  const [icon, setIcon] = useState(() => {
    const exists = goalIcons.some((g) => g.id === goal.icon);
    return exists ? goal.icon : goalIcons[0]?.id || '';
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Don't let the user pick a new target date in the past, unless the
  // existing value is already in the past (editing an overdue goal).
  const minDate =
    targetDate && targetDate < todayISO() ? targetDate : todayISO();

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setError('');

    // ---------- Validation ----------
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter a goal name.');
      return;
    }

    const numericTarget = Number(target);
    if (!target || Number.isNaN(numericTarget) || numericTarget <= 0) {
      setError('Please enter a target amount greater than 0.');
      return;
    }

    const numericSaved = saved === '' ? 0 : Number(saved);
    if (Number.isNaN(numericSaved) || numericSaved < 0) {
      setError('Saved amount must be 0 or more.');
      return;
    }

    if (numericSaved > numericTarget) {
      setError('Saved amount cannot be more than the target.');
      return;
    }

    // ---------- Save ----------
    setSaving(true);
    try {
      await onSave({
        ...goal,
        name: cleanName,
        target: numericTarget,
        saved: numericSaved,
        targetDate: targetDate || '',
        icon,
      });
      showToast('Goal updated', 'success');
    } catch (err) {
      console.error('Update goal failed:', err);
      showToast("We couldn't update the goal.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const targetInvalid = Boolean(error) && !target;

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="form-error" role="alert" id="edit-goal-error">
          {error}
        </div>
      )}

      {/* ---------- Name ---------- */}
      <div className="form-field">
        <label htmlFor="edit-goal-name">Goal name</label>
        <input
  id="edit-goal-name"
  type="text"
  placeholder="e.g. New Laptop"
  autoComplete="off"
  value={name}
  onChange={(e) => setName(e.target.value)}
  disabled={saving}
/>
      </div>

      {/* ---------- Target amount ---------- */}
      <div className="form-field">
        <label htmlFor="edit-goal-target">Target amount</label>
        <input
          id="edit-goal-target"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0.00"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={saving}
          aria-invalid={targetInvalid ? 'true' : undefined}
          aria-describedby={
            targetInvalid ? 'edit-goal-error' : undefined
          }
        />
      </div>

      {/* ---------- Saved so far ---------- */}
      <div className="form-field">
        <label htmlFor="edit-goal-saved">Saved so far</label>
        <input
          id="edit-goal-saved"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0.00"
          value={saved}
          onChange={(e) => setSaved(e.target.value)}
          disabled={saving}
        />
      </div>

      {/* ---------- Target date ---------- */}
      <div className="form-field">
        <label htmlFor="edit-goal-date">Target date (optional)</label>
        <input
          id="edit-goal-date"
          type="date"
          min={minDate}
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          disabled={saving}
        />
      </div>

      {/* ---------- Icon ---------- */}
      <div className="form-field">
        <label htmlFor="edit-goal-icon">Icon</label>
        <select
          id="edit-goal-icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          disabled={saving || goalIcons.length === 0}
        >
          {goalIcons.length === 0 && (
            <option value="" disabled>
              No icons available
            </option>
          )}
          {goalIcons.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="form-actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="button button--primary"
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? (
            <>
              <i
                className="fas fa-circle-notch fa-spin"
                aria-hidden="true"
              ></i>{' '}
              Saving…
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}

export default EditGoalForm;