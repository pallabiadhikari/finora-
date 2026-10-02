/* =====================================================
   Finora — Goals
   List of savings goals with:
     • Add goal button
     • Per-goal progress card
     • Edit / delete / add-savings flows

   The "Add savings" flow lives in this page (not the
   GoalCard), because it only needs a single amount field.
   ===================================================== */

import { useEffect, useState } from 'react';
import Modal from '../../components/Modal/Modal';
import AddGoalForm from '../../components/GoalCard/AddGoalForm';
import EditGoalForm from '../../components/GoalCard/EditGoalForm';
import GoalCard from '../../components/GoalCard/GoalCard';
import { useToast } from '../../components/Toast/ToastContext';
import {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal as removeGoal,
} from '../../utils/storage';

// Safe numeric conversion — NaN / undefined → 0
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function Goals() {
  const { showToast } = useToast();

  const [goals, setGoals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  // "Add savings" mini-modal state
  const [addingTo, setAddingTo] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [addError, setAddError] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  // ---------- Load goals ----------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getGoals();
        if (!cancelled) setGoals(data);
      } catch (err) {
        console.error('Failed to load goals:', err);
        if (!cancelled) setGoals([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Handlers ----------

  const handleAddSave = async (goal) => {
    const next = await addGoal(goal);
    setGoals(next);
    setShowAdd(false);
  };

  const handleEditSave = async (updated) => {
    const next = await updateGoal(updated);
    setGoals(next);
    setEditing(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleting || deleteSaving) return;
    setDeleteSaving(true);

    try {
      const next = await removeGoal(deleting.id);
      setGoals(next);
      setDeleting(null);
    } catch (err) {
      console.error('Delete goal failed:', err);
    } finally {
      setDeleteSaving(false);
    }
  };

  // Open the add-savings modal for a specific goal
  const openAddSavings = (goal) => {
    setAddingTo(goal);
    setAddAmount('');
    setAddError('');
  };

  // Reset the add-savings modal
  const closeAddSavings = () => {
    if (addSaving) return;
    setAddingTo(null);
    setAddAmount('');
    setAddError('');
  };

  // Confirm the add-savings amount
  const handleAddSavingsConfirm = async (e) => {
    e.preventDefault();
    if (!addingTo || addSaving) return;

    setAddError('');

    const numeric = Number(addAmount);
    if (!addAmount || Number.isNaN(numeric) || numeric <= 0) {
      setAddError('Please enter an amount greater than 0.');
      return;
    }

    const newSaved = toNumber(addingTo.saved) + numeric;

    setAddSaving(true);
    try {
      const next = await updateGoal({
        ...addingTo,
        saved: newSaved,
      });
      setGoals(next);
      showToast('Savings added', 'success');
      setAddingTo(null);
      setAddAmount('');
    } catch (err) {
      console.error('Add savings failed:', err);
      setAddError("We couldn't save that amount. Please try again.");
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div className="page">
      {/* ---------- Header ---------- */}
      <div className="page-header">
        <h1 className="page-title">Goals</h1>
        <p className="page-subtitle">
          Save towards the things that matter to you
        </p>
      </div>

      {/* ---------- Add goal ---------- */}
      <button
        type="button"
        className="dashboard-add-button"
        onClick={() => setShowAdd(true)}
      >
        <i className="fas fa-plus" aria-hidden="true"></i>
        Add Goal
      </button>

      {/* ---------- List ---------- */}
      {goals.length === 0 ? (
        <div className="empty-state">
          <i
            className="fas fa-flag empty-state-icon"
            aria-hidden="true"
          ></i>
          <h2 className="empty-state-title">No goals yet</h2>
          <p className="empty-state-text">
            Create a savings goal and start tracking your progress.
          </p>
        </div>
      ) : (
        <div className="goal-list">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={setEditing}
              onDelete={setDeleting}
              onAddSavings={openAddSavings}
            />
          ))}
        </div>
      )}

      {/* ---------- Add modal ---------- */}
      {showAdd && (
        <Modal title="Add Goal" onClose={() => setShowAdd(false)}>
          <AddGoalForm
            onSave={handleAddSave}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {/* ---------- Edit modal ---------- */}
      {editing && (
        <Modal title="Edit Goal" onClose={() => setEditing(null)}>
          <EditGoalForm
            goal={editing}
            onSave={handleEditSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {/* ---------- Delete confirmation ---------- */}
      {deleting && (
        <Modal
          title="Delete goal?"
          onClose={() => (deleteSaving ? null : setDeleting(null))}
        >
          <p className="confirm-text">
            Are you sure you want to remove{' '}
            <strong>{deleting.name || 'this goal'}</strong>?
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
                'Delete goal'
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* ---------- Add savings modal ---------- */}
      {addingTo && (
        <Modal
          title={`Add savings to ${addingTo.name}`}
          onClose={closeAddSavings}
        >
          <form
            className="form"
            onSubmit={handleAddSavingsConfirm}
            noValidate
          >
            {addError && (
              <div
                className="form-error"
                role="alert"
                id="add-savings-error"
              >
                {addError}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="goal-add-amount">Amount to add</label>
              <input
                id="goal-add-amount"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder="0.00"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                disabled={addSaving}
                autoFocus
                aria-invalid={addError ? 'true' : undefined}
                aria-describedby={
                  addError ? 'add-savings-error' : undefined
                }
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={closeAddSavings}
                disabled={addSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button--primary"
                disabled={addSaving}
                aria-busy={addSaving}
              >
                {addSaving ? (
                  <>
                    <i
                      className="fas fa-circle-notch fa-spin"
                      aria-hidden="true"
                    ></i>{' '}
                    Adding…
                  </>
                ) : (
                  'Add savings'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Goals;