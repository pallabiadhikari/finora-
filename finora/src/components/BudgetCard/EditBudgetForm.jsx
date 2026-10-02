/* =====================================================
   Finora — EditBudgetForm
   Form for editing an existing budget. Rendered inside
   a Modal, pre-filled with the current values.

   Contract (same as AddBudgetForm):
     onSave is async — it awaits the actual persistence.
     We show success/error only after it resolves/rejects.

   Props:
     budget   → the budget object being edited
     onSave   → async (updatedBudget) => void
     onCancel → close the modal without saving
   ===================================================== */

import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../Toast/ToastContext';

const PERIODS = ['weekly', 'monthly', 'yearly'];

function EditBudgetForm({ budget, onSave, onCancel }) {
  const { showToast } = useToast();
  const categories = useCategories();

  // Category — fall back to the first available if the stored id is gone
  const [category, setCategory] = useState(() => {
    const exists = categories.some((c) => c.id === budget.category);
    return exists ? budget.category : categories[0]?.id || '';
  });

  // Amount — `??` avoids `String(undefined)` → "undefined"
  const [amount, setAmount] = useState(String(budget.amount ?? ''));

  // Period — fall back to 'monthly' if the stored value is unexpected
  const [period, setPeriod] = useState(
    PERIODS.includes(budget.period) ? budget.period : 'monthly'
  );

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
        ...budget,
        category,
        categoryLabel: cat?.label || 'Other',
        amount: numericAmount,
        period,
      });
      showToast('Budget updated', 'success');
    } catch (err) {
      console.error('Update budget failed:', err);
      showToast("We couldn't update the budget.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const amountInvalid = Boolean(error) && !amount;

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="form-error" role="alert" id="edit-budget-error">
          {error}
        </div>
      )}

      {/* ---------- Category ---------- */}
      <div className="form-field">
        <label htmlFor="edit-budget-category">Category</label>
        <select
          id="edit-budget-category"
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
        <label htmlFor="edit-budget-amount">Budget Amount</label>
        <input
          id="edit-budget-amount"
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
            amountInvalid ? 'edit-budget-error' : undefined
          }
        />
      </div>

      {/* ---------- Period ---------- */}
      <div className="form-field">
        <label htmlFor="edit-budget-period">Period</label>
        <select
          id="edit-budget-period"
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
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}

export default EditBudgetForm;