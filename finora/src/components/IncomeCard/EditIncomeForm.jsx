/* =====================================================
   Finora — EditIncomeForm
   Form for editing an existing income entry. Rendered
   inside a Modal, pre-filled with the current values.

   Contract (same as AddIncomeForm):
     onSave is async — it awaits the actual persistence.
     We show success/error only after it resolves/rejects.

   Props:
     income   → the income object being edited
     onSave   → async (updatedIncome) => void
     onCancel → close the modal without saving
   ===================================================== */

import { useState } from 'react';
import { incomeSources } from '../../data/categories';
import { useToast } from '../Toast/ToastContext';

function EditIncomeForm({ income, onSave, onCancel }) {
  const { showToast } = useToast();

  // ---------- Pre-fill from the income ----------
  // `??` avoids `String(undefined)` → "undefined" ending up in the input
  const [amount, setAmount] = useState(String(income.amount ?? ''));

  // Fall back to the first source if the stored value isn't valid
  const [source, setSource] = useState(
    income.source || incomeSources[0]?.id || ''
  );

  // date inputs require "YYYY-MM-DD" — trim if a full ISO was stored
  const [date, setDate] = useState((income.date || '').slice(0, 10));

  const [note, setNote] = useState(income.note || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setError('');

    // ---------- Validation ----------
    const numericAmount = Number(amount);
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter an amount greater than 0.');
      return;
    }
    if (!source) {
      setError('Please select a source.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    // ---------- Save ----------
    setSaving(true);
    try {
      await onSave({
        ...income,
        amount: numericAmount,
        source,
        date,
        note: note.trim(),
      });
      showToast('Income updated', 'success');
    } catch (err) {
      console.error('Update income failed:', err);
      showToast("We couldn't update the income.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const amountInvalid = Boolean(error) && !amount;

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="form-error" role="alert" id="edit-income-error">
          {error}
        </div>
      )}

      {/* ---------- Amount ---------- */}
      <div className="form-field">
        <label htmlFor="edit-income-amount">Amount</label>
        <input
          id="edit-income-amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={saving}
          aria-invalid={amountInvalid ? 'true' : undefined}
          aria-describedby={
            amountInvalid ? 'edit-income-error' : undefined
          }
        />
      </div>

      {/* ---------- Source ---------- */}
      <div className="form-field">
        <label htmlFor="edit-income-source">Source</label>
        <select
          id="edit-income-source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          disabled={saving}
        >
          {incomeSources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Date ---------- */}
      <div className="form-field">
        <label htmlFor="edit-income-date">Date</label>
        <input
          id="edit-income-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={saving}
        />
      </div>

      {/* ---------- Note ---------- */}
      <div className="form-field">
        <label htmlFor="edit-income-note">Note (optional)</label>
        <input
          id="edit-income-note"
          type="text"
          placeholder="e.g. September salary"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={saving}
        />
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

export default EditIncomeForm;