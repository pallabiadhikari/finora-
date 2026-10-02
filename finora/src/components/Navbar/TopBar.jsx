/* =====================================================
   Finora — TopBar
   Top-of-app header with:
     • Mobile brand (hidden on desktop)
     • Notification bell + dropdown
     • Avatar menu (profile + logout)

   Only one popover (bell or avatar) can be open at a time.
   Both close on Escape and on outside click.

   Props:
     userName  → display name
     userEmail → used for notifications + avatar menu
     userPhoto → avatar image URL (optional)
     onLogout  → called when the user clicks "Log out"
     onNavigate→ called with a page key from the brand
   ===================================================== */

import { useEffect, useRef, useState } from 'react';
import { getNotifications } from '../../utils/notifications';
import NotificationsDropdown from '../Notifications/NotificationsDropdown';
import Logo from '../Logo/Logo';
import Avatar from '../Logo/Avatar';

// Poll for new notifications at this interval (ms)
const POLL_INTERVAL_MS = 30000;

function TopBar({
  userName,
  userEmail,
  userPhoto,
  onLogout,
  onNavigate,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs for outside-click detection
  const profileRef = useRef(null);
  const bellRef = useRef(null);

  // Fall back to "User" for display purposes without extra state
  const displayName = userName || 'User';

  // ---------- Unread notification count ----------
  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const list = await getNotifications();
        if (!cancelled) {
          setUnreadCount(list.filter((n) => !n.read).length);
        }
      } catch {
        // Silent — network blips shouldn't spam the UI
      }
    };

    refresh();

    // Refresh when notifications change elsewhere in the app
    const onChanged = () => refresh();
    window.addEventListener('finora:notifications-changed', onChanged);

    // Poll periodically, but only while the tab is visible
    const interval = setInterval(() => {
      if (!document.hidden) refresh();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('finora:notifications-changed', onChanged);
    };
  }, [userEmail]);

  // ---------- Outside-click + Escape for both popovers ----------
  useEffect(() => {
    const anyOpen = showMenu || showNotifications;
    if (!anyOpen) return;

    const onMouseDown = (e) => {
      // Avatar menu
      if (
        showMenu &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }

      // Notifications dropdown
      if (
        showNotifications &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showMenu, showNotifications]);

  // ---------- Handlers ----------
  const toggleNotifications = () => {
    setShowMenu(false); // close the other popover
    setShowNotifications((v) => !v);
  };

  const toggleMenu = () => {
    setShowNotifications(false); // close the other popover
    setShowMenu((v) => !v);
  };

  const handleLogout = () => {
    setShowMenu(false);
    onLogout?.();
  };

  const handleBrandClick = () => {
    onNavigate?.('overview');
  };

  return (
    <header className="topbar">
      {/* Mobile brand — hidden on desktop via CSS */}
      <button
        type="button"
        className="topbar-mobile-brand"
        onClick={handleBrandClick}
        aria-label="Go to home"
      >
        <Logo size={38} decorative />
        <span className="topbar-mobile-name">Finora</span>
      </button>

      <div className="topbar-spacer" />

      <div className="topbar-actions">
        {/* ---------- Notifications ---------- */}
        <div className="topbar-bell-wrap" ref={bellRef}>
          <button
            type="button"
            className="topbar-icon-button"
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : 'Notifications'
            }
            aria-haspopup="true"
            aria-expanded={showNotifications}
            onClick={toggleNotifications}
          >
            <i className="fas fa-bell" aria-hidden="true"></i>
            {unreadCount > 0 && (
              <span className="topbar-bell-dot" aria-hidden="true" />
            )}
          </button>

          {showNotifications && (
            <NotificationsDropdown
              email={userEmail}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        {/* ---------- Avatar menu ---------- */}
        <div className="topbar-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className="topbar-profile"
            aria-label="Account menu"
            aria-haspopup="true"
            aria-expanded={showMenu}
            onClick={toggleMenu}
          >
            <Avatar
              size={38}
              name={displayName}
              photo={userPhoto}
              decorative
            />
          </button>

          {showMenu && (
            <div className="avatar-menu">
              <div className="avatar-menu-header">
                <Avatar
                  size={40}
                  name={displayName}
                  photo={userPhoto}
                  decorative
                />
                <div className="avatar-menu-info">
                  <span className="avatar-menu-name">{displayName}</span>
                  <span className="avatar-menu-email">
                    {userEmail || 'Not signed in'}
                  </span>
                </div>
              </div>

              <div className="avatar-menu-divider" />

              <button
                type="button"
                className="avatar-menu-item avatar-menu-item--danger"
                onClick={handleLogout}
              >
                <i
                  className="fas fa-right-from-bracket"
                  aria-hidden="true"
                ></i>
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;