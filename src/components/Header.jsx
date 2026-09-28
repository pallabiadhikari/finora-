import { useState, useEffect } from 'react';
import Notifications from './Notifications';
import { capitalizeName } from '../utils/helpers';

function Header({ onLogout, currentUser, currentEmail, expenses, incomes, budget, onExport, onOpenSettings }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const displayName = capitalizeName(currentUser || localStorage.getItem('currentUser') || 'User');

  const syncUnreadCount = () => {
    const saved = localStorage.getItem('notifications');
    if (!saved) {
      setUnreadCount(0);
      return;
    }

    try {
      const notifications = JSON.parse(saved);
      setUnreadCount(notifications.filter((n) => !n.read).length);
    } catch (error) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    syncUnreadCount();

    const handleNotificationUpdate = () => syncUnreadCount();
    window.addEventListener('storage', handleNotificationUpdate);
    window.addEventListener('notification-update', handleNotificationUpdate);

    return () => {
      window.removeEventListener('storage', handleNotificationUpdate);
      window.removeEventListener('notification-update', handleNotificationUpdate);
    };
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(true);
    syncUnreadCount();
  };

  return (
    <>
      <header className="topbar">
        <div className="searchbox">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search transactions or categories" />
        </div>

        <div className="topbar-actions">
          <button type="button" className="ghost-button" onClick={onExport}>
            <i className="fas fa-download"></i>
            Export
          </button>

          <button type="button" className="icon-button notification-button" onClick={handleNotificationClick}>
            <i className="far fa-bell"></i>
            {unreadCount > 0 && <span>{unreadCount}</span>}
          </button>

          <button type="button" className="user-pill" onClick={onOpenSettings} aria-label="Open profile settings">
            <div className="user-avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{displayName}</strong>
              <span>{currentEmail}</span>
            </div>
            <i className="fas fa-chevron-down user-pill-chevron"></i>
          </button>

          <button type="button" className="logout-button" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </header>

      {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
    </>
  );
}

export default Header;