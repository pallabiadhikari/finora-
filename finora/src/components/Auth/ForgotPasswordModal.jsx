/* =====================================================
   Finora — ForgotPasswordModal
   Lets a user request a password reset link by email.

   Flow:
     1. User enters their email
     2. We POST to /api/send-reset via sendResetEmail()
     3. Show a "Check your email" success screen
     4. User closes the modal

   Wrapped in <Modal>, so Escape / backdrop / focus are
   already handled there. This component only handles
   the form logic and the two states (form / success).

   Props:
     onClose → close the modal
   ===================================================== */

import { useState } from 'react';
import Modal from '../Modal/Modal';
import { sendResetEmail } from '../../utils/api';
import { isValidEmail } from '../../utils/validators';

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;

    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSending(true);

    try {
      await sendResetEmail(cleanEmail);
      setSent(true);
    } catch (err) {
      // Most real-world reset endpoints return 200 even for
      // unknown emails (to avoid leaking which addresses exist).
      // So a failure here usually means a network / server issue.
      setError(err.message || 'Could not send the reset email.');
    } finally {
      setSending(false);
    }
  };

  // ---------- Render ----------
  return (
    <Modal title="Reset your password" onClose={onClose}>
      {sent ? (
        // ---------- Success state ----------
        <div className="forgot-success">
          <i className="fas fa-envelope-circle-check" aria-hidden="true"></i>
          <h3>Check your email</h3>
          <p>
            If an account exists for <strong>{email.trim()}</strong>, we've
            sent a link to reset your password.
          </p>
          <p className="forgot-hint">
            Don't see it? Check your spam folder, or try again in a few
            minutes.
          </p>
          <button
            type="button"
            className="button button--primary"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      ) : (
        // ---------- Form state ----------
        <form className="form" onSubmit={handleSubmit} noValidate>
          <p className="forgot-intro">
            Enter the email you signed up with, and we'll send you a link
            to reset your password.
          </p>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={onClose}
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button--primary"
              disabled={sending}
              aria-busy={sending}
            >
              {sending ? (
                <>
                  <i
                    className="fas fa-circle-notch fa-spin"
                    aria-hidden="true"
                  ></i>{' '}
                  Sending…
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default ForgotPasswordModal;