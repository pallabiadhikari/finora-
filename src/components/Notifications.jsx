import { useState } from 'react';

function Notifications({ onClose }) {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) return JSON.parse(saved);
    const sampleNotifications = [
        {
          id: 1,
          title: 'Welcome to Expense Tracker!',
          message: 'Start tracking your expenses today. Add your first expense now!',
          time: new Date().toLocaleString(),
          read: false,
          icon: 'fa-wallet'
        },
        {
          id: 2,
          title: '💡 Tip: Categorize Your Expenses',
          message: 'Use categories like Food, Transport, Shopping to better track your spending.',
          time: new Date().toLocaleString(),
          read: false,
          icon: 'fa-lightbulb'
        }
    ];
    localStorage.setItem('notifications', JSON.stringify(sampleNotifications));
    return sampleNotifications;
  });

  const markAsRead = (id) => {
    const updated = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(notif => notif.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e8ecf1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>
              <i className="fas fa-bell" style={{ color: '#27ae60', marginRight: '8px' }}></i>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  background: '#e94560',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 8px',
                  fontSize: '12px',
                  marginLeft: '8px'
                }}>
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#27ae60',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '4px 8px'
                  }}
                >
                  <i className="fas fa-check-double"></i> Mark all read
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e74c3c',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '4px 8px'
                  }}
                >
                  <i className="fas fa-trash"></i> Clear all
                </button>
              </>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#95a5a6',
                padding: '0 4px'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div style={{
          padding: '16px 24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {notifications.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: '#95a5a6'
            }}>
              <i className="fas fa-bell-slash" style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}></i>
              <p style={{ margin: 0 }}>No notifications</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>You're all caught up!</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                style={{
                  padding: '14px 16px',
                  marginBottom: '10px',
                  background: notif.read ? '#f8f9fa' : '#e8f8f0',
                  borderRadius: '10px',
                  borderLeft: notif.read ? '3px solid #dce0e5' : '3px solid #27ae60',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = notif.read ? '#f0f2f5' : '#d4f0e0'}
                onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? '#f8f9fa' : '#e8f8f0'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <i className={`fas ${notif.icon || 'fa-bell'}`} style={{ color: '#27ae60' }}></i>
                      <strong style={{ fontSize: '14px', color: '#2c3e50' }}>{notif.title}</strong>
                      {!notif.read && (
                        <span style={{
                          background: '#27ae60',
                          color: 'white',
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          New
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#5a6c7d', lineHeight: '1.4' }}>
                      {notif.message}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#95a5a6' }}>
                        <i className="far fa-clock" style={{ marginRight: '4px' }}></i>
                        {notif.time}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#27ae60',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <i className="fas fa-check"></i> Mark read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#95a5a6',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;