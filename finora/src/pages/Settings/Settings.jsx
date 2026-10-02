/* =====================================================
   Finora — Settings
   Sections:
     • Profile  — avatar, name (rate-limited), email, phone
     • Preferences — currency, theme, date format
     • Privacy  — private view toggle
     • Data     — export to Excel, delete all
     • Account  — change password, log out
   ===================================================== */

import { useEffect, useRef, useState } from 'react';
import { getSettings, saveSettings } from '../../utils/user';
import {
  getMe,
  updateProfile,
  updatePassword as apiUpdatePassword,
  clearToken,
} from '../../utils/api';
import { currencies, dateFormats } from '../../data/categories';
import {
  getExpenses,
  getIncomes,
  getBudgets,
  getGoals,
} from '../../utils/storage';
import {
  getPasswordRules,
  isStrongEnoughPassword,
  getPasswordErrorMessage,
} from '../../utils/validators';
import { useToast } from '../../components/Toast/ToastContext';
import Avatar from '../../components/Logo/Avatar';
import PhotoCropModal from '../../components/Logo/PhotoCropModal';
import { exportAllToExcel } from '../../utils/excelExport';

const NAME_CHANGE_LIMIT = 3;

// Build the nameInfo object from a user payload
function buildNameInfo(user) {
  const count = user?.nameChanges?.count || 0;
  return {
    count,
    limit: NAME_CHANGE_LIMIT,
    remaining: Math.max(NAME_CHANGE_LIMIT - count, 0),
    month: user?.nameChanges?.month || '',
  };
}

// Apply a theme to <html data-theme>
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    root.dataset.theme = prefersDark ? 'dark' : 'light';
  } else {
    root.dataset.theme = theme;
  }
}

