/* =====================================================
   Finora — MoreMenu (mobile only)
   Slide-up popover that holds the pages that don't fit
   in the bottom nav: Budgets, Insights, Goals, Profile,
   Settings.

   Only rendered when open (parent controls via state).

   Props:
     onClose          → called on outside-click / Escape / item tap
     onNavigate       → called with a page key for nav items
     onOpenSettings   → called for Profile / Settings (same target)
   ===================================================== */

import { useEffect, useRef } from 'react';

// Menu items data — keeps the JSX loop simple.
// `action` is either 'navigate' (uses onNavigate with `page`)
// or 'settings' (uses onOpenSettings).
const ITEMS = [
  { key: 'budgets',  label: 'Budgets',  icon: 'fa-bullseye',     action: 'navigate', page: 'budgets' },
  { key: 'insights', label: 'Insights', icon: 'fa-chart-simple', action: 'navigate', page: 'insights' },
  { key: 'goals',    label: 'Goals',    icon: 'fa-flag',         action: 'navigate', page: 'goals' },
  // Profile and Settings both open the same page — kept as
  // separate entries for discoverability.
  { key: 'profile',  label: 'Profile',  icon: 'fa-user',         action: 'settings' },
  { key: 'settings', label: 'Settings', icon: 'fa-gear',         action: 'settings' },
];

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function MoreMenu({ onClose, onNavigate, onOpenSettings }) {
  const menuRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Keep onClose in a ref so listener effects don't re-bind
  // when the parent passes an inline arrow.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // ---------- Focus management + outside-click + Escape ----------
  useEffect(() => {
    // Remember who opened the menu so we can restore focus on close
    previouslyFocusedRef.current = document.activeElement;

    // Move focus into the menu (first item)
    const firstFocusable = menuRef.current?.querySelector(FOCUSABLE);
    firstFocusable?.focus();

    const onMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onCloseRef.current();
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      // Simple focus trap: cycle Tab within the menu
      if (e.key === 'Tab') {
        const focusables = menuRef.current?.querySelectorAll(FOCUSABLE);
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
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);

      // Restore focus to whatever opened the menu
      previouslyFocusedRef.current?.focus?.();
    };
  }, []);

  // ---------- Item click handler ----------
  const handleItemClick = (item) => {
    onClose();
    if (item.action === 'navigate') {
      onNavigate?.(item.page);
    } else if (item.action === 'settings') {
      onOpenSettings?.();
    }
  };

  return (
    <div
      className="more-menu"
      ref={menuRef}
      role="dialog"
      aria-label="More options"
    >
      <div className="more-menu-grid">
        {ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className="more-menu-item"
            onClick={() => handleItemClick(item)}
          >
            <span className="more-menu-icon">
              <i
                className={`fas ${item.icon}`}
                aria-hidden="true"
              ></i>
            </span>
            <span className="more-menu-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoreMenu;