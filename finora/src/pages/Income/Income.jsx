/* =====================================================
   Finora — Income
   List of all income entries with:
     • Total income summary card
     • Add income button
     • Edit + delete modals per row

   Entries are shown newest first.
   ===================================================== */

import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal/Modal';
import AddIncomeForm from '../../components/IncomeCard/AddIncomeForm';
import EditIncomeForm from '../../components/IncomeCard/EditIncomeForm';
import IncomeRow from '../../components/IncomeCard/IncomeRow';
import Money from '../../components/Button/Money';
import {
  getIncomes,
  addIncome,
  updateIncome,
  deleteIncome as removeIncome,
} from '../../utils/storage';

// Safe numeric conversion — NaN / undefined → 0
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function Income() {
  const [incomes, setIncomes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  // ---------- Load incomes ----------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getIncomes();
        if (!cancelled) setIncomes(data);
      } catch (err) {
        console.error('Failed to load incomes:', err);
        if (!cancelled) setIncomes([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Total (safe + memoized) ----------
  const totalIncome = useMemo(
    () => incomes.reduce((sum, i) => sum + toNumber(i.amount), 0),
    [incomes]
  );

  // ---------- Sorted list (newest first) ----------
  const sorted = useMemo(() => {
    return [...incomes].sort((a, b) => {
      const da = String(a.date || '').slice(0, 10);
      const db = String(b.date || '').slice(0, 10);
      return db.localeCompare(da);
    });
  }, [incomes]);

  // ---------- Handlers ----------
  const handleAddSave = async (income) => {
    const next = await addIncome(income);
    setIncomes(next);
    setShowAdd(false);
  };

  const handleEditSave = async (updated) => {
    const next = await updateIncome(updated);
    setIncomes(next);
    setEditing(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleting || deleteSaving) return;
    setDeleteSaving(true);

    try {
      const next = await removeIncome(deleting.id);
      setIncomes(next);
      setDeleting(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteSaving(false);
    }
  };

  // What to show in the delete confirmation
  const deleteLabel = deleting
    ? deleting.note?.trim() || 'this income entry'
    : '';

  return (
    <div className="page">
      {/* ---------- Header ---------- */}
      <div className="page-header">
        <h1 className="page-title">Income</h1>
        <p className="page-subtitle">
          Track every source of money coming in
        </p>
      </div>

      {/* ---------- Total ---------- */}
      <div className="summary-card summary-card--highlight">
        <span className="summary-label">Total Income</span>
        <span className="summary-value">
          <Money amount={totalIncome} />
        </span>
      </div>

      {/* ---------- Add income ---------- */}
      <button
        type="button"
        className="dashboard-add-button"
        onClick={() => setShowAdd(true)}
      >
        <i className="fas fa-plus" aria-hidden="true"></i>
        Add Income
      </button>

      {/* ---------- List ---------- */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <i
            className="fas fa-sack-dollar empty-state-icon"
            aria-hidden="true"
          ></i>
          <h2 className="empty-state-title">No income yet</h2>
          <p className="empty-state-text">
            Add your first income source to see your balance.
          </p>
        </div>
      ) : (
        <ul className="expense-list">
          {sorted.map((income) => (
            <IncomeRow
              key={income.id}
              income={income}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </ul>
      )}

      {/* ---------- Add modal ---------- */}
      {showAdd && (
        <Modal
          title="Add Income"
          onClose={() => setShowAdd(false)}
        >
          <AddIncomeForm
            onSave={handleAddSave}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {/* ---------- Edit modal ---------- */}
      {editing && (
        <Modal
          title="Edit Income"
          onClose={() => setEditing(null)}
        >
          <EditIncomeForm
            income={editing}
            onSave={handleEditSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {/* ---------- Delete confirmation ---------- */}
      {deleting && (
        <Modal
          title="Delete income?"
          onClose={() => (deleteSaving ? null : setDeleting(null))}
        >
          <p className="confirm-text">
            Are you sure you want to remove{' '}
            <strong>{deleteLabel}</strong>?
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
                'Delete income'
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Income;