function Settings({ onLogout }) {
  const { showToast } = useToast();

  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(() => {
    try {
      return getSettings();
    } catch {
      return {
        currency: 'USD',
        theme: 'system',
        dateFormat: 'medium',
        privateView: false,
      };
    }
  });
  const [savedMessage, setSavedMessage] = useState('');
  const [nameInfo, setNameInfo] = useState(buildNameInfo(null));
  const [loading, setLoading] = useState(true);

  const [profileSaving, setProfileSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);

  // Password form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Photo crop
  const [pendingPhoto, setPendingPhoto] = useState(null);

  // Timers we want to clear on unmount
  const flashTimerRef = useRef(null);
  const pwSuccessTimerRef = useRef(null);

  /* ---------- Load user ---------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { user: u } = await getMe();
        if (cancelled) return;
        setUser(u);
        setNameInfo(buildNameInfo(u));
      } catch (err) {
        if (!cancelled) {
          showToast(
            err.message || 'Could not load profile.',
            'error'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Persist settings + apply theme ---------- */
  // Skip the very first run (on mount) so we don't redundantly
  // re-save what we just loaded from storage.
  const settingsInitialised = useRef(false);

  useEffect(() => {
    if (!settingsInitialised.current) {
      settingsInitialised.current = true;
      applyTheme(settings.theme);
      return;
    }

    try {
      saveSettings(settings);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
    applyTheme(settings.theme);
    window.dispatchEvent(new Event('finora:settings-changed'));
  }, [settings]);

  /* ---------- Follow system theme when 'system' is active ---------- */
  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');

    // Modern browsers
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [settings.theme]);

  /* ---------- Cleanup timers on unmount ---------- */
  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      if (pwSuccessTimerRef.current)
        clearTimeout(pwSuccessTimerRef.current);
    };
  }, []);

  const flashSaved = (text) => {
    setSavedMessage(text);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setSavedMessage(''), 2000);
  };

  const flashPasswordSuccess = (text) => {
    setPwSuccess(text);
    if (pwSuccessTimerRef.current)
      clearTimeout(pwSuccessTimerRef.current);
    pwSuccessTimerRef.current = setTimeout(
      () => setPwSuccess(''),
      3000
    );
  };

  /* ---------- Photo ---------- */

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    // Always clear the input so re-selecting the same file works
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file.', 'error');
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      showToast('Image is too large (max 1 MB).', 'error');
      return;
    }
    setPendingPhoto(file);
  };

  const handleCroppedSave = async (dataUrl) => {
    if (!user || photoSaving) return;
    setPhotoSaving(true);

    try {
      const { user: updated } = await updateProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        photo: dataUrl,
      });
      setUser(updated);
      window.dispatchEvent(
        new CustomEvent('finora:user-updated', { detail: updated })
      );
      setPendingPhoto(null);
      showToast('Profile photo updated', 'success');
    } catch (err) {
      showToast(err.message || 'Could not update photo.', 'error');
    } finally {
      setPhotoSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user || photoSaving) return;
    setPhotoSaving(true);

    try {
      const { user: updated } = await updateProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        photo: '',
      });
      setUser(updated);
      window.dispatchEvent(
        new CustomEvent('finora:user-updated', { detail: updated })
      );
      showToast('Profile photo removed', 'success');
    } catch (err) {
      showToast(err.message || 'Could not remove photo.', 'error');
    } finally {
      setPhotoSaving(false);
    }
  };

  /* ---------- Profile ---------- */

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profileSaving) return;

    if (!user?.name?.trim()) {
      showToast('Please enter a name.', 'error');
      return;
    }
    if (!user?.email?.trim()) {
      showToast('Please enter an email.', 'error');
      return;
    }

    setProfileSaving(true);
    try {
      const { user: updated } = await updateProfile({
        name: user.name.trim(),
        email: user.email.trim().toLowerCase(),
        phone: user.phone || '',
        photo: user.photo || '',
      });

      setUser(updated);
      setNameInfo(buildNameInfo(updated));
      window.dispatchEvent(
        new CustomEvent('finora:user-updated', { detail: updated })
      );

      showToast('Profile updated successfully', 'success');
      flashSaved('Profile saved');
    } catch (err) {
      showToast(err.message || 'Could not save profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  /* ---------- Export ---------- */

  const handleExport = async () => {
    try {
      const [expenses, incomes, budgets, goals] = await Promise.all([
        getExpenses(),
        getIncomes(),
        getBudgets(),
        getGoals(),
      ]);
      exportAllToExcel({ user, expenses, incomes, budgets, goals });
      showToast('Excel file downloaded', 'success');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Could not export. Please try again.', 'error');
    }
  };

  /* ---------- Delete all ---------- */

  const handleDeleteAll = () => {
    const ok = window.confirm(
      'Delete ALL your Finora data? This cannot be undone.'
    );
    if (!ok) return;
    showToast('This feature is coming soon.', 'error');
  };

  /* ---------- Password ---------- */

  const resetPasswordForm = () => {
    setPwCurrent('');
    setPwNew('');
    setPwConfirm('');
    setPwError('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwSaving) return;

    setPwError('');
    setPwSuccess('');

    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwError('Please fill in all three fields.');
      return;
    }
    if (pwNew === pwCurrent) {
      setPwError(
        'New password must be different from the current password.'
      );
      return;
    }
    if (!isStrongEnoughPassword(pwNew)) {
      setPwError(getPasswordErrorMessage(pwNew));
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    setPwSaving(true);
    try {
      await apiUpdatePassword({
        currentPassword: pwCurrent,
        newPassword: pwNew,
      });
      resetPasswordForm();
      setShowPasswordForm(false);
      flashPasswordSuccess('Password updated successfully.');
      showToast('Password updated', 'success');
    } catch (err) {
      setPwError(err.message || 'Could not update password.');
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    onLogout?.();
  };

  const newPwRules = getPasswordRules(pwNew);
  const newPwAllValid = Object.values(newPwRules).every(Boolean);
  const canSubmitPassword =
    newPwAllValid &&
    pwNew === pwConfirm &&
    pwNew !== pwCurrent &&
    !pwSaving;

  /* ---------- Loading ---------- */

  if (loading || !user) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* ---------- Header ---------- */}
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">
          Manage your profile and preferences
        </p>
      </div>

      {savedMessage && (
        <div className="settings-flash" role="status">
          {savedMessage}
        </div>
      )}

      {/* ================= Profile ================= */}
      <section className="settings-section">
        <h2 className="settings-section-title">Profile</h2>

        <div className="profile-photo-row">
          <Avatar
            size={72}
            name={user.name}
            photo={user.photo || ''}
            decorative
          />
          <div className="profile-photo-actions">
            <label className="button button--primary profile-photo-btn">
              {user.photo ? 'Change photo' : 'Upload photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={photoSaving}
                style={{ display: 'none' }}
              />
            </label>
            {user.photo && (
              <button
                type="button"
                className="button button--ghost"
                onClick={handleRemovePhoto}
                disabled={photoSaving}
                aria-busy={photoSaving}
              >
                {photoSaving ? 'Removing…' : 'Remove'}
              </button>
            )}
            <p className="profile-photo-hint">
              Optional. Shown as your avatar across Finora.
            </p>
          </div>
        </div>

        <form
          className="form"
          onSubmit={handleSaveProfile}
          noValidate
        >
          <div className="form-field">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              type="text"
              value={user.name}
              onChange={(e) =>
                setUser({ ...user, name: e.target.value })
              }
              disabled={nameInfo.remaining <= 0 || profileSaving}
            />
            {nameInfo.remaining > 0 ? (
              <p className="field-hint">
                You can change your name{' '}
                <strong>{nameInfo.remaining}</strong> more time
                {nameInfo.remaining === 1 ? '' : 's'} this month.
              </p>
            ) : (
              <p className="field-hint field-hint--warn">
                You've reached the monthly limit. You can change your
                name again next month.
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              type="email"
              value={user.email}
              onChange={(e) =>
                setUser({ ...user, email: e.target.value })
              }
              disabled={profileSaving}
            />
          </div>

          <div className="form-field">
            <label htmlFor="profile-phone">Phone (optional)</label>
            <input
              id="profile-phone"
              type="tel"
              placeholder="+977 98XXXXXXXX"
              value={user.phone || ''}
              onChange={(e) =>
                setUser({ ...user, phone: e.target.value })
              }
              disabled={profileSaving}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button button--primary"
              disabled={profileSaving}
              aria-busy={profileSaving}
            >
              {profileSaving ? (
                <>
                  <i
                    className="fas fa-circle-notch fa-spin"
                    aria-hidden="true"
                  ></i>{' '}
                  Saving…
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>
      </section>

      {/* ================= Preferences ================= */}
      <section className="settings-section">
        <h2 className="settings-section-title">Preferences</h2>
        <div className="form">
          <div className="form-field">
            <label htmlFor="pref-currency">Currency</label>
            <select
              id="pref-currency"
              value={settings.currency}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  currency: e.target.value,
                })
              }
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <span className="form-label" id="theme-label">
              Theme
            </span>
            <div
              className="theme-picker"
              role="group"
              aria-labelledby="theme-label"
            >
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`theme-pill${
                    settings.theme === t ? ' active' : ''
                  }`}
                  onClick={() =>
                    setSettings({ ...settings, theme: t })
                  }
                  aria-pressed={settings.theme === t}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="pref-date">Date format</label>
            <select
              id="pref-date"
              value={settings.dateFormat}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  dateFormat: e.target.value,
                })
              }
            >
              {dateFormats.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ================= Privacy ================= */}
      <section className="settings-section">
        <h2 className="settings-section-title">Privacy</h2>
        <div className="settings-row">
          <div>
            <div className="settings-row-title">Private View</div>
            <div className="settings-row-sub">
              Hide all monetary values when Finora is open
            </div>
          </div>
          <button
            type="button"
            className={`toggle${
              settings.privateView ? ' toggle--on' : ''
            }`}
            onClick={() =>
              setSettings({
                ...settings,
                privateView: !settings.privateView,
              })
            }
            aria-pressed={settings.privateView}
            aria-label="Toggle Private View"
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </section>

      {/* ================= Data ================= */}
      <section className="settings-section">
        <h2 className="settings-section-title">Data</h2>

        <div className="settings-row">
          <div>
            <div className="settings-row-title">Export to Excel</div>
            <div className="settings-row-sub">
              Download a .xlsx file with expenses, income and summary
            </div>
          </div>
          <button
            type="button"
            className="button button--primary"
            onClick={handleExport}
          >
            <i
              className="fas fa-file-excel"
              aria-hidden="true"
            ></i>{' '}
            Export
          </button>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-title">Delete all data</div>
            <div className="settings-row-sub">
              Remove every transaction, budget and goal
            </div>
          </div>
          <button
            type="button"
            className="button button--danger"
            onClick={handleDeleteAll}
          >
            Delete
          </button>
        </div>
      </section>

      {/* ================= Account ================= */}
      <section className="settings-section">
        <h2 className="settings-section-title">Account</h2>

        {pwSuccess && (
          <div className="settings-flash" role="status">
            {pwSuccess}
          </div>
        )}

        {!showPasswordForm ? (
          <div className="settings-row">
            <div>
              <div className="settings-row-title">
                Change password
              </div>
              <div className="settings-row-sub">
                Update the password used to sign in
              </div>
            </div>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setShowPasswordForm(true)}
            >
              Change
            </button>
          </div>
        ) : (
          <form
            className="form"
            onSubmit={handleChangePassword}
            noValidate
          >
            {pwError && (
              <div className="form-error" role="alert">
                {pwError}
              </div>
            )}

            {/* Current password */}
            <div className="form-field">
              <label htmlFor="pw-current">Current password</label>
              <div className="password-wrap">
                <input
                  id="pw-current"
                  type={showCurrent ? 'text' : 'password'}
                  value={pwCurrent}
                  onChange={(e) => setPwCurrent(e.target.value)}
                  autoComplete="current-password"
                  disabled={pwSaving}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label={
                    showCurrent ? 'Hide password' : 'Show password'
                  }
                  title={
                    showCurrent ? 'Hide password' : 'Show password'
                  }
                >
                  <i
                    className={`fas ${
                      showCurrent ? 'fa-eye-slash' : 'fa-eye'
                    }`}
                    aria-hidden="true"
                  ></i>
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="form-field">
              <label htmlFor="pw-new">New password</label>
              <div className="password-wrap">
                <input
                  id="pw-new"
                  type={showNew ? 'text' : 'password'}
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  autoComplete="new-password"
                  disabled={pwSaving}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={
                    showNew ? 'Hide password' : 'Show password'
                  }
                  title={showNew ? 'Hide password' : 'Show password'}
                >
                  <i
                    className={`fas ${
                      showNew ? 'fa-eye-slash' : 'fa-eye'
                    }`}
                    aria-hidden="true"
                  ></i>
                </button>
              </div>

              <ul className="password-rules">
                <li className={newPwRules.length ? 'ok' : ''}>
                  <i
                    className={`fas ${
                      newPwRules.length ? 'fa-check' : 'fa-xmark'
                    }`}
                    aria-hidden="true"
                  ></i>
                  At least 8 characters
                </li>
                <li className={newPwRules.upper ? 'ok' : ''}>
                  <i
                    className={`fas ${
                      newPwRules.upper ? 'fa-check' : 'fa-xmark'
                    }`}
                    aria-hidden="true"
                  ></i>
                  One uppercase letter (A–Z)
                </li>
                <li className={newPwRules.lower ? 'ok' : ''}>
                  <i
                    className={`fas ${
                      newPwRules.lower ? 'fa-check' : 'fa-xmark'
                    }`}
                    aria-hidden="true"
                  ></i>
                  One lowercase letter (a–z)
                </li>
                <li className={newPwRules.number ? 'ok' : ''}>
                  <i
                    className={`fas ${
                      newPwRules.number ? 'fa-check' : 'fa-xmark'
                    }`}
                    aria-hidden="true"
                  ></i>
                  One number (0–9)
                </li>
                <li className={newPwRules.special ? 'ok' : ''}>
                  <i
                    className={`fas ${
                      newPwRules.special ? 'fa-check' : 'fa-xmark'
                    }`}
                    aria-hidden="true"
                  ></i>
                  One special character (!@#$…)
                </li>
                <li className={newPwRules.noSpaces ? 'ok' : ''}>
                  <i
                    className={`fas ${
                      newPwRules.noSpaces ? 'fa-check' : 'fa-xmark'
                    }`}
                    aria-hidden="true"
                  ></i>
                  No leading or trailing spaces
                </li>
              </ul>

              {pwNew && pwNew === pwCurrent && (
                <p className="password-mismatch">
                  New password must be different from the current
                  password.
                </p>
              )}
            </div>

            {/* Confirm new password */}
            <div className="form-field">
              <label htmlFor="pw-confirm">
                Confirm new password
              </label>
              <div className="password-wrap">
                <input
                  id="pw-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  autoComplete="new-password"
                  disabled={pwSaving}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={
                    showConfirm ? 'Hide password' : 'Show password'
                  }
                  title={
                    showConfirm ? 'Hide password' : 'Show password'
                  }
                >
                  <i
                    className={`fas ${
                      showConfirm ? 'fa-eye-slash' : 'fa-eye'
                    }`}
                    aria-hidden="true"
                  ></i>
                </button>
              </div>
              {pwConfirm && pwNew !== pwConfirm && (
                <p className="password-mismatch">
                  Passwords do not match yet.
                </p>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setShowPasswordForm(false);
                  resetPasswordForm();
                }}
                disabled={pwSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button--primary"
                disabled={!canSubmitPassword}
                aria-busy={pwSaving}
              >
                {pwSaving ? (
                  <>
                    <i
                      className="fas fa-circle-notch fa-spin"
                      aria-hidden="true"
                    ></i>{' '}
                    Updating…
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="settings-row">
          <div>
            <div className="settings-row-title">Log out</div>
            <div className="settings-row-sub">
              Sign out of your Finora session
            </div>
          </div>
          <button
            type="button"
            className="button button--danger"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </section>

      {/* ---------- Photo crop modal ---------- */}
      {pendingPhoto && (
        <PhotoCropModal
          file={pendingPhoto}
          onCancel={() => setPendingPhoto(null)}
          onSave={handleCroppedSave}
        />
      )}
    </div>
  );
}

export default Settings;