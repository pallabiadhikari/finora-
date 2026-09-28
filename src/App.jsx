import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './App.css';
import Header from './components/Header';
import Balance from './components/Balance';
import AddExpense from './components/AddExpense';
import AddIncome from './components/AddIncome';
import AddBudget from './components/AddBudget';
import ExpenseList from './components/ExpenseList';
import Login from './components/Login';
import Signup from './components/Signup';
import Landing from './components/Landing';
import About from './components/About';
import ProfileSettings from './components/ProfileSettings';

const navItems = [
  { key: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
  { key: 'transactions', label: 'Transactions', icon: 'fa-receipt' },
  { key: 'budgets', label: 'Budgets', icon: 'fa-wallet' },
  { key: 'reports', label: 'Reports', icon: 'fa-chart-bar' }
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('currentUser') || '');
  const [currentEmail, setCurrentEmail] = useState(() => localStorage.getItem('currentEmail') || 'admin@expenseflow.com');
  const [profilePhone, setProfilePhone] = useState(() => localStorage.getItem('profilePhone') || '');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
  const [showSettings, setShowSettings] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [filterCategory, setFilterCategory] = useState('All');
  const [incomes, setIncomes] = useState(() => JSON.parse(localStorage.getItem('incomes') || '[]'));
  const [budget, setBudget] = useState(() => JSON.parse(localStorage.getItem('budget') || 'null'));

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    if (budget) localStorage.setItem('budget', JSON.stringify(budget));
    else localStorage.removeItem('budget');
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleBrowserBack = () => {
      if (!isLoggedIn) return;
      if (window.history.state?.appTab) {
        setActiveTab(window.history.state.appTab);
        return;
      }
      setIsLoggedIn(false);
      setCurrentUser('');
      setShowLanding(false);
      setShowSignup(false);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
    };

    window.addEventListener('popstate', handleBrowserBack);
    return () => window.removeEventListener('popstate', handleBrowserBack);
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('currentEmail', currentEmail);
    localStorage.setItem('profilePhone', profilePhone);
    localStorage.setItem('theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [currentEmail, profilePhone, theme]);

  const handleLogin = (email, name) => {
    const displayName = name || email.split('@')[0];
    setCurrentUser(displayName);
    setCurrentEmail(email);
    setIsLoggedIn(true);
    window.history.pushState({ authenticated: true }, '', window.location.href);
    localStorage.setItem('currentUser', displayName);
  };

  const handleSignup = (email, name) => {
    const displayName = name || email.split('@')[0];
    setCurrentUser(displayName);
    setCurrentEmail(email);
    setIsLoggedIn(true);
    window.history.pushState({ authenticated: true }, '', window.location.href);
    setExpenses([]);
    setIncomes([]);
    setBudget(null);
    localStorage.removeItem('expenses');
    localStorage.removeItem('incomes');
    localStorage.removeItem('budget');
    localStorage.setItem('currentUser', displayName);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
  };

  const updateProfile = ({ name, email, phone, password }) => {
    const oldEmail = currentEmail;
    const adminProfile = JSON.parse(localStorage.getItem('adminProfile') || 'null');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((user) => user.email === oldEmail);
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], name, email };
      localStorage.setItem('users', JSON.stringify(users));
    } else {
      localStorage.setItem('adminProfile', JSON.stringify({ name, email, phone, password: adminProfile?.password || 'admin123' }));
    }
    setCurrentUser(name);
    setCurrentEmail(email);
    setProfilePhone(phone);
  };

  const changePassword = ({ currentPassword, newPassword }) => {
    const adminProfile = JSON.parse(localStorage.getItem('adminProfile') || 'null');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((user) => user.email === currentEmail);
    const savedPassword = userIndex >= 0 ? users[userIndex].password : (adminProfile?.password || 'admin123');
    if (currentPassword !== savedPassword) return 'Current password is incorrect.';
    if (newPassword.length < 6) return 'New password must be at least 6 characters.';
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], password: newPassword };
      localStorage.setItem('users', JSON.stringify(users));
    } else {
      localStorage.setItem('adminProfile', JSON.stringify({ name: currentUser, email: currentEmail, phone: profilePhone, password: newPassword }));
    }
    return '';
  };

  const exportData = () => {
    const workbook = XLSX.utils.book_new();
    const expenseRows = expenses.map(({ title, amount, category, date }) => ({ Title: title, Amount: amount, Category: category, Date: date }));
    const incomeRows = incomes.map(({ title, amount, date }) => ({ Source: title, Amount: amount, Date: date }));
    const budgetRows = budget
      ? [{ Amount: budget.amount, Duration: budget.duration === 'days' ? `${budget.durationDays} days` : budget.duration, Created: budget.createdAt }]
      : [{ Status: 'No budget set' }];

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(expenseRows), 'Expenses');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(incomeRows), 'Income');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(budgetRows), 'Budget');
    XLSX.writeFile(workbook, `expenseflow-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const addExpense = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const addIncome = (newIncome) => {
    setIncomes((prev) => [newIncome, ...prev]);
  };

  const focusExpenseForm = () => {
    setActiveTab('overview');
    window.setTimeout(() => document.getElementById('expense-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  const editExpense = (updatedExpense) => {
    setExpenses((prev) => prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp)));
  };

  const totalSpend = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount || 0), 0);
  const activeBudget = budget ? Number(budget.amount) : 0;
  const currentBalance = activeBudget + totalIncome - totalSpend;
  const monthlySpend = expenses.reduce((sum, expense) => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
      ? sum + Number(expense.amount || 0)
      : sum;
  }, 0);
  const budgetSpend = budget
    ? expenses.reduce((sum, expense) => {
      const expenseDate = new Date(expense.date);
      const budgetStart = new Date(budget.createdAt);
      const budgetEnd = new Date(budgetStart);
      budgetEnd.setDate(budgetEnd.getDate() + Number(budget.durationDays || 30));
      return expenseDate >= budgetStart && expenseDate <= budgetEnd ? sum + Number(expense.amount || 0) : sum;
    }, 0)
    : 0;
  const remainingBudget = activeBudget ? Math.max(activeBudget - budgetSpend, 0) : 0;
  const averageExpense = expenses.length ? totalSpend / expenses.length : 0;

  const categoryTotals = expenses.reduce((acc, expense) => {
    const key = expense.category || 'Other';
    acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const filteredExpenses = filterCategory === 'All' ? expenses : expenses.filter((exp) => exp.category === filterCategory);

  const recentExpenses = [...expenses].slice(0, 4);

  const reportBars = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthlyExpenses = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
      })
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const monthlyIncome = incomes
      .filter((income) => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === month && incomeDate.getFullYear() === year;
      })
      .reduce((sum, income) => sum + Number(income.amount || 0), 0);
    return { label: date.toLocaleDateString('en-US', { month: 'short' }), expenses: monthlyExpenses, income: monthlyIncome };
  });

  if (!isLoggedIn) {
    if (showAbout) {
      return (
        <About
          onBack={() => setShowAbout(false)}
          onLogin={() => {
            setShowAbout(false);
            setShowLanding(false);
            setShowSignup(false);
          }}
          onSignup={() => {
            setShowAbout(false);
            setShowLanding(false);
            setShowSignup(true);
          }}
        />
      );
    }

    if (showLanding) {
      return (
        <Landing
          onLogin={() => {
            setShowLanding(false);
            setShowSignup(false);
          }}
          onSignup={() => {
            setShowLanding(false);
            setShowSignup(true);
          }}
          onAbout={() => setShowAbout(true)}
        />
      );
    }

    return showSignup ? (
      <Signup
        onSignup={handleSignup}
        onSwitchToLogin={() => setShowSignup(false)}
        onBackToLanding={() => {
          setShowLanding(true);
          setShowSignup(false);
        }}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onSwitchToSignup={() => setShowSignup(true)}
        onBackToLanding={() => setShowLanding(true)}
      />
    );
  }

  const renderTabContent = () => {
    if (activeTab === 'transactions') {
      return (
        <div className="panel section-panel">
          <div className="section-header">
            <div>
              <span className="label">Transaction list</span>
              <h2>Recent activity</h2>
            </div>
          </div>
          <ExpenseList
            expenses={filteredExpenses}
            onDeleteExpense={deleteExpense}
            onEditExpense={editExpense}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            totalExpenses={expenses.length}
          />
        </div>
      );
    }

    if (activeTab === 'budgets') {
      return (
        <div className="panel section-panel">
          <div className="section-header">
            <div>
              <span className="label">Spending plan</span>
              <h2>Budget allocation</h2>
            </div>
          </div>
          <AddBudget budget={budget} onAddBudget={setBudget} onDeleteBudget={() => setBudget(null)} />
          <div className="budget-grid">
            {Object.entries(categoryTotals).map(([category, value]) => {
              const percent = budget ? (value / Number(budget.amount)) * 100 : 0;
              return (
                <div className="budget-card" key={category}>
                  <div className="budget-head">
                    <span>{category}</span>
                    <strong>Rs. {value.toFixed(2)}</strong>
                  </div>
                  <div className="mini-meter">
                    <span style={{ width: `${Math.min(percent, 100)}%` }}></span>
                  </div>
                  <small>{budget ? `${percent.toFixed(0)}% of your budget` : 'Set a budget to track this category'}</small>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeTab === 'reports') {
      return (
        <div className="panel section-panel">
          <div className="section-header">
            <div>
              <span className="label">Performance</span>
              <h2>Monthly spending trend</h2>
            </div>
          </div>
          <div className="report-totals"><div><span>Total income</span><strong>Rs. {totalIncome.toFixed(2)}</strong></div><div><span>Total expenses</span><strong>Rs. {totalSpend.toFixed(2)}</strong></div><div><span>Net balance</span><strong>Rs. {currentBalance.toFixed(2)}</strong></div></div>
          <div className="chart-card">
            <div className="chart-legend"><span><i className="chart-legend-dot chart-legend-dot--expense"></i>Expenses</span><span><i className="chart-legend-dot chart-legend-dot--income"></i>Income</span></div>
            <div className="chart-bars">
              {reportBars.map((bar) => (
                <div key={bar.label} className="chart-bar-group">
                  <div className="chart-bar-value">Rs. {Math.max(bar.expenses, bar.income).toFixed(0)}</div>
                  <div className="chart-bar-track">
                    <span className="chart-bar-expense" style={{ height: `${Math.min((bar.expenses / Math.max(...reportBars.map((item) => Math.max(item.expenses, item.income)), 1)) * 100, 100)}%` }}></span>
                    <span className="chart-bar-income" style={{ height: `${Math.min((bar.income / Math.max(...reportBars.map((item) => Math.max(item.expenses, item.income)), 1)) * 100, 100)}%` }}></span>
                  </div>
                  <div className="chart-bar-label">{bar.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="summary-grid">
          <div className="summary-card summary-card--primary">
            <span className="summary-label">Total spend</span>
            <strong>Rs. {totalSpend.toFixed(2)}</strong>
            <small>{expenses.length} entries tracked</small>
          </div>
          <div className="summary-card">
            <span className="summary-label">This month</span>
            <strong>Rs. {monthlySpend.toFixed(2)}</strong>
            <small>{activeBudget ? `${((monthlySpend / activeBudget) * 100 || 0).toFixed(0)}% of your budget` : 'No budget set yet'}</small>
          </div>
          <div className="summary-card">
            <span className="summary-label">Current balance</span>
            <strong>Rs. {currentBalance.toFixed(2)}</strong>
            <small>Income minus expenses</small>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total income</span>
            <strong>Rs. {totalIncome.toFixed(2)}</strong>
            <small>{incomes.length} income entries</small>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="panel">
            <div className="section-header">
              <div>
                <span className="label">Balance</span>
                <h2>Cash flow snapshot</h2>
              </div>
            </div>
            <Balance expenses={expenses} incomes={incomes} currentBalance={currentBalance} />
            <AddExpense onAddExpense={addExpense} />
            <AddIncome onAddIncome={addIncome} />
          </div>

          <div className="panel right-panel">
            <div className="section-header">
              <div>
                <span className="label">Spending mix</span>
                <h2>Category breakdown</h2>
              </div>
            </div>

            <div className="category-list">
              {Object.entries(categoryTotals).map(([category, value]) => (
                <div className="category-row" key={category}>
                  <div className="category-main">
                    <span className="dot" style={{ background: category === 'Food' ? '#ef4444' : category === 'Transport' ? '#2563eb' : category === 'Shopping' ? '#10b981' : '#f59e0b' }}></span>
                    <span>{category}</span>
                  </div>
                  <strong>Rs. {value.toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div className="quick-card">
              <div>
                <span className="label">Available budget</span>
                <strong>{budget ? `Rs. ${remainingBudget.toFixed(2)}` : 'No budget set'}</strong>
              </div>
              <button type="button" className="secondary-button" onClick={() => setActiveTab('budgets')}>{budget ? 'Manage plan' : 'Add budget'}</button>
            </div>

            <div className="recent-list">
              <div className="section-header compact">
                <div>
                  <span className="label">Latest</span>
                  <h2>Recent entries</h2>
                </div>
              </div>
              {recentExpenses.map((expense) => (
                <div className="recent-item" key={expense.id}>
                  <div>
                    <strong>{expense.title}</strong>
                    <span>{expense.category}</span>
                  </div>
                  <span className="amount-negative">-Rs. {Number(expense.amount || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="recent-list recent-income-list">
              <div className="section-header compact"><div><span className="label">Money in</span><h2>Recent income</h2></div></div>
              {incomes.slice(0, 4).map((income) => <div className="recent-item" key={income.id}><div><strong>{income.title}</strong><span>{income.date}</span></div><span className="amount-positive">+Rs. {Number(income.amount || 0).toFixed(2)}</span></div>)}
              {incomes.length === 0 && <p className="empty-inline">Income added from the form will appear here.</p>}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand sidebar-brand" type="button" onClick={() => setActiveTab('overview')} aria-label="Go to ExpenseFlow home">
          <span className="brand-mark"><i className="fas fa-wallet"></i></span>
          <span>ExpenseFlow</span>
        </button>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.key);
                window.history.pushState({ authenticated: true, appTab: item.key }, '', window.location.href);
              }}
            >
              <i className={`fas ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">{(currentUser || 'U').charAt(0).toUpperCase()}</div>
          <div>
            <strong>{currentUser || 'User'}</strong>
            <span>Account</span>
          </div>
          <button className="icon-button" type="button" aria-label="Settings" onClick={() => setShowSettings(true)}>
            <i className="fas fa-gear"></i>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Header onLogout={handleLogout} currentUser={currentUser} currentEmail={currentEmail} expenses={expenses} incomes={incomes} budget={budget} onExport={exportData} onOpenSettings={() => setShowSettings(true)} />

        <div className="page-header">
          <div>
            <span className="label">Financial overview</span>
            <h1>Welcome back, {currentUser || 'User'}</h1>
          </div>
          <button type="button" className="primary-button" onClick={focusExpenseForm}>
            <i className="fas fa-plus"></i>
            Add expense
          </button>
        </div>

        <section className="wallet-overview" aria-label="Personal wallet overview">
          <div className="wallet-metrics">
            <div className="wallet-metric wallet-metric--balance"><span>Current balance</span><strong>Rs. {currentBalance.toFixed(2)}</strong><small>Budget + income - expenses</small></div>
            <div className="wallet-metric"><span>Monthly budget</span><strong>{activeBudget ? `Rs. ${activeBudget.toFixed(2)}` : 'Not set'}</strong><small>{budget ? 'Fixed for this budget period' : 'Create a budget to start'}</small></div>
            <div className="wallet-metric"><span>Available budget left</span><strong>{activeBudget ? `Rs. ${remainingBudget.toFixed(2)}` : 'Not set'}</strong><small>{activeBudget ? 'Reduced by expenses only' : 'No budget available'}</small></div>
          </div>
        </section>

        {renderTabContent()}
      </main>
      {showSettings && <ProfileSettings profile={{ name: currentUser, email: currentEmail, phone: profilePhone }} theme={theme} onSaveProfile={updateProfile} onChangePassword={changePassword} onChangeTheme={setTheme} onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;