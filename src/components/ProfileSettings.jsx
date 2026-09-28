import { useState } from 'react';

function ProfileSettings({ profile, theme, onSaveProfile, onChangePassword, onChangeTheme, onClose }) {
  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeSection, setActiveSection] = useState('profile');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setMessage('Name and email are required.');
      return;
    }
    onSaveProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    setMessage('Profile updated successfully.');
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    setMessage('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Please complete all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('New password and confirmation do not match.');
      return;
    }
    const error = onChangePassword({ currentPassword, newPassword });
    if (error) {
      setMessage(error);
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('Password changed successfully.');
  };

  return (
    <div className="settings-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="settings-header"><div><span className="label">Account settings</span><h2 id="settings-title">Your preferences</h2></div><button type="button" className="settings-close" aria-label="Close settings" onClick={onClose}><i className="fas fa-times"></i></button></div>
        <div className="settings-tabs"><button type="button" className={activeSection === 'profile' ? 'settings-tab active' : 'settings-tab'} onClick={() => setActiveSection('profile')}><i className="fas fa-user"></i> Profile</button><button type="button" className={activeSection === 'appearance' ? 'settings-tab active' : 'settings-tab'} onClick={() => setActiveSection('appearance')}><i className="fas fa-sliders"></i> Appearance</button></div>
        {activeSection === 'profile' ? (
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="settings-avatar">{(name || 'U').charAt(0).toUpperCase()}</div>
            <label htmlFor="profile-name">Full name</label><input id="profile-name" type="text" value={name} onChange={(event) => setName(event.target.value)} />
            <label htmlFor="profile-email">Email address</label><input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <label htmlFor="profile-phone">Phone number</label><input id="profile-phone" type="tel" placeholder="Add your phone number" value={phone} onChange={(event) => setPhone(event.target.value)} />
            {message && <p className="settings-message" role="status">{message}</p>}
            <button type="submit" className="settings-save">Save profile</button>
            <div className="password-section"><h3>Change password</h3><p>Use your current password to create a new one.</p><label htmlFor="current-password">Current password</label><input id="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /><label htmlFor="new-password">New password</label><input id="new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /><button type="button" className="settings-save settings-save--secondary" onClick={handlePasswordSubmit}>Change password</button></div>
          </form>
        ) : (
          <div className="appearance-settings"><p>Choose how ExpenseFlow looks while you work.</p><div className="theme-options"><button type="button" className={theme === 'light' ? 'theme-option selected' : 'theme-option'} onClick={() => onChangeTheme('light')}><span className="theme-swatch theme-swatch--light"></span><strong>Light</strong><small>Clean and bright</small></button><button type="button" className={theme === 'dark' ? 'theme-option selected' : 'theme-option'} onClick={() => onChangeTheme('dark')}><span className="theme-swatch theme-swatch--dark"></span><strong>Dark</strong><small>Low-light workspace</small></button></div></div>
        )}
      </section>
    </div>
  );
}

export default ProfileSettings;
