/* =====================================================
   Finora — Root application component
   Handles: session load, view routing (landing / auth /
   app), page routing inside the shell, quick-add modal,
   more-menu, and logout.
   ===================================================== */

import { useEffect, useState } from 'react';

// --- Layout ---
import Sidebar from './components/Sidebar/Sidebar';
import TopBar from './components/Navbar/TopBar';
import BottomNav from './components/BottomNav/BottomNav';
import MoreMenu from './components/BottomNav/MoreMenu';
import Modal from './components/Modal/Modal';

// --- Pages ---
import Dashboard from './pages/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions';
import Income from './pages/Income/Income';
import Insights from './pages/Insights/Insights';
import Budgets from './pages/Budgets/Budgets';
import Goals from './pages/Goals/Goals';
import Settings from './pages/Settings/Settings';
import Admin from './pages/Admin/Admin';
import AuthPage from './pages/Settings/AuthPage';
import FirstTimeSetup from './pages/Settings/FirstTimeSetup';
import Landing from './pages/Landing/Landing';
import ResetPasswordPage from './pages/Settings/ResetPasswordPage';

// --- Forms ---
import AddExpenseForm from './components/ExpenseCard/AddExpenseForm';

// --- Utilities ---
import { addExpense } from './utils/storage';
import { getMe, clearToken, getToken } from './utils/api';
import { setActiveEmail, clearActiveEmail } from './utils/activeUser';
import {
  ensureWelcomeNotification,
  ensureDailyReminder,
} from './utils/notifications';

function App() {
  // ---------- Session & view state ----------
  const [session, setSession] = useState(null);

  // Which inner page is active inside the app shell
  const [activePage, setActivePage] = useState(
    () => localStorage.getItem('finora.activePage') || 'overview'
  );

  // Top-level view: 'landing' | 'auth-login' | 'auth-signup' | 'app'
  const [view, setView] = useState(
    () => localStorage.getItem('finora.view') || 'landing'
  );

  const [loadingSession, setLoadingSession] = useState(true);

  // ---------- UI state ----------
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // TODO: hook this up to a real first-run check if FirstTimeSetup
  //       should ever show. Currently always true → wizard skipped.
  const [setupDone, setSetupDone] = useState(true);

  // If the URL has ?token=..., we're on a password-reset link
const [resetToken, setResetToken] = useState(
  () => new URLSearchParams(window.location.search).get('token') || ''
);

  // ---------- Session: load on mount ----------
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        setLoadingSession(false);
        return;
      }

      try {
        const { user } = await getMe();
        setSession(user);
        setActiveEmail(user.email);
        setView('app');
      } catch {
        // Token is invalid or expired — start fresh
        clearToken();
      }

      setLoadingSession(false);
    })();
  }, []);

  // ---------- Notifications: welcome + daily reminder ----------
  useEffect(() => {
    if (session?.email) {
      ensureWelcomeNotification(session.email, session.name);
      ensureDailyReminder(session.email);
    }
  }, [session]);

  // ---------- Sync session when profile is edited elsewhere ----------
  useEffect(() => {
    const refresh = (e) => {
      if (e.detail) {
        setSession((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('finora:user-updated', refresh);
    return () => window.removeEventListener('finora:user-updated', refresh);
  }, []);

  // ---------- Persist active page + view ----------
  useEffect(() => {
    localStorage.setItem('finora.activePage', activePage);
  }, [activePage]);

  useEffect(() => {
    localStorage.setItem('finora.view', view);
  }, [view]);

  // ---------- Kick non-admins off the admin page ----------
  useEffect(() => {
    if (activePage === 'admin' && session && !session.isAdmin) {
      setActivePage('overview');
    }
  }, [activePage, session]);

  // ---------- Logout (defined before use) ----------
  function handleLogout() {
    clearToken();
    clearActiveEmail();
    setSession(null);
    setActivePage('overview');
    setView('landing');
    localStorage.removeItem('finora.activePage');
    localStorage.removeItem('finora.view');
  }

  // ---------- Quick-add expense (from bottom-nav + button) ----------
  const handleQuickAddSave = async (expense) => {
    await addExpense(expense);
    setShowQuickAdd(false);
    setRefreshKey((k) => k + 1);
    if (activePage !== 'overview') setActivePage('overview');
  };

  // ---------- Page router inside the app shell ----------
  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Dashboard key={refreshKey} user={session} />;
      case 'transactions':
        return <Transactions />;
      case 'income':
        return <Income />;
      case 'insights':
        return <Insights />;
      case 'budgets':
        return <Budgets />;
      case 'goals':
        return <Goals />;
      case 'settings':
        return <Settings onLogout={handleLogout} />;
      case 'admin':
        return session.isAdmin ? (
          <Admin />
        ) : (
          // Safety net — the useEffect above already redirects,
          // but this prevents a flash of the wrong content.
          <Dashboard key={refreshKey} user={session} />
        );
      default:
        return <Dashboard key={refreshKey} user={session} />;
    }
  };

  // ---------- Password reset link ----------
if (resetToken) {
  return (
    <ResetPasswordPage
      token={resetToken}
      onDone={() => {
        // Clear the token from the URL and go to sign-in
        window.history.replaceState({}, '', '/');
        setResetToken('');
        setView('auth-login');
      }}
      onBackToLogin={() => {
        window.history.replaceState({}, '', '/');
        setResetToken('');
        setView('auth-login');
      }}
    />
  );
}

  // ===================================================
  // Render — early returns for loading / landing / auth
  // ===================================================

  if (loadingSession) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p
            style={{
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}
          >
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!session && view === 'landing') {
    return (
      <Landing
        onLogin={() => setView('auth-login')}
        onSignup={() => setView('auth-signup')}
      />
    );
  }

  if (!session) {
    return (
      <AuthPage
        initialMode={view === 'auth-signup' ? 'signup' : 'login'}
        onBackToLanding={() => setView('landing')}
        onAuthSuccess={(user) => {
          setSession(user);
          setActiveEmail(user.email);
          setActivePage('overview');
          localStorage.setItem('finora.activePage', 'overview');
          setView('app');
        }}
      />
    );
  }

  if (!setupDone) {
    return (
      <FirstTimeSetup
        user={session}
        onComplete={() => {
          setSetupDone(true);
          setRefreshKey((k) => k + 1);
        }}
      />
    );
  }

  // ===================================================
  // Render — main app shell
  // ===================================================

  return (
    <div className="app-shell">
      {/* Keyboard shortcut for screen-reader + tab users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isAdmin={session.isAdmin}
      />

      <main className="app-main" id="main-content" tabIndex="-1">
        <TopBar
          userName={session.name}
          userEmail={session.email}
          userPhoto={session.photo || ''}
          onLogout={handleLogout}
          onNavigate={setActivePage}
        />
        <div className="app-content">{renderPage()}</div>
      </main>

      <BottomNav
        activePage={activePage}
        onNavigate={setActivePage}
        onAddClick={() => setShowQuickAdd(true)}
        onMoreClick={() => setShowMore(true)}
      />

      {showMore && (
        <MoreMenu
          onClose={() => setShowMore(false)}
          onNavigate={setActivePage}
          onOpenSettings={() => setActivePage('settings')}
        />
      )}

      {showQuickAdd && (
        <Modal title="Add Expense" onClose={() => setShowQuickAdd(false)}>
          <AddExpenseForm
            onSave={handleQuickAddSave}
            onCancel={() => setShowQuickAdd(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default App;