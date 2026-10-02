/* =====================================================
   Finora — AuthPage
   Wrapper shown when the user is not signed in.
   Renders either the LoginForm or the SignupForm and
   lets the user switch between them.

   Notes:
     • `initialMode` is read once on mount. The parent
       (App.jsx) unmounts and remounts this component when
       `view` changes, so a fresh `initialMode` is applied
       each time it's shown.
     • All form logic (validation, submission, toasts)
       lives in the child forms.

   Props:
     onAuthSuccess     → called with the user after login/signup
     initialMode       → 'login' | 'signup' (default 'login')
     onBackToLanding   → optional; shows the back button
   ===================================================== */

import { useState } from 'react';
import LoginForm from '../../components/Auth/LoginForm';
import SignupForm from '../../components/Auth/SignupForm';
import Logo from '../../components/Logo/Logo';

function AuthPage({
  onAuthSuccess,
  initialMode = 'login',
  onBackToLanding,
}) {
  const [mode, setMode] = useState(initialMode);

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* ---------- Back to landing ---------- */}
        {onBackToLanding && (
          <button
            type="button"
            className="auth-back"
            onClick={onBackToLanding}
            aria-label="Back to home"
          >
            <i className="fas fa-arrow-left" aria-hidden="true"></i>
            <span>Back to home</span>
          </button>
        )}

        {/* ---------- Brand ---------- */}
        <div className="auth-brand">
          <Logo size={36} decorative />
          <span className="auth-brand-name">Finora</span>
        </div>

        {/* ---------- Form ---------- */}
        {mode === 'login' ? (
          <LoginForm
            onSuccess={onAuthSuccess}
            onSwitchToSignup={() => setMode('signup')}
          />
        ) : (
          <SignupForm
            onSuccess={onAuthSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
}

export default AuthPage;