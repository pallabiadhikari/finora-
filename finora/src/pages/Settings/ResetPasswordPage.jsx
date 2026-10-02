/* =====================================================
   Finora — ResetPasswordPage
   Shown when the user lands on a reset-password link
   (?token=... in the URL).

   Two states:
     • form   — pick a new password
     • done   — confirmation screen with a "Go to sign in"

   The actual password change is handled entirely by the
   backend via resetPassword(token, password). We don't
   touch local storage here — that's the server's job.

   Props:
     token          → the reset token from the URL
     onDone         → called after a successful reset
     onBackToLogin  → called if the user cancels or clicks
                      "Go to sign in" (fallback for onDone)
   ===================================================== */

import { useMemo, useState } from 'react';
import Logo from '../../components/Logo/Logo';
import { resetPassword } from '../../utils/api';
import { getPasswordRules } from '../../utils/validators';

// Labels for each rule, in display order
const RULE_LABELS = {
  length: 'At least 8 characters',
  upper: 'One uppercase letter (A–Z)',
  lower: 'One lowercase letter (a–z)',
  number: 'One number (0–9)',
  special: 'One special character (!@#$…)',
  noSpaces: 'No leading or trailing spaces',
};

const RULE_ORDER = [
  'length',
  'upper',
  'lower',
  'number',
  'special',
  'noSpaces',
];

function ResetPasswordPage({ token, onDone, onBackToLogin }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // ---------- Rules ----------
  const rules = useMemo(
  () => getPasswordRules(password),
  [password]
);
  const allValid = useMemo(
    () => RULE_ORDER.every((key) => rules[key]),
    [rules]
  );

  const passwordMismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    allValid && password === confirm && !saving && Boolean(token);

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setError('');

    if (!token) {
      setError(
        'Missing reset token. Please use the link from your email.'
      );
      return;
    }
    if (!allValid) {
      setError('Password does not meet all requirements.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      // The backend updates the hashed password on the server.
      // We don't need to touch local storage at all.
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Could not reset password.');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Done state ----------
  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <Logo size={36} decorative />
            <span className="auth-brand-name">Finora</span>
          </div>
          <div className="forgot-success">
            <i
              className="fas fa-circle-check"
              aria-hidden="true"
            ></i>
            <h3>Password updated</h3>
            <p>You can now sign in with your new password.</p>
            <button
              type="button"
              className="button button--primary"
              onClick={onDone || onBackToLogin}
            >
              Go to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Form state ----------
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Logo size={36} decorative />
          <span className="auth-brand-name">Finora</span>
        </div>

        <h1 className="auth-title">Set a new password</h1>
        <p className="auth-subtitle">
          Choose a strong password you haven't used before.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          {/* ---------- New password ---------- */}
          <div className="form-field">
            <label htmlFor="reset-password">New password</label>
            <div className="password-wrap">
              <input
                id="reset-password"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={saving}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShow((v) => !v)}
                aria-label={
                  show ? 'Hide password' : 'Show password'
                }
                title={show ? 'Hide password' : 'Show password'}
              >
                <i
                  className={`fas ${
                    show ? 'fa-eye-slash' : 'fa-eye'
                  }`}
                  aria-hidden="true"
                ></i>
              </button>
            </div>
          </div>

          {/* ---------- Confirm password ---------- */}
          <div className="form-field">
            <label htmlFor="reset-confirm">Confirm password</label>
            <div className="password-wrap">
              <input
                id="reset-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={saving}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={
                  showConfirm ? 'Hide password' : 'Show password'
                }
                title={
                  showConfirm ? 'Hide password' : 'Show password'
                }
              >
                <i
                  className={`fas ${
                    showConfirm ? 'fa-eye-slash' : 'fa-eye'
                  }`}
                  aria-hidden="true"
                ></i>
              </button>
            </div>
            {passwordMismatch && (
              <p className="password-mismatch">
                Passwords do not match yet.
              </p>
            )}
          </div>

          {/* ---------- Password rules ---------- */}
          <ul className="password-rules">
            {RULE_ORDER.map((key) => {
              const ok = rules[key];
              return (
                <li key={key} className={ok ? 'ok' : ''}>
                  <i
                    className={`fas ${
                      ok ? 'fa-check' : 'fa-xmark'
                    }`}
                    aria-hidden="true"
                  ></i>
                  {RULE_LABELS[key]}
                </li>
              );
            })}
          </ul>

          {/* Screen-reader-only summary when rules change */}
          <p className="sr-only" aria-live="polite">
            {allValid
              ? 'All password requirements met.'
              : 'Password does not yet meet all requirements.'}
          </p>

          {/* ---------- Submit ---------- */}
          <button
            type="submit"
            className="button button--primary auth-submit"
            disabled={!canSubmit}
            aria-busy={saving}
          >
            {saving ? (
              <>
                <i
                  className="fas fa-circle-notch fa-spin"
                  aria-hidden="true"
                ></i>{' '}
                Saving…
              </>
            ) : (
              'Update password'
            )}
          </button>

          {/* Hint about why the button may be disabled */}
          {!canSubmit && !saving && (password || confirm) && (
            <p className="field-hint field-hint--warn">
              {!allValid
                ? 'Complete all password rules to continue.'
                : 'Passwords must match to continue.'}
            </p>
          )}

          <p className="auth-switch">
            <button
              type="button"
              className="text-button"
              onClick={onBackToLogin}
            >
              Back to sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;