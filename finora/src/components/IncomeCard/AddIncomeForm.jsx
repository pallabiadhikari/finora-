/* =====================================================
   Finora — AddIncomeForm
   Form for recording a new income entry. Rendered inside
   a Modal.

   Contract (same as AddExpenseForm):
     onSave is async — it awaits the actual persistence.
     We show the success toast only after it resolves.

   Props:
     onSave   → async (income) => void — persists the income
     onCancel → close the modal without saving
   ===================================================== */

import { useState } from 'react';
import { incomeSources } from '../../data/categories';
import { useToast } from '../Toast/ToastContext';

function AddIncomeForm({ onSave, onCancel }) {
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState('');
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
        id: Date.now(),
        amount: numericAmount,
        source,
        date,
        note: note.trim(),
      });
      showToast('Income added successfully', 'success');
    } catch (err) {
      console.error('Add income failed:', err);
      showToast(
        "We couldn't save your income. Please try again.",
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const amountInvalid = Boolean(error) && !amount;

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="form-error" role="alert" id="add-income-error">
          {error}
        </div>
      )}

      {/* ---------- Amount ---------- */}
      <div className="form-field">
        <label htmlFor="income-amount">Amount</label>
        <input
          id="income-amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={saving}
          aria-invalid={amountInvalid ? 'true' : undefined}
          aria-describedby={
            amountInvalid ? 'add-income-error' : undefined
          }
        />
      </div>

      {/* ---------- Source ---------- */}
      <div className="form-field">
        <label htmlFor="income-source">Source</label>
        <select
          id="income-source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          disabled={saving}
        >
          <option value="" disabled>
            Select a source
          </option>
          {incomeSources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Date ---------- */}
      <div className="form-field">
        <label htmlFor="income-date">Date</label>
        <input
          id="income-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={saving}
        />
      </div>

      {/* ---------- Note ---------- */}
      <div className="form-field">
        <label htmlFor="income-note">Note (optional)</label>
        <input
          id="income-note"
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
            'Save Income'
          )}
        </button>
      </div>
    </form>
  );
}

export default AddIncomeForm;