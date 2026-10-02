/* =====================================================
   Finora — NotificationsDropdown
   Panel shown when the user clicks the bell in the TopBar.

   Features:
     • Loads notifications on mount
     • Mark one / mark all read
     • Remove one / clear all
     • Closes on outside-click or Escape
     • Emits `finora:notifications-changed` so the bell's
       unread badge stays in sync

   Props:
     onClose → close the dropdown
   ===================================================== */

import { useEffect, useRef, useState } from 'react';
import {
  getNotifications,
  markRead,
  markAllRead,
  clearAll,
  removeNotification,
} from '../../utils/notifications';

// ---------- Time formatting ----------
function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now - d) / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Notify the rest of the app that notification state changed
function emitChange() {
  window.dispatchEvent(new Event('finora:notifications-changed'));
}

function NotificationsDropdown({ onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  // Keep onClose in a ref so the listener effect doesn't rebind
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // ---------- Initial load ----------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await getNotifications();
        if (!cancelled) setItems(list);
      } catch (err) {
        console.error('Failed to load notifications:', err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Outside-click + Escape ----------
  useEffect(() => {
    const onMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onCloseRef.current();
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // ---------- Handlers ----------

  // Wraps an async mutation with error handling + change event
  const runMutation = async (fn) => {
    try {
      const next = await fn();
      setItems(next);
      emitChange();
    } catch (err) {
      console.error('Notification action failed:', err);
    }
  };

  const handleMarkRead = (id) => runMutation(() => markRead(id));
  const handleMarkAllRead = () => runMutation(() => markAllRead());
  const handleClearAll = () => runMutation(() => clearAll());
  const handleRemove = (id) => runMutation(() => removeNotification(id));

  // ---------- Derived ----------
  const unread = items.filter((n) => !n.read).length;

  return (
    <div
      className="notifications-menu"
      ref={ref}
      role="dialog"
      aria-label="Notifications"
    >
      <div className="notifications-head">
        <div>
          <h3 className="notifications-title">Notifications</h3>
          <p className="notifications-sub">
            {loading
              ? 'Loading…'
              : unread > 0
              ? `${unread} unread`
              : 'All caught up'}
          </p>
        </div>

        <div className="notifications-actions">
          {items.length > 0 && (
            <>
              {unread > 0 && (
                <button
                  type="button"
                  className="text-button"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                className="text-button text-button--danger"
                onClick={handleClearAll}
              >
                Clear all
              </button>
            </>
          )}
        </div>
      </div>

      <div className="notifications-body">
        {items.length === 0 ? (
          <div className="notifications-empty">
            <i className="fas fa-bell-slash" aria-hidden="true"></i>
            <p>{loading ? 'Loading…' : 'No notifications yet.'}</p>
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={`notification-item${
                n.read ? '' : ' notification-item--unread'
              }`}
            >
              <span className="notification-icon" aria-hidden="true">
                <i className={`fas ${n.icon || 'fa-bell'}`}></i>
              </span>

              <div className="notification-content">
                <div className="notification-title">{n.title}</div>
                <div className="notification-message">{n.message}</div>
                <div className="notification-time">
                  {formatTime(n.time)}
                </div>
              </div>

              <div className="notification-item-actions">
                {!n.read && (
                  <button
                    type="button"
                    className="icon-action"
                    aria-label={`Mark "${n.title}" as read`}
                    title="Mark read"
                    onClick={() => handleMarkRead(n.id)}
                  >
                    <i className="fas fa-check" aria-hidden="true"></i>
                  </button>
                )}
                <button
                  type="button"
                  className="icon-action icon-action--danger"
                  aria-label={`Remove "${n.title}"`}
                  title="Remove"
                  onClick={() => handleRemove(n.id)}
                >
                  <i className="fas fa-xmark" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsDropdown;