/* =====================================================
   Finora — EditExpenseForm
   Form for editing an existing expense. Rendered inside
   a Modal, pre-filled with the expense's current values.

   Contract (same as AddExpenseForm):
     onSave is async — it awaits the actual persistence.
     We only show success/error after it resolves/rejects.

   Props:
     expense  → the expense object being edited
     onSave   → async (updatedExpense) => void
     onCancel → close the modal without saving
   ===================================================== */

import { useState } from 'react';
import { paymentMethods } from '../../data/categories';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../Toast/ToastContext';

function EditExpenseForm({ expense, onSave, onCancel }) {
  const { showToast } = useToast();
  const allCategories = useCategories();

  // ---------- Pre-fill from the expense ----------
  // `??` protects against undefined; `String()` keeps the input happy.
  const [amount, setAmount] = useState(String(expense.amount ?? ''));

  const [category, setCategory] = useState(expense.category || '');

  // date inputs require "YYYY-MM-DD" — trim if a full ISO was stored
  const [date, setDate] = useState(
    (expense.date || '').slice(0, 10)
  );

  // Fall back to the first payment method rather than a hardcoded id
  const [paymentMethod, setPaymentMethod] = useState(
    expense.paymentMethod || paymentMethods[0]?.id || ''
  );

  const [note, setNote] = useState(expense.note || '');

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
    if (!category) {
      setError('Please select a category.');
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
        ...expense,
        amount: numericAmount,
        category,
        date,
        paymentMethod,
        note: note.trim(),
      });
      showToast('Expense updated', 'success');
    } catch (err) {
      console.error('Update expense failed:', err);
      showToast("We couldn't update the expense.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const amountInvalid = Boolean(error) && !amount;

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="form-error" role="alert" id="edit-expense-error">
          {error}
        </div>
      )}

      {/* ---------- Amount ---------- */}
      <div className="form-field">
        <label htmlFor="edit-amount">Amount</label>
        <input
          id="edit-amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={saving}
          aria-invalid={amountInvalid ? 'true' : undefined}
          aria-describedby={
            amountInvalid ? 'edit-expense-error' : undefined
          }
        />
      </div>

      {/* ---------- Category ---------- */}
      <div className="form-field">
        <label htmlFor="edit-category">Category</label>
        <select
          id="edit-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={saving}
        >
          {allCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Date ---------- */}
      <div className="form-field">
        <label htmlFor="edit-date">Date</label>
        <input
          id="edit-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={saving}
        />
      </div>

      {/* ---------- Payment method ---------- */}
      <div className="form-field">
        <label htmlFor="edit-payment">Payment Method</label>
        <select
          id="edit-payment"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          disabled={saving}
        >
          {paymentMethods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Note ---------- */}
      <div className="form-field">
        <label htmlFor="edit-note">Note (optional)</label>
        <input
          id="edit-note"
          type="text"
          placeholder="e.g. Lunch with team"
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

export default EditExpenseForm;