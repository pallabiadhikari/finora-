/* =====================================================
   Finora — SignupForm
   Account creation form with live password rules.

   Validation:
     • Name + email + password + confirm required
     • Email must be valid format
     • Password must pass all 6 rules shown below the field
     • Confirm must match password

   Props:
     onSuccess         → called with the new user object
     onSwitchToLogin   → called when the user clicks "Sign in"
   ===================================================== */

import { useMemo, useState } from 'react';
import { useToast } from '../Toast/ToastContext';
import { registerUser, setToken } from '../../utils/api';
import { isValidEmail, getPasswordRules } from '../../utils/validators';
import { setActiveEmail } from '../../utils/activeUser';

// Human-readable labels paired with each rule key
const RULE_LABELS = {
  length: 'At least 8 characters',
  upper: 'One uppercase letter (A–Z)',
  lower: 'One lowercase letter (a–z)',
  number: 'One number (0–9)',
  special: 'One special character (!@#$…)',
  noSpaces: 'No leading or trailing spaces',
};

// Keep the display order stable
const RULE_ORDER = [
  'length',
  'upper',
  'lower',
  'number',
  'special',
  'noSpaces',
];

function SignupForm({ onSuccess, onSwitchToLogin }) {
  const { showToast } = useToast();

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Recompute rules only when the password actually changes
  const rules = useMemo(() => getPasswordRules(password), [password]);
  const allValid = useMemo(
    () => RULE_ORDER.every((key) => rules[key]),
    [rules]
  );

  const passwordMismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    allValid && password === confirm && !saving && !passwordMismatch;

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!allValid) {
      setError('Password does not meet all requirements below.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);

    try {
      const { token, user } = await registerUser({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      setToken(token);
      setActiveEmail(cleanEmail);
      showToast('Account created successfully', 'success');
      onSuccess(user);
    } catch (err) {
      setError(err.message || 'Could not create account.');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Render ----------
  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1 className="auth-title">Create your Finora account</h1>
      <p className="auth-subtitle">
        Set up in seconds. No credit card, no clutter.
      </p>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {/* ---------- Name ---------- */}
      <div className="form-field">
        <label htmlFor="signup-name">Name</label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
        />
      </div>

      {/* ---------- Email ---------- */}
      <div className="form-field">
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={saving}
        />
      </div>

      {/* ---------- Password + rules ---------- */}
      <div className="form-field">
        <label htmlFor="signup-password">Password</label>
        <div className="password-wrap">
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
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

        <ul className="password-rules">
          {RULE_ORDER.map((key) => {
            const ok = rules[key];
            return (
              <li key={key} className={ok ? 'ok' : ''}>
                <i
                  className={`fas ${ok ? 'fa-check' : 'fa-xmark'}`}
                  aria-hidden="true"
                ></i>
                {RULE_LABELS[key]}
              </li>
            );
          })}
        </ul>

        {/* Screen-reader-only live summary of the rules state */}
        <p className="sr-only" aria-live="polite">
          {allValid
            ? 'All password requirements met.'
            : 'Password does not yet meet all requirements.'}
        </p>
      </div>

      {/* ---------- Confirm ---------- */}
      <div className="form-field">
        <label htmlFor="signup-confirm">Confirm password</label>
        <div className="password-wrap">
          <input
            id="signup-confirm"
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
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
            title={showConfirm ? 'Hide password' : 'Show password'}
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
          <p className="password-mismatch">Passwords do not match yet</p>
        )}
      </div>

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
            Creating account…
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Hint explaining why the button may be disabled */}
      {!canSubmit && !saving && (password || confirm) && (
        <p className="field-hint field-hint--warn">
          {!allValid
            ? 'Complete all password rules to continue.'
            : 'Passwords must match to continue.'}
        </p>
      )}

      <p className="auth-switch">
        Already have an account?{' '}
        <button
          type="button"
          className="text-button"
          onClick={onSwitchToLogin}
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

export default SignupForm;