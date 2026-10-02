/* =====================================================
   Finora — Toast
   Single notification bubble with:
     • Auto-dismiss after 3s
     • Pause-on-hover (gives time to read / click Dismiss)
     • Pause-while-tab-hidden (no missed toasts)
     • Correct ARIA role per type (status vs alert)
     • Manual close button

   Props:
     message  → text to display
     type     → 'success' | 'error' | 'info' (default 'success')
     onClose  → called when dismissed (auto or manual)
   ===================================================== */

import { useEffect, useRef } from 'react';

const AUTO_DISMISS_MS = 3000;

function Toast({ message, type = 'success', onClose }) {
  // Keep onClose in a ref so the timer effect doesn't reset
  // if the parent re-renders with a new inline callback.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Timer state — recreated whenever we resume
  const timeoutRef = useRef(null);
  const remainingRef = useRef(AUTO_DISMISS_MS);
  const startedAtRef = useRef(0);

  // ---------- Auto-dismiss with pause/resume ----------
  useEffect(() => {
    const start = () => {
      startedAtRef.current = Date.now();
      timeoutRef.current = setTimeout(() => {
        onCloseRef.current();
      }, remainingRef.current);
    };

    const pause = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        remainingRef.current -= Date.now() - startedAtRef.current;
      }
    };

    const resume = () => {
      if (!timeoutRef.current && remainingRef.current > 0) {
        start();
      }
    };

    // Pause when the browser tab is hidden
    const onVisibility = () => {
      if (document.hidden) pause();
      else resume();
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      pause();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // ---------- Hover handlers ----------
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      remainingRef.current -= Date.now() - startedAtRef.current;
    }
  };

  const handleMouseLeave = () => {
    if (!timeoutRef.current && remainingRef.current > 0) {
      startedAtRef.current = Date.now();
      timeoutRef.current = setTimeout(() => {
        onCloseRef.current();
      }, remainingRef.current);
    }
  };

  // ---------- Icon per type ----------
  const iconClass =
    type === 'success'
      ? 'fa-circle-check'
      : type === 'error'
      ? 'fa-circle-exclamation'
      : 'fa-circle-info';

  // Errors should interrupt screen readers immediately;
  // success/info can wait politely.
  const role = type === 'error' ? 'alert' : 'status';

  return (
    <div
      className={`toast toast--${type}`}
      role={role}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <i className={`fas ${iconClass}`} aria-hidden="true"></i>
      <span>{message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <i className="fas fa-xmark" aria-hidden="true"></i>
      </button>
    </div>
  );
}

export default Toast;