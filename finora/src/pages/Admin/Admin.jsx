/* =====================================================
   Finora — Admin
   User management page. Only accessible to admins.

   Features:
     • Summary stats (total / admins / regular users)
     • Search by name or email
     • Promote / demote (restricted to a specific admin email)
     • Delete user (with confirmation)

   If the current user is not an admin, the page shows a
   friendly "not authorized" state. The app-level router
   also redirects them, but this page defends itself too.
   ===================================================== */

import { useEffect, useMemo, useState } from 'react';
import {
  adminListUsers,
  adminDeleteUser,
  adminPromoteUser,
  adminDemoteUser,
  getMe,
} from '../../utils/api';
import { useToast } from '../../components/Toast/ToastContext';
import Avatar from '../../components/Logo/Avatar';
import Modal from '../../components/Modal/Modal';

// Only this account can promote/demote other admins.
// TODO: replace with a backend-provided `canManageAdmins` flag.
const SUPER_ADMIN_EMAIL = 'floradmin05@gmail.com';

// Format a createdAt string defensively
function formatJoinDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function Admin() {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionSaving, setActionSaving] = useState(false);

  // ---------- Load ----------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const meRes = await getMe();
        if (cancelled) return;
        setMe(meRes.user);

        // Not an admin → bail. The app router will redirect,
        // but we don't want to fetch the user list either way.
        if (!meRes.user?.isAdmin) {
          setLoading(false);
          return;
        }

        const listRes = await adminListUsers();
        if (cancelled) return;
        setUsers(listRes.users);
      } catch (err) {
        console.error('Admin load failed:', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Handlers ----------

  const handleDelete = async () => {
    if (!confirmDelete || actionSaving) return;
    setActionSaving(true);

    try {
      await adminDeleteUser(confirmDelete.id);
      setUsers((prev) =>
        prev.filter((u) => u.id !== confirmDelete.id)
      );
      showToast(`${confirmDelete.name} deleted.`, 'success');
      setConfirmDelete(null);
    } catch (err) {
      showToast(
        err.message || 'Could not delete user.',
        'error'
      );
    } finally {
      setActionSaving(false);
    }
  };

  const handlePromote = async (user) => {
    if (actionSaving) return;
    setActionSaving(true);

    try {
      await adminPromoteUser(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isAdmin: true } : u
        )
      );
      showToast(`${user.name} is now an admin.`, 'success');
    } catch (err) {
      showToast(
        err.message || 'Could not promote user.',
        'error'
      );
    } finally {
      setActionSaving(false);
    }
  };

  const handleDemote = async (user) => {
    if (actionSaving) return;
    setActionSaving(true);

    try {
      await adminDemoteUser(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isAdmin: false } : u
        )
      );
      showToast(
        `${user.name} is no longer an admin.`,
        'success'
      );
    } catch (err) {
      showToast(
        err.message || 'Could not demote user.',
        'error'
      );
    } finally {
      setActionSaving(false);
    }
  };

  // ---------- Derived ----------

  const isSuperAdmin = me?.email === SUPER_ADMIN_EMAIL;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = String(u.name || '').toLowerCase();
      const email = String(u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, search]);

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.isAdmin).length;

  const searchActive = search.trim() !== '';

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Admin</h1>
          <p className="page-subtitle">Loading users…</p>
        </div>
      </div>
    );
  }

  // ---------- Load error ----------
  if (loadError) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Admin</h1>
          <p className="page-subtitle">Manage everyone using Finora</p>
        </div>
        <div className="empty-state">
          <i
            className="fas fa-triangle-exclamation empty-state-icon"
            aria-hidden="true"
          ></i>
          <h2 className="empty-state-title">
            We couldn't load the user list
          </h2>
          <p className="empty-state-text">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Not authorized ----------
  if (!me?.isAdmin) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Admin</h1>
          <p className="page-subtitle">Manage everyone using Finora</p>
        </div>
        <div className="empty-state">
          <i
            className="fas fa-lock empty-state-icon"
            aria-hidden="true"
          ></i>
          <h2 className="empty-state-title">Not authorized</h2>
          <p className="empty-state-text">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="page">
      {/* ---------- Header ---------- */}
      <div className="page-header">
        <h1 className="page-title">
          <i
            className="fas fa-shield-halved"
            style={{
              color: 'var(--color-primary)',
              marginRight: 10,
            }}
            aria-hidden="true"
          ></i>
          Admin
        </h1>
        <p className="page-subtitle">
          Manage everyone using Finora
        </p>
      </div>

      {/* ---------- Summary ---------- */}
      <div className="dashboard-summary">
        <div className="summary-card">
          <span className="summary-label">Total users</span>
          <span className="summary-value">{totalUsers}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Admins</span>
          <span className="summary-value">{adminCount}</span>
        </div>
        <div className="summary-card summary-card--highlight">
          <span className="summary-label">Regular users</span>
          <span className="summary-value">
            {totalUsers - adminCount}
          </span>
        </div>
      </div>

      {/* ---------- Search ---------- */}
      <div className="transactions-controls">
        <div className="transactions-search">
          <i
            className="fas fa-magnifying-glass"
            aria-hidden="true"
          ></i>
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
          />
        </div>
      </div>

      {/* ---------- User list ---------- */}
      {visible.length === 0 ? (
        <div className="empty-state">
          <i
            className="fas fa-users empty-state-icon"
            aria-hidden="true"
          ></i>
          <h2 className="empty-state-title">
            {searchActive ? 'No users match your search' : 'No users yet'}
          </h2>
          {searchActive && (
            <p className="empty-state-text">
              Try a different name or email.
            </p>
          )}
        </div>
      ) : (
        <ul className="expense-list">
          {visible.map((u) => {
            const isSelf = me?.id === u.id;
            const joinDate = formatJoinDate(u.createdAt);

            return (
              <li key={u.id} className="admin-user-row">
                <Avatar
                  size={40}
                  name={u.name}
                  photo={u.photo}
                  decorative
                />

                <div className="admin-user-info">
                  <div className="admin-user-name">
                    {u.name}
                    {isSelf && (
                      <span className="admin-badge admin-badge--self">
                        You
                      </span>
                    )}
                    {u.isAdmin && !isSelf && (
                      <span className="admin-badge">
                        <i
                          className="fas fa-shield-halved"
                          aria-hidden="true"
                        ></i>
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="admin-user-email">{u.email}</div>
                  {joinDate && (
                    <div className="admin-user-meta">
                      Joined {joinDate}
                    </div>
                  )}
                </div>

                {!isSelf && (
                  <div className="admin-user-actions">
                    {!u.isAdmin && isSuperAdmin && (
                      <button
                        type="button"
                        className="button button--ghost"
                        onClick={() => handlePromote(u)}
                        disabled={actionSaving}
                        title="Make this user an admin"
                        aria-label={`Promote ${u.name} to admin`}
                      >
                        <i
                          className="fas fa-arrow-up"
                          aria-hidden="true"
                        ></i>
                        Promote
                      </button>
                    )}

                    {u.isAdmin && isSuperAdmin && (
                      <button
                        type="button"
                        className="button button--ghost"
                        onClick={() => handleDemote(u)}
                        disabled={actionSaving}
                        title="Remove admin privileges"
                        aria-label={`Demote ${u.name} from admin`}
                      >
                        <i
                          className="fas fa-arrow-down"
                          aria-hidden="true"
                        ></i>
                        Demote
                      </button>
                    )}

                    <button
                      type="button"
                      className="button button--danger"
                      onClick={() => setConfirmDelete(u)}
                      disabled={actionSaving}
                      title="Delete this user"
                      aria-label={`Delete ${u.name}`}
                    >
                      <i
                        className="fas fa-trash"
                        aria-hidden="true"
                      ></i>
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ---------- Delete confirmation ---------- */}
      {confirmDelete && (
        <Modal
          title="Delete user?"
          onClose={() => (actionSaving ? null : setConfirmDelete(null))}
        >
          <p className="confirm-text">
            Delete <strong>{confirmDelete.name}</strong> and all
            their data? This cannot be undone.
          </p>
          <div className="form-actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setConfirmDelete(null)}
              disabled={actionSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button--danger"
              onClick={handleDelete}
              disabled={actionSaving}
              aria-busy={actionSaving}
            >
              {actionSaving ? (
                <>
                  <i
                    className="fas fa-circle-notch fa-spin"
                    aria-hidden="true"
                  ></i>{' '}
                  Deleting…
                </>
              ) : (
                'Delete user'
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Admin;