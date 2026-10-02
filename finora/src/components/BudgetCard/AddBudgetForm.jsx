/* =====================================================
   Finora — AddBudgetForm
   Form for creating a new budget. Rendered inside a Modal.

   Contract (same as other add forms):
     onSave is async — it awaits the actual persistence.
     We show the success toast only after it resolves.

   Props:
     onSave   → async (budget) => void — persists the budget
     onCancel → close the modal without saving
   ===================================================== */

import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../Toast/ToastContext';

function AddBudgetForm({ onSave, onCancel }) {
  const { showToast } = useToast();
  const categories = useCategories();

  // Default to the first available category, not a hardcoded 'food'
  const [category, setCategory] = useState(
    categories[0]?.id || ''
  );
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setError('');

    // ---------- Validation ----------
    if (!category) {
      setError('Please select a category.');
      return;
    }

    const numericAmount = Number(amount);
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a budget amount greater than 0.');
      return;
    }

    const cat = categories.find((c) => c.id === category);

    // ---------- Save ----------
    setSaving(true);
    try {
      await onSave({
        id: Date.now(),
        category,
        categoryLabel: cat?.label || 'Other',
        amount: numericAmount,
        period,
        createdAt: new Date().toISOString(),
      });
      showToast('Budget added successfully', 'success');
    } catch (err) {
      console.error('Add budget failed:', err);
      showToast(
        "We couldn't save your budget. Please try again.",
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
        <div className="form-error" role="alert" id="add-budget-error">
          {error}
        </div>
      )}

      {/* ---------- Category ---------- */}
      <div className="form-field">
        <label htmlFor="budget-category">Category</label>
        <select
          id="budget-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={saving}
        >
          {categories.length === 0 && (
            <option value="" disabled>
              No categories available
            </option>
          )}
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Amount ---------- */}
      <div className="form-field">
        <label htmlFor="budget-amount">Budget Amount</label>
        <input
          id="budget-amount"
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
            amountInvalid ? 'add-budget-error' : undefined
          }
        />
      </div>

      {/* ---------- Period ---------- */}
      <div className="form-field">
        <label htmlFor="budget-period">Period</label>
        <select
  id="budget-period"
  value={period}
  onChange={(e) => setPeriod(e.target.value)}
  disabled={saving}
>
  <option value="weekly">Weekly</option>
  <option value="monthly">Monthly</option>
  <option value="yearly">Yearly</option>
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
            'Save Budget'
          )}
        </button>
      </div>
    </form>
  );
}

export default AddBudgetForm;