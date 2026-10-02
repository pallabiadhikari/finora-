/* =====================================================
   Finora — Toast provider
   Global toast queue. Any component can call useToast()
   to show a message. Renders a fixed container that
   behaves as an ARIA live region so screen readers
   announce new toasts as they appear.

   API:
     showToast(message, type?)  → type: 'success' | 'error' | 'info'
     dismissToast(id)           → remove a specific toast
     dismissAll()               → remove every toast
   ===================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import Toast from './Toast';

// Cap visible toasts so a burst doesn't overflow the screen.
// Oldest is dropped when the cap is exceeded.
const MAX_TOASTS = 4;

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Monotonic id counter — collision-proof and easy to read in devtools
  const nextIdRef = useRef(1);

  // ---------- Public API ----------

  const showToast = useCallback((message, type = 'success') => {
    const id = nextIdRef.current++;
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      // Drop oldest if we've exceeded the cap
      return next.length > MAX_TOASTS
        ? next.slice(next.length - MAX_TOASTS)
        : next;
    });
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Memoized context value — prevents consumer re-renders when
  // toasts are added/removed but the API hasn't changed.
  const value = useMemo(
    () => ({ showToast, dismissToast, dismissAll }),
    [showToast, dismissToast, dismissAll]
  );

  return (
    <ToastCtx.Provider value={value}>
      {children}

      {/*
        aria-live="polite"  → new toasts are announced after a pause
        aria-atomic="true"  → read the whole toast, not just the diff
        Individual Toasts override to role="alert" when they're errors.
      */}
      <div
        className="toast-container"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() => dismissToast(t.id)}
          />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ---------- Consumer hook ----------
export function useToast() {
  const ctx = useContext(ToastCtx);

  if (!ctx) {
    if (import.meta.env.DEV) {
      console.warn(
        '[Finora] useToast() was called outside <ToastProvider>. ' +
          'Toasts will not be shown.'
      );
    }
    // Safe fallback so components don't crash
    return {
      showToast: () => {},
      dismissToast: () => {},
      dismissAll: () => {},
    };
  }

  return ctx;
}