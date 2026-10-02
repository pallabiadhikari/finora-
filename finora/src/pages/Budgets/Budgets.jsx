/* =====================================================
   Finora — Budgets
   List of spending limits per category with:
     • Add budget button
     • Per-budget progress + status message
     • Edit + delete modals

   For each budget we compute:
     status  → { spent, remaining, percent, level }
     message → human-readable summary line
   ===================================================== */

import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal/Modal';
import AddBudgetForm from '../../components/BudgetCard/AddBudgetForm';
import EditBudgetForm from '../../components/BudgetCard/EditBudgetForm';
import BudgetCard from '../../components/BudgetCard/BudgetCard';
import { useSettings } from '../../hooks/useSettings';
import {
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget as removeBudget,
  getExpenses,
} from '../../utils/storage';
import {
  getBudgetStatus,
  getBudgetMessage,
} from '../../utils/calculations';

// Find the human-readable label for a budget in the delete modal
function budgetLabel(budget) {
  if (!budget) return '';
  return budget.categoryLabel?.trim() || 'this budget';
}

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const settings = useSettings();

  // ---------- Load data ----------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [b, e] = await Promise.all([
          getBudgets(),
          getExpenses(),
        ]);
        if (cancelled) return;
        setBudgets(b);
        setExpenses(e);
      } catch (err) {
        console.error('Failed to load budgets:', err);
        if (!cancelled) {
          setBudgets([]);
          setExpenses([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Enriched list (status + message per budget) ----------
  // Memoized so opening a modal doesn't recompute every budget's stats.
  const enriched = useMemo(
  () =>
    budgets.map((budget) => {
      const status = getBudgetStatus(budget, expenses);
      const message = getBudgetMessage(budget, status, settings.currency);
      return { budget, status, message };
    }),
  [budgets, expenses, settings.currency]
);

  // ---------- Handlers ----------
  const handleAddSave = async (budget) => {
    const next = await addBudget(budget);
    setBudgets(next);
    setShowAdd(false);
  };

  const handleEditSave = async (updated) => {
    const next = await updateBudget(updated);
    setBudgets(next);
    setEditing(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleting || deleteSaving) return;
    setDeleteSaving(true);

    try {
      const next = await removeBudget(deleting.id);
      setBudgets(next);
      setDeleting(null);
    } catch (err) {
      console.error('Delete budget failed:', err);
    } finally {
      setDeleteSaving(false);
    }
  };

  return (
    <div className="page">
      {/* ---------- Header ---------- */}
      <div className="page-header">
        <h1 className="page-title">Budgets</h1>
        <p className="page-subtitle">
          Set a spending limit per category and track it
        </p>
      </div>

      {/* ---------- Add budget ---------- */}
      <button
        type="button"
        className="dashboard-add-button"
        onClick={() => setShowAdd(true)}
      >
        <i className="fas fa-plus" aria-hidden="true"></i>
        Add Budget
      </button>

      {/* ---------- List ---------- */}
      {budgets.length === 0 ? (
        <div className="empty-state">
          <i
            className="fas fa-bullseye empty-state-icon"
            aria-hidden="true"
          ></i>
          <h2 className="empty-state-title">No budgets yet</h2>
          <p className="empty-state-text">
            Create a budget to start monitoring your spending.
          </p>
        </div>
      ) : (
        <div className="budget-list">
          {enriched.map(({ budget, status, message }) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              status={status}
              message={message}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {/* ---------- Add modal ---------- */}
      {showAdd && (
        <Modal
          title="Add Budget"
          onClose={() => setShowAdd(false)}
        >
          <AddBudgetForm
            onSave={handleAddSave}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {/* ---------- Edit modal ---------- */}
      {editing && (
        <Modal
          title="Edit Budget"
          onClose={() => setEditing(null)}
        >
          <EditBudgetForm
            budget={editing}
            onSave={handleEditSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {/* ---------- Delete confirmation ---------- */}
      {deleting && (
        <Modal
          title="Delete budget?"
          onClose={() => (deleteSaving ? null : setDeleting(null))}
        >
          <p className="confirm-text">
            Are you sure you want to remove the budget for{' '}
            <strong>{budgetLabel(deleting)}</strong>?
          </p>
          <div className="form-actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setDeleting(null)}
              disabled={deleteSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button--danger"
              onClick={handleDeleteConfirm}
              disabled={deleteSaving}
              aria-busy={deleteSaving}
            >
              {deleteSaving ? (
                <>
                  <i
                    className="fas fa-circle-notch fa-spin"
                    aria-hidden="true"
                  ></i>{' '}
                  Deleting…
                </>
              ) : (
                'Delete budget'
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Budgets;