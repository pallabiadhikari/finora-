/* =====================================================
   Finora — LoginForm
   Email + password sign-in form.

   Handles:
     • Client-side validation (required + email format)
     • "Remember me" → localStorage vs sessionStorage
     • "Not registered" state → offers to switch to signup
     • Wrong password → offers password reset
     • Forgot-password modal

   Props:
     onSuccess         → called with the logged-in user object
     onSwitchToSignup  → called when the user clicks "Create one"
   ===================================================== */

import { useState } from 'react';
import { useToast } from '../Toast/ToastContext';
import ForgotPasswordModal from './ForgotPasswordModal';
import { loginUser, setToken } from '../../utils/api';
import { isValidEmail } from '../../utils/validators';
import { setActiveEmail } from '../../utils/activeUser';

function LoginForm({ onSuccess, onSwitchToSignup }) {
  const { showToast } = useToast();

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // Status
  const [error, setError] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);
  const [saving, setSaving] = useState(false);

  // Clear the "not registered" banner whenever the email changes —
  // it referred to the previous email, so it's stale now.
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (notRegistered) setNotRegistered(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard against double-submit (Enter spam while a request is in flight)
    if (saving) return;

    setError('');
    setNotRegistered(false);

    const cleanEmail = email.trim().toLowerCase();
    // Passwords stay exact — never trim or alter case.
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSaving(true);

    try {
      const { token, user } = await loginUser({
        email: cleanEmail,
        password: cleanPassword,
      });

      // Store the token in the right storage based on "Remember me",
      // and remember which account is active for per-user storage.
      setToken(token, remember);
      setActiveEmail(cleanEmail);

      showToast('Signed in successfully', 'success');
      onSuccess(user);
    } catch (err) {
      // Map different error shapes to the right UI state
      if (
        err.status === 404 ||
        err.message === 'not-registered' ||
        err.data?.error === 'not-registered'
      ) {
        setNotRegistered(true);
      } else if (err.message === 'Incorrect password.') {
        setError('Incorrect password. Try again, or reset it below.');
      } else {
        setError(err.message || 'Could not sign in.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1 className="auth-title">Sign in to Finora</h1>
        <p className="auth-subtitle">
          Welcome back. Let's see where your money went.
        </p>

        {/* role="alert" so screen readers announce it immediately */}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {notRegistered && (
          <div className="form-info">
            <i className="fas fa-circle-info" aria-hidden="true"></i>
            <div>
              <strong>This email isn't registered yet.</strong>
              <p>
                Would you like to{' '}
                <button
                  type="button"
                  className="text-button"
                  onClick={onSwitchToSignup}
                >
                  create an account
                </button>
                ?
              </p>
            </div>
          </div>
        )}

        {/* ---------- Email ---------- */}
        <div className="form-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            disabled={saving}
          />
        </div>

        {/* ---------- Password ---------- */}
        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <div className="password-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={saving}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              <i
                className={`fas ${
                  showPassword ? 'fa-eye-slash' : 'fa-eye'
                }`}
                aria-hidden="true"
              ></i>
            </button>
          </div>
        </div>

        {/* ---------- Remember + Forgot ---------- */}
        <div className="auth-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={saving}
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            className="text-button"
            onClick={() => setShowForgot(true)}
          >
            Forgot password?
          </button>
        </div>

        {/* ---------- Submit ---------- */}
        <button
          type="submit"
          className="button button--primary auth-submit"
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? (
            <>
              <i
                className="fas fa-circle-notch fa-spin"
                aria-hidden="true"
              ></i>{' '}
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </button>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-button"
            onClick={onSwitchToSignup}
          >
            Create one
          </button>
        </p>
      </form>

      {showForgot && (
        <ForgotPasswordModal onClose={() => setShowForgot(false)} />
      )}
    </>
  );
}

export default LoginForm;