/* =====================================================
   Finora — Modal dialog
   Accessible modal with:
     • Escape-to-close
     • Backdrop-click-to-close
     • Focus moved into the dialog on open
     • Focus trapped inside while open
     • Focus restored to the trigger on close
     • Body scroll locked while open
     • Unique title id (safe when stacking modals)

   Props:
     title     → header text (also used as the aria label)
     onClose   → called on Escape / backdrop / close button
     children  → modal body content
   ===================================================== */

import { useEffect, useId, useRef } from 'react';

// Selector for elements that can receive keyboard focus
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), ' +
  'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Modal({ title, onClose, children }) {
  // Unique id per instance — prevents clashing when two modals are open
  const titleId = useId();

  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Keep onClose in a ref so the effect below doesn't re-bind
  // on every parent render (inline arrow functions etc.)
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // ---------- Focus management + Escape key ----------
  useEffect(() => {
    // Remember who had focus so we can restore it on close
    previouslyFocusedRef.current = document.activeElement;

    // Move focus into the dialog
    const firstFocusable = dialogRef.current?.querySelector(FOCUSABLE);
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      dialogRef.current?.focus();
    }

    // Lock body scroll while modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Handle Escape + Tab trapping
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key !== 'Tab') return;

      // Cycle focus within the dialog
      const focusables = dialogRef.current?.querySelectorAll(FOCUSABLE);
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    // ---------- Cleanup ----------
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;

      // Restore focus to whatever opened the modal
      previouslyFocusedRef.current?.focus?.();
    };
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex="-1"
      >
        <div className="modal-header">
          <h2 className="modal-title" id={titleId}>
            {title}
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <i className="fas fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;