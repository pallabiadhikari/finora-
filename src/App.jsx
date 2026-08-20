import { useEffect, useMemo, useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import { categories } from './data/categories';
import './App.css';

const categoryIcons = { Food: 'fa-utensils', Transport: 'fa-car', Shopping: 'fa-bag-shopping', Bills: 'fa-file-invoice', Entertainment: 'fa-film', Health: 'fa-heart-pulse', Education: 'fa-graduation-cap', Travel: 'fa-plane', Other: 'fa-tag' };
const currency = (value) => `Rs. ${Math.abs(Number(value) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const dateLabel = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
function Icon({ name }) { return <i className={`fas ${name}`} aria-hidden="true" />; }

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('currentUser') || '';
  });
  const [currentUserEmail, setCurrentUserEmail] = useState(() => localStorage.getItem('currentUserEmail') || '');

  const [showSignup, setShowSignup] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('expense');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const initialUserKey = (currentUserEmail || currentUser || 'guest').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem(`transactions-${initialUserKey}`) || '[]'));
  const [budget, setBudget] = useState(() => Number(localStorage.getItem(`budget-${initialUserKey}`)) || 30000);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), note: '' });

  const userKey = (currentUserEmail || currentUser || 'guest').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  useEffect(() => { if (currentUser) localStorage.setItem(`transactions-${userKey}`, JSON.stringify(transactions)); }, [currentUser, transactions, userKey]);
  useEffect(() => { if (currentUser) localStorage.setItem(`budget-${userKey}`, budget); }, [budget, currentUser, userKey]);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', currentUser);
    }
  }, [currentUser]);

  const handleLogin = (email, name) => {
    setIsLoggedIn(true);
    const displayName = name || email.split('@')[0];
    const nextUserKey = email.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setCurrentUser(displayName);
    setCurrentUserEmail(email);
    setTransactions(JSON.parse(localStorage.getItem(`transactions-${nextUserKey}`) || '[]'));
    setBudget(Number(localStorage.getItem(`budget-${nextUserKey}`)) || 30000);
    localStorage.setItem('currentUser', displayName);
    localStorage.setItem('currentUserEmail', email);
  };

  const handleSignup = (email, name) => {
    setIsLoggedIn(true);
    const displayName = name || email.split('@')[0];
    const nextUserKey = email.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setCurrentUser(displayName);
    setCurrentUserEmail(email);
    setTransactions(JSON.parse(localStorage.getItem(`transactions-${nextUserKey}`) || '[]'));
    setBudget(Number(localStorage.getItem(`budget-${nextUserKey}`)) || 30000);
    localStorage.setItem('currentUser', displayName);
    localStorage.setItem('currentUserEmail', email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setCurrentUserEmail('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('isLoggedIn');
  };

  const income = useMemo(() => transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0), [transactions]);
  const expenses = useMemo(() => transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0), [transactions]);
  const visibleTransactions = useMemo(() => transactions.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'All' || item.category === filter || item.type === filter)), [transactions, query, filter]);
  const monthSpent = transactions.filter((item) => item.type === 'expense' && new Date(item.date).getMonth() === new Date().getMonth()).reduce((sum, item) => sum + item.amount, 0);
  const firstName = (currentUser || 'Pallabi').split(' ')[0];
  const openForm = (type = 'expense') => { setFormType(type); setForm({ title: '', amount: '', category: type === 'income' ? 'Salary' : 'Food', date: new Date().toISOString().slice(0, 10), note: '' }); setShowForm(true); };
  const saveTransaction = (event) => { event.preventDefault(); if (!form.title.trim() || Number(form.amount) <= 0) return; setTransactions([{ ...form, id: Date.now(), type: formType, title: form.title.trim(), amount: Number(form.amount), date: new Date(form.date).toISOString() }, ...transactions]); setShowForm(false); };
  const deleteTransaction = (id) => setTransactions(transactions.filter((item) => item.id !== id));

  // Show Login or Signup
  if (!isLoggedIn) {
    if (showSignup) {
      return (
        <Signup 
          onSignup={handleSignup} 
          onSwitchToLogin={() => setShowSignup(false)} 
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setShowSignup(true)} 
      />
    );
  }

  const navItems = [['dashboard', 'fa-grid-2', 'Overview'], ['transactions', 'fa-receipt', 'Transactions'], ['budget', 'fa-wallet', 'Budget'], ['reports', 'fa-chart-pie', 'Reports'], ['settings', 'fa-sliders', 'Settings']];
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark"><Icon name="fa-leaf" /></span><span>finora</span></div><p className="tagline">Spend smarter. Live clearer.</p><nav aria-label="Main navigation">{navItems.map(([id, icon, label]) => <button className={activeView === id ? 'nav-item active' : 'nav-item'} key={id} onClick={() => setActiveView(id)}><Icon name={icon} />{label}</button>)}</nav><div className="sidebar-footer"><div className="avatar">{firstName[0]}</div><div><strong>{firstName}</strong><span>Personal account</span></div><button className="icon-button" onClick={handleLogout} aria-label="Log out"><Icon name="fa-arrow-right-from-bracket" /></button></div></aside><main className="main-content"><header className="topbar"><div><span className="eyebrow">{activeView === 'dashboard' ? 'Overview' : activeView}</span><h1>{activeView === 'dashboard' ? `Good morning, ${firstName}` : activeView[0].toUpperCase() + activeView.slice(1)}</h1></div><div className="topbar-actions"><button className="notification-button" aria-label="Notifications"><Icon name="fa-bell" /><span>3</span></button><button className="primary-button" onClick={() => openForm()}><Icon name="fa-plus" /> Add transaction</button></div></header>{activeView === 'dashboard' && <Dashboard income={income} expenses={expenses} budget={budget} monthSpent={monthSpent} transactions={transactions} setActiveView={setActiveView} onDelete={deleteTransaction} onAdd={() => openForm()} />}{activeView === 'transactions' && <section className="panel transactions-page"><div className="toolbar"><div className="search-field"><Icon name="fa-magnifying-glass" /><input aria-label="Search transactions" placeholder="Search transactions..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter transactions"><option>All</option><option>income</option>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select></div><TransactionRows items={visibleTransactions} onDelete={deleteTransaction} /></section>}{activeView === 'budget' && <section className="panel budget-page"><span className="eyebrow">Your spending limit</span><h2>Monthly budget</h2><div className="budget-edit"><input type="number" value={budget} onChange={(event) => setBudget(Number(event.target.value))} aria-label="Monthly budget" /><span>Rs.</span></div><div className="large-progress progress"><span style={{ width: `${Math.min(monthSpent / budget * 100, 100)}%` }} /></div><div className="budget-summary"><div><span>Spent</span><strong>{currency(monthSpent)}</strong></div><div><span>Remaining</span><strong>{currency(Math.max(budget - monthSpent, 0))}</strong></div><div><span>Used</span><strong>{Math.round(monthSpent / budget * 100)}%</strong></div></div></section>}{activeView === 'reports' && <Reports transactions={transactions} />}{activeView === 'settings' && <section className="panel settings-page"><span className="eyebrow">Account</span><h2>Profile & preferences</h2><div className="settings-row"><div><strong>{currentUser}</strong><span>Profile name</span></div><span className="muted">Local demo account</span></div><div className="settings-row"><div><strong>NPR / Rs.</strong><span>Currency</span></div><select aria-label="Currency"><option>NPR / Rs.</option><option>USD / $</option></select></div><button className="danger-button" onClick={() => { localStorage.clear(); window.location.reload(); }}><Icon name="fa-trash" /> Clear local data</button></section>}</main>{showForm && <TransactionForm form={form} formType={formType} setForm={setForm} setFormType={setFormType} onClose={() => setShowForm(false)} onSave={saveTransaction} />}</div>;
function Dashboard({ income, expenses, budget, monthSpent, transactions, setActiveView, onDelete, onAdd }) { return <><p className="page-intro">Here’s your financial overview for this month.</p><section className="hero-balance"><div><span className="label inverse">Total balance</span><div className="balance-amount">{currency(income - expenses)}</div><span className="balance-change"><Icon name="fa-arrow-trend-up" /> 8.4% this month</span></div><div className="balance-orbit"><Icon name="fa-chart-line" /></div></section><section className="stat-grid"><Stat label="Total income" value={income} icon="fa-arrow-down-to-bracket" tone="positive" /><Stat label="Total expenses" value={expenses} icon="fa-arrow-up-from-bracket" tone="negative" /><Stat label="Monthly budget" value={budget} icon="fa-bullseye" tone="neutral" /><Stat label="Transactions" value={transactions.length} icon="fa-receipt" tone="neutral" isCount /></section><div className="content-grid"><section className="panel recent-panel"><div className="section-heading"><div><span className="eyebrow">Activity</span><h2>Recent transactions</h2></div><button className="text-button" onClick={() => setActiveView('transactions')}>View all <Icon name="fa-arrow-right" /></button></div><TransactionRows items={transactions.slice(0, 4)} onDelete={onDelete} /></section><section className="panel budget-panel"><div className="section-heading"><div><span className="eyebrow">This month</span><h2>Budget progress</h2></div><Icon name="fa-ellipsis" /></div><div className="budget-figure"><strong>{currency(monthSpent)}</strong><span>of {currency(budget)}</span></div><div className="progress"><span style={{ width: `${Math.min(monthSpent / budget * 100, 100)}%` }} /></div><div className="budget-meta"><span>{Math.max(budget - monthSpent, 0) ? `${currency(budget - monthSpent)} remaining` : 'Budget exceeded'}</span><strong>{Math.round(monthSpent / budget * 100)}%</strong></div><button className="outline-button" onClick={() => setActiveView('budget')}>Manage budget</button></section></div><button className="floating-add" onClick={onAdd}><Icon name="fa-plus" /> Add transaction</button></>; }
function Stat({ label, value, icon, tone, isCount }) { return <div className="stat-card"><span className={`stat-icon ${tone}`}><Icon name={icon} /></span><div><span className="label">{label}</span><strong>{isCount ? value : currency(value)}</strong></div></div>; }
function TransactionRows({ items, onDelete }) { return items.length ? <div className="transaction-list">{items.map((item) => <div className="transaction-row" key={item.id}><span className={`transaction-icon ${item.type}`}><Icon name={item.type === 'income' ? 'fa-arrow-down' : (categoryIcons[item.category] || 'fa-tag')} /></span><div className="transaction-info"><strong>{item.title}</strong><span>{item.category} · {dateLabel(item.date)}</span></div><strong className={item.type === 'income' ? 'amount positive-text' : 'amount'}>{item.type === 'income' ? '+' : '-'} {currency(item.amount)}</strong><button className="icon-button subtle" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.title}`}><Icon name="fa-trash-can" /></button></div>)}</div> : <div className="empty-state"><Icon name="fa-receipt" /><p>No transactions yet. Add your first transaction to get started.</p></div>; }
function Reports({ transactions }) { const byCategory = transactions.filter((item) => item.type === 'expense').reduce((result, item) => ({ ...result, [item.category]: (result[item.category] || 0) + item.amount }), {}); const max = Math.max(...Object.values(byCategory), 1); return <div className="reports-grid"><section className="panel"><span className="eyebrow">Where it goes</span><h2>Spending by category</h2>{Object.entries(byCategory).slice(0, 5).map(([name, value]) => <div className="category-bar" key={name}><div><span>{name}</span><strong>{currency(value)}</strong></div><div className="progress"><span style={{ width: `${value / max * 100}%` }} /></div></div>)}</section><section className="panel insight-panel"><span className="eyebrow">Finora insight</span><Icon name="fa-lightbulb" /><h2>{Object.keys(byCategory)[0] || 'Your finances'} {Object.keys(byCategory).length ? 'is your highest spending category' : 'will appear here'}</h2><p>Small, clear patterns make better financial decisions. Keep adding transactions to make your monthly view more useful.</p></section></div>; }
function TransactionForm({ form, formType, setForm, setFormType, onClose, onSave }) { const options = formType === 'income' ? ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'] : [...categories.map((item) => item.name), 'Travel']; return <div className="modal-backdrop"><form className="modal" onSubmit={onSave}><div className="modal-header"><div><span className="eyebrow">New entry</span><h2>Add {formType}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><Icon name="fa-xmark" /></button></div><div className="type-switch"><button type="button" className={formType === 'expense' ? 'selected' : ''} onClick={() => setFormType('expense')}>Expense</button><button type="button" className={formType === 'income' ? 'selected income' : ''} onClick={() => setFormType('income')}>Income</button></div><label>Amount<input required type="number" min="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0" /></label><label>Title<input required minLength="2" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Groceries" /></label><div className="form-row"><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{options.map((item) => <option key={item}>{item}</option>)}</select></label><label>Date<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label></div><label>Note <span className="muted">Optional</span><textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} rows="2" /></label><button className="primary-button full-width" type="submit">Save transaction</button></form></div>; }
}

export default App;