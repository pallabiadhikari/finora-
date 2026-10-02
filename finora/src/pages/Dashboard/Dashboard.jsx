/* =====================================================
   Finora — Dashboard
   Main landing page after login. Shows:
     • Greeting + month
     • Income / Expenses / Balance summary
     • Quick "Add Expense" button
     • Spending chart placeholder
     • Recent expenses list

   Props:
     user → the logged-in user object
   ===================================================== */

import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal/Modal';
import AddExpenseForm from '../../components/ExpenseCard/AddExpenseForm';
import Money from '../../components/Button/Money';
import { findCategory } from '../../utils/categories';
import {
  addExpense,
  getExpenses,
  getIncomes,
} from '../../utils/storage';
import { getUser } from '../../utils/user';

// ---------- Helpers ----------

// Format "2026-10-01" or full ISO as "Oct 1"
function formatDate(value) {
  if (!value) return '';
  const iso = String(value).slice(0, 10);
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Greeting based on the current hour
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Safe numeric conversion
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function Dashboard({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [displayName, setDisplayName] = useState(
    user?.name || 'there'
  );
  const [showAddExpense, setShowAddExpense] = useState(false);

  const monthName = new Date().toLocaleString('en-US', {
    month: 'long',
  });

  // ---------- Initial data load ----------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [exps, incs] = await Promise.all([
          getExpenses(),
          getIncomes(),
        ]);
        if (cancelled) return;
        setExpenses(exps);
        setIncomes(incs);
      } catch (err) {
        console.error('Dashboard load failed:', err);
        if (!cancelled) {
          setExpenses([]);
          setIncomes([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Display name (from local profile, keeps in sync) ----------
  useEffect(() => {
    const refresh = () => {
      if (!user?.email) {
        setDisplayName(user?.name || 'there');
        return;
      }
      const profile = getUser(user.email);
      setDisplayName(profile?.name || user?.name || 'there');
    };

    refresh(); // run once on mount / user change
    window.addEventListener('finora:profile-changed', refresh);
    return () =>
      window.removeEventListener('finora:profile-changed', refresh);
  }, [user]);

  // ---------- Derived totals ----------
  const totalIncome = useMemo(
    () => incomes.reduce((sum, i) => sum + toNumber(i.amount), 0),
    [incomes]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + toNumber(e.amount), 0),
    [expenses]
  );

  const balance = totalIncome - totalExpenses;

  // ---------- Recent expenses (sorted newest first) ----------
  const recent = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => {
      const da = String(a.date || '');
      const db = String(b.date || '');
      return db.localeCompare(da);
    });
    return sorted.slice(0, 3);
  }, [expenses]);

  // ---------- Handlers ----------
  const handleSaveExpense = async (expense) => {
    const next = await addExpense(expense);
    setExpenses(next);
    setShowAddExpense(false);
  };

  return (
    <div className="dashboard">
      {/* ---------- Header ---------- */}
      <div className="dashboard-header">
        <h1 className="dashboard-greeting">
          {getGreeting()}, {displayName}
        </h1>
        <p className="dashboard-month">{monthName}</p>
      </div>

      {/* ---------- Summary cards ---------- */}
      <div className="dashboard-summary">
        <div className="summary-card">
          <span className="summary-label">Income</span>
          <span className="summary-value">
            <Money amount={totalIncome} />
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Expenses</span>
          <span className="summary-value">
            <Money amount={totalExpenses} />
          </span>
        </div>
        <div className="summary-card summary-card--highlight">
          <span className="summary-label">Balance</span>
          <span className="summary-value">
            <Money amount={balance} />
          </span>
        </div>
      </div>

      {/* ---------- Add expense ---------- */}
      <button
        type="button"
        className="dashboard-add-button"
        onClick={() => setShowAddExpense(true)}
      >
        <i className="fas fa-plus" aria-hidden="true"></i>
        Add Expense
      </button>

      {/* ---------- Chart placeholder ---------- */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Spending Overview</h2>
        <div className="dashboard-chart-placeholder">
          <i
            className="fas fa-chart-simple"
            aria-hidden="true"
          ></i>
          <span>Chart will appear here</span>
        </div>
      </div>

      {/* ---------- Recent transactions ---------- */}
      <div className="dashboard-section">
        <div className="dashboard-section-head">
          <h2 className="dashboard-section-title">
            Recent Transactions
          </h2>
        </div>

        {recent.length === 0 ? (
          <p className="empty-inline">No expenses added yet.</p>
        ) : (
          <ul className="dashboard-transactions">
            {recent.map((e) => {
              const cat = findCategory(e.category);
              const label = cat?.label || 'Other';
              const cleanNote = e.note?.trim();
              const title = cleanNote || label;

              return (
                <li key={e.id} className="dashboard-transaction">
                  <div className="dashboard-transaction-info">
                    <span className="dashboard-transaction-title">
                      {title}
                    </span>
                    <span className="dashboard-transaction-category">
                      {label} ·{' '}
                      <time dateTime={e.date}>
                        {formatDate(e.date)}
                      </time>
                    </span>
                  </div>
                  <span className="dashboard-transaction-amount">
                    -<Money amount={e.amount} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ---------- Add expense modal ---------- */}
      {showAddExpense && (
        <Modal
          title="Add Expense"
          onClose={() => setShowAddExpense(false)}
        >
          <AddExpenseForm
            onSave={handleSaveExpense}
            onCancel={() => setShowAddExpense(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;