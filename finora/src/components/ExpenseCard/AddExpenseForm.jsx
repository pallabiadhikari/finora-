/* =====================================================
   Finora — AddExpenseForm
   Form for creating a new expense. Rendered inside a Modal.

   Note: the parent (`onSave`) is responsible for the actual
   save + storage. This form:
     • Validates inputs
     • Calls onSave with a clean expense object
     • Shows a success toast only after onSave resolves
     • Shows an error if onSave rejects

   Props:
     onSave   → async (expense) => void — persists the expense
     onCancel → close the modal without saving
   ===================================================== */

import { useState } from 'react';
import { paymentMethods } from '../../data/categories';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../Toast/ToastContext';

function AddExpenseForm({ onSave, onCancel }) {
  const { showToast } = useToast();
  const allCategories = useCategories();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState('');
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
    if (!category) {
      setError('Please select a category.');
      return;
    }
    if (!paymentMethod) {
      setError('Please select a payment method.');
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
        category,
        date,
        paymentMethod,
        note: note.trim(),
      });
      // Only toast AFTER the save actually succeeds
      showToast('Expense added successfully', 'success');
    } catch (err) {
      console.error('Add expense failed:', err);
      showToast(
        "We couldn't save your expense. Please try again.",
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  // Whether the amount input should be marked invalid
  const amountInvalid = Boolean(error) && !amount;

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="form-error" role="alert" id="add-expense-error">
          {error}
        </div>
      )}

      {/* ---------- Amount ---------- */}
      <div className="form-field">
        <label htmlFor="expense-amount">Amount</label>
        <input
          id="expense-amount"
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
            amountInvalid ? 'add-expense-error' : undefined
          }
        />
      </div>

      {/* ---------- Category ---------- */}
      <div className="form-field">
        <label htmlFor="expense-category">Category</label>
        <select
          id="expense-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={saving}
        >
          <option value="" disabled>
            Select a category
          </option>
          {allCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Date ---------- */}
      <div className="form-field">
        <label htmlFor="expense-date">Date</label>
        <input
          id="expense-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={saving}
        />
      </div>

      {/* ---------- Payment method ---------- */}
      <div className="form-field">
        <label htmlFor="expense-payment">Payment Method</label>
        <select
          id="expense-payment"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          disabled={saving}
        >
          <option value="" disabled>
            Select a payment method
          </option>
          {paymentMethods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Note ---------- */}
      <div className="form-field">
        <label htmlFor="expense-note">Note (optional)</label>
        <input
          id="expense-note"
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
            'Save Expense'
          )}
        </button>
      </div>
    </form>
  );
}

export default AddExpenseForm;