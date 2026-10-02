/* =====================================================
   Finora — Transactions
   Full list of expenses with:
     • Search (note + category label)
     • Category filter
     • Date range filter (today / week / month / etc.)
     • Edit + delete modals

   Filters are applied client-side over the loaded list.
   ===================================================== */

import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal/Modal';
import ExpenseRow from '../../components/ExpenseCard/ExpenseRow';
import EditExpenseForm from '../../components/ExpenseCard/EditExpenseForm';
import { useCategories } from '../../hooks/useCategories';
import {
  getExpenses,
  updateExpense,
  deleteExpense as removeExpense,
} from '../../utils/storage';

// ---------- Date filters ----------
const DATE_FILTERS = [
  { id: 'all', label: 'All time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'lastMonth', label: 'Last month' },
  { id: 'year', label: 'This year' },
];

// Local-safe date parser: "2026-10-01" → local midnight, not UTC
function parseLocalDate(value) {
  if (!value) return null;
  const iso = String(value).slice(0, 10);
  const d = new Date(iso + 'T00:00:00');
  return Number.isNaN(d.getTime()) ? null : d;
}

// Whether a date string falls within the given filter window
function isInRange(dateStr, filterId) {
  if (filterId === 'all') return true;

  const d = parseLocalDate(dateStr);
  if (!d) return false;

  const now = new Date();

  if (filterId === 'today') {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }

  if (filterId === 'week') {
    const start = new Date(now);
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday start
    start.setDate(now.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return d >= start && d <= now;
  }

  if (filterId === 'month') {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth()
    );
  }

  if (filterId === 'lastMonth') {
    const target = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    return (
      d.getFullYear() === target.getFullYear() &&
      d.getMonth() === target.getMonth()
    );
  }

  if (filterId === 'year') {
    return d.getFullYear() === now.getFullYear();
  }

  return true;
}

function Transactions() {
  const categories = useCategories();

  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  // ---------- Load expenses ----------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getExpenses();
        if (!cancelled) setExpenses(data);
      } catch (err) {
        console.error('Failed to load expenses:', err);
        if (!cancelled) setExpenses([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Filtered + sorted list ----------
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    return expenses
      .filter((e) => {
        if (filterCategory !== 'all' && e.category !== filterCategory) {
          return false;
        }
        if (!isInRange(e.date, filterDate)) return false;
        if (!q) return true;

        const cat = categories.find((c) => c.id === e.category);
        const haystack = `${e.note || ''} ${
          cat?.label || ''
        }`.toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        // ISO-safe string compare — newest first
        const da = String(a.date || '').slice(0, 10);
        const db = String(b.date || '').slice(0, 10);
        return db.localeCompare(da);
      });
  }, [expenses, search, filterCategory, filterDate, categories]);

  // Are any filters active?
  const filtersActive =
    search.trim() !== '' ||
    filterCategory !== 'all' ||
    filterDate !== 'all';

  const resetFilters = () => {
    setSearch('');
    setFilterCategory('all');
    setFilterDate('all');
  };

  // ---------- Handlers ----------
  const handleEditSave = async (updated) => {
    const next = await updateExpense(updated);
    setExpenses(next);
    setEditing(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleting || deleteSaving) return;
    setDeleteSaving(true);

    try {
      const next = await removeExpense(deleting.id);
      setExpenses(next);
      setDeleting(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteSaving(false);
    }
  };

  return (
    <div className="page">
      {/* ---------- Header ---------- */}
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <p className="page-subtitle">
          All your spending in one place
        </p>
      </div>

      {/* ---------- Filters ---------- */}
      <div className="transactions-controls">
        <div className="transactions-search">
          <i
            className="fas fa-magnifying-glass"
            aria-hidden="true"
          ></i>
          <input
            type="text"
            placeholder="Search by note or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search transactions"
          />
        </div>

        <select
          className="transactions-filter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          className="transactions-filter"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          aria-label="Filter by date range"
        >
          {DATE_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Results ---------- */}
      {visible.length === 0 ? (
        <div className="empty-state">
          <i
            className="fas fa-receipt empty-state-icon"
            aria-hidden="true"
          ></i>
          <h2 className="empty-state-title">No transactions found</h2>
          <p className="empty-state-text">
            {filtersActive
              ? 'Try a different filter, or reset to see all transactions.'
              : 'Add your first expense to get started.'}
          </p>
          {filtersActive && (
            <div className="form-actions" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="button button--ghost"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul className="expense-list">
          {visible.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </ul>
      )}

      {/* ---------- Edit modal ---------- */}
      {editing && (
        <Modal
          title="Edit Expense"
          onClose={() => setEditing(null)}
        >
          <EditExpenseForm
            expense={editing}
            onSave={handleEditSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {/* ---------- Delete confirmation ---------- */}
      {deleting && (
        <Modal
          title="Delete expense?"
          onClose={() => (deleteSaving ? null : setDeleting(null))}
        >
          <p className="confirm-text">
            Are you sure you want to remove{' '}
            <strong>
              {deleting.note?.trim() ||
                categories.find((c) => c.id === deleting.category)
                  ?.label ||
                'this transaction'}
            </strong>
            ?
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
                'Delete expense'
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Transactions;