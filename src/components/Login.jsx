import { useState } from 'react';

const ADMIN_EMAIL = 'admin@expenseflow.com';
const ADMIN_PASSWORD = 'admin123';

function Login({ onLogin, onSwitchToSignup, onBackToLanding }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const savedAdmin = JSON.parse(localStorage.getItem('adminProfile') || 'null');
    const adminEmail = savedAdmin?.email || ADMIN_EMAIL;
    const adminPassword = savedAdmin?.password || ADMIN_PASSWORD;
    const user = email === adminEmail && password === adminPassword
      ? { name: savedAdmin?.name || 'Admin' }
      : users.find((item) => item.email === email && item.password === password);

    if (user) {
      onLogin(email, user.name);
    } else {
      setError('Invalid email or password. Please try again or create an account.');
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-topbar">
        <button type="button" className="brand auth-brand" onClick={onBackToLanding}>
          <span className="brand-mark"><i className="fas fa-wallet"></i></span>
          <span>ExpenseFlow</span>
        </button>
        <button type="button" className="auth-back-button" onClick={onBackToLanding}><i className="fas fa-arrow-left"></i> Back to home</button>
      </div>
      <section className="auth-layout">
        <div className="auth-story"><span className="landing-eyebrow"><i className="fas fa-sparkles"></i> Welcome back</span><h1>Your financial picture is waiting.</h1><p>Pick up where you left off and keep your everyday spending moving in the right direction.</p><div className="auth-story-stat"><strong>One clear view.</strong><span>Every expense, category, and goal in one calm workspace.</span></div></div>
        <div className="auth-card">
          <div className="auth-card-heading"><span className="auth-icon"><i className="fas fa-arrow-right-to-bracket"></i></span><div><span className="auth-kicker">Your workspace</span><h2>Sign in</h2></div></div>
          <p className="auth-subtitle">Enter your details to continue to ExpenseFlow.</p>
          <div className="admin-demo-note"><i className="fas fa-shield-halved"></i><span><strong>Admin demo access</strong><small>{ADMIN_EMAIL} / {ADMIN_PASSWORD}</small></span></div>
          {error && <div className="auth-error" role="alert"><i className="fas fa-circle-exclamation"></i>{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="login-email">Email address</label>
            <input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            <div className="auth-label-row"><label htmlFor="login-password">Password</label><button type="button" className="auth-help">Need help?</button></div>
            <div className="auth-password-field"><input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}><i className={showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'}></i></button></div>
            <button type="submit" className="auth-submit">Sign in <i className="fas fa-arrow-right"></i></button>
          </form>
          <p className="auth-switch">New to ExpenseFlow? <button type="button" onClick={onSwitchToSignup}>Create an account</button></p>
          <p className="auth-privacy"><i className="fas fa-lock"></i> Your data stays private in this browser.</p>
        </div>
      </section>
    </main>
  );
}

export default Login;
