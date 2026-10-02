/* =====================================================
   Finora — AddGoalForm
   Form for creating a savings goal. Rendered inside a Modal.

   Contract (same as other add forms):
     onSave is async — it awaits the actual persistence.
     We show the success toast only after it resolves.

   Props:
     onSave   → async (goal) => void — persists the goal
     onCancel → close the modal without saving
   ===================================================== */

import { useState } from 'react';
import { goalIcons } from '../../data/categories';
import { useToast } from '../Toast/ToastContext';

// Today in YYYY-MM-DD, used as the min for the target date
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function AddGoalForm({ onSave, onCancel }) {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Default to the first available icon rather than a hardcoded id
  const [icon, setIcon] = useState(goalIcons[0]?.id || '');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
        id: Date.now(),
        name: cleanName,
        target: numericTarget,
        saved: numericSaved,
        targetDate: targetDate || '',
        icon,
      });
      showToast('Goal added successfully', 'success');
    } catch (err) {
      console.error('Add goal failed:', err);
      showToast(
        "We couldn't save your goal. Please try again.",
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const targetInvalid = Boolean(error) && !target;

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="form-error" role="alert" id="add-goal-error">
          {error}
        </div>
      )}

      {/* ---------- Name ---------- */}
      <div className="form-field">
        <label htmlFor="goal-name">Goal name</label>
        <input
  id="goal-name"
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
        <label htmlFor="goal-target">Target amount</label>
        <input
          id="goal-target"
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
            targetInvalid ? 'add-goal-error' : undefined
          }
        />
      </div>

      {/* ---------- Already saved ---------- */}
      <div className="form-field">
        <label htmlFor="goal-saved">Already saved (optional)</label>
        <input
          id="goal-saved"
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
        <label htmlFor="goal-date">Target date (optional)</label>
        <input
          id="goal-date"
          type="date"
          min={todayISO()}
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          disabled={saving}
        />
      </div>

      {/* ---------- Icon ---------- */}
      <div className="form-field">
        <label htmlFor="goal-icon">Icon</label>
        <select
          id="goal-icon"
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
            'Save Goal'
          )}
        </button>
      </div>
    </form>
  );
}

export default AddGoalForm;