/* =====================================================
   Finora — Insights
   Analytics page showing:
     • Personalised insight messages
     • Income vs Expense vertical bars
     • Category breakdown (this month)
     • Weekly spending chart (this month)

   All numbers come from utils/calculations.
   ===================================================== */

import { useEffect, useMemo, useState } from 'react';
import Money from '../../components/Button/Money';
import {
  getSpendingByCategory,
  getSpendingByWeek,
  generateInsights,
  getTotalSpent,
  getTotalIncome,
  getExpensesForMonth,
} from '../../utils/calculations';
import { getExpenses, getIncomes } from '../../utils/storage';

// ---------- Helpers ----------

// Safe numeric conversion
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// Clamp a percentage into [0, 100] and round it, guarding against NaN
function safePercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function Insights() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // ---------- Load data ----------
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
        console.error('Insights load error:', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Derived data (all memoized) ----------
  const monthExpenses = useMemo(
    () => getExpensesForMonth(expenses),
    [expenses]
  );

  const categoryData = useMemo(
    () => getSpendingByCategory(monthExpenses),
    [monthExpenses]
  );

  const weekData = useMemo(
    () => getSpendingByWeek(expenses),
    [expenses]
  );

  const insights = useMemo(
    () => generateInsights(expenses),
    [expenses]
  );

  const totalSpent = useMemo(
    () => toNumber(getTotalSpent(expenses)),
    [expenses]
  );

  const totalIncome = useMemo(
    () => toNumber(getTotalIncome(incomes)),
    [incomes]
  );

  // Bar scales — the `1` floor keeps division safe when everything is 0
  const maxWeekAmount = useMemo(
    () => Math.max(...weekData.map((w) => toNumber(w.amount)), 1),
    [weekData]
  );

  const maxBarValue = Math.max(totalSpent, totalIncome, 1);

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Insights</h1>
          <p className="page-subtitle">Loading…</p>
        </div>
      </div>
    );
  }

  // ---------- Load error ----------
  if (loadError) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Insights</h1>
          <p className="page-subtitle">
            Understand your spending at a glance
          </p>
        </div>
        <div className="empty-state">
          <i
            className="fas fa-triangle-exclamation empty-state-icon"
            aria-hidden="true"
          ></i>
          <h2 className="empty-state-title">
            We couldn't load your insights
          </h2>
          <p className="empty-state-text">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Insights</h1>
        <p className="page-subtitle">
          Understand your spending at a glance
        </p>
      </div>

      {/* ---------- Insight messages ---------- */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Your insights</h2>
        {insights.length === 0 ? (
          <p className="empty-inline">
            Add a few expenses over time to see personalised insights
            here.
          </p>
        ) : (
          <ul className="insight-list">
            {insights.map((text) => (
              <li key={text} className="insight-item">
                <i
                  className="fas fa-lightbulb"
                  aria-hidden="true"
                ></i>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------- Income vs Expense ---------- */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">
          Income vs Expense
        </h2>
        <div className="insight-bars">
          <div className="insight-bar-group">
            <div
              className="insight-bar-track"
              role="progressbar"
              aria-valuenow={safePercent(
                (totalIncome / maxBarValue) * 100
              )}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Income: ${totalIncome}`}
            >
              <span
                className="insight-bar insight-bar--income"
                style={{
                  height: `${safePercent(
                    (totalIncome / maxBarValue) * 100
                  )}%`,
                }}
              />
            </div>
            <span className="insight-bar-label">Income</span>
            <span className="insight-bar-value">
              <Money amount={totalIncome} />
            </span>
          </div>

          <div className="insight-bar-group">
            <div
              className="insight-bar-track"
              role="progressbar"
              aria-valuenow={safePercent(
                (totalSpent / maxBarValue) * 100
              )}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Expenses: ${totalSpent}`}
            >
              <span
                className="insight-bar insight-bar--expense"
                style={{
                  height: `${safePercent(
                    (totalSpent / maxBarValue) * 100
                  )}%`,
                }}
              />
            </div>
            <span className="insight-bar-label">Expenses</span>
            <span className="insight-bar-value">
              <Money amount={totalSpent} />
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Spending by category ---------- */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">
          Spending by Category (This Month)
        </h2>
        {categoryData.length === 0 ? (
          <p className="empty-inline">
            No expenses recorded this month.
          </p>
        ) : (
          <ul className="category-breakdown">
            {categoryData.map((c) => {
              const percent = safePercent(c.percent);
              return (
                <li key={c.id} className="category-breakdown-item">
                  <div className="category-breakdown-head">
                    <span className="category-breakdown-label">
                      <i
                        className={`fas ${c.icon}`}
                        aria-hidden="true"
                      ></i>
                      {c.label}
                    </span>
                    <span className="category-breakdown-percent">
                      {percent}%
                    </span>
                  </div>
                  <div
                    className="category-breakdown-track"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${c.label}: ${percent}%`}
                  >
                    <span
                      className="category-breakdown-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="category-breakdown-amount">
                    <Money amount={c.amount} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ---------- Weekly chart ---------- */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">
          Spending This Month
        </h2>
        {weekData.length === 0 ? (
          <p className="empty-inline">No spending recorded this month.</p>
        ) : (
          <div className="week-chart">
            {weekData.map((w) => {
              const amount = toNumber(w.amount);
              const percent = safePercent(
                (amount / maxWeekAmount) * 100
              );
              return (
                <div key={w.week} className="week-chart-group">
                  <div
                    className="week-chart-track"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Week ${w.week}: ${amount}`}
                  >
                    <span
                      className="week-chart-bar"
                      style={{ height: `${percent}%` }}
                    />
                  </div>
                  <span className="week-chart-label">W{w.week}</span>
                  <span className="week-chart-value">
                    <Money amount={amount} />
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Insights;