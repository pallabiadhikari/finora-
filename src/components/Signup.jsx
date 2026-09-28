import { useState } from 'react';

function Signup({ onSignup, onSwitchToLogin, onBackToLanding }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (existingUsers.find((user) => user.email === email)) {
      setError('Email already registered. Please sign in instead.');
      return;
    }

    existingUsers.push({ id: Date.now(), name, email, password, createdAt: new Date().toLocaleDateString() });
    localStorage.setItem('users', JSON.stringify(existingUsers));
    setSuccess('Account created. Preparing your workspace...');
    setTimeout(() => onSignup(email, name), 700);
  };

  return (
    <main className="auth-page auth-page--signup">
      <div className="auth-topbar">
        <button type="button" className="brand auth-brand" onClick={onBackToLanding}>
          <span className="brand-mark"><i className="fas fa-wallet"></i></span>
          <span>ExpenseFlow</span>
        </button>
        <button type="button" className="auth-back-button" onClick={onBackToLanding}><i className="fas fa-arrow-left"></i> Back to home</button>
      </div>
      <section className="auth-layout">
        <div className="auth-story"><span className="landing-eyebrow"><i className="fas fa-seedling"></i> Start with clarity</span><h1>A better relationship with your spending starts here.</h1><p>Create your private workspace and make your first useful money habit today.</p><div className="auth-check-list"><span><i className="fas fa-check"></i> Track expenses in seconds</span><span><i className="fas fa-check"></i> Understand your categories</span><span><i className="fas fa-check"></i> Build a plan that feels realistic</span></div></div>
        <div className="auth-card">
          <div className="auth-card-heading"><span className="auth-icon"><i className="fas fa-user-plus"></i></span><div><span className="auth-kicker">Free forever</span><h2>Create account</h2></div></div>
          <p className="auth-subtitle">Set up your personal finance workspace in under a minute.</p>
          {error && <div className="auth-error" role="alert"><i className="fas fa-circle-exclamation"></i>{error}</div>}
          {success && <div className="auth-success" role="status"><i className="fas fa-circle-check"></i>{success}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="signup-name">Full name</label>
            <input id="signup-name" type="text" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            <label htmlFor="signup-email">Email address</label>
            <input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            <label htmlFor="signup-password">Password</label>
            <div className="auth-password-field"><input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}><i className={showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'}></i></button></div>
            <label htmlFor="signup-confirm-password">Confirm password</label>
            <div className="auth-password-field"><input id="signup-confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" /><button type="button" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} onClick={() => setShowConfirmPassword(!showConfirmPassword)}><i className={showConfirmPassword ? 'fas fa-eye' : 'fas fa-eye-slash'}></i></button></div>
            <button type="submit" className="auth-submit">Create my account <i className="fas fa-arrow-right"></i></button>
          </form>
          <p className="auth-switch">Already have an account? <button type="button" onClick={onSwitchToLogin}>Sign in</button></p>
          <p className="auth-privacy"><i className="fas fa-lock"></i> Your data stays private in this browser.</p>
        </div>
      </section>
    </main>
  );
}

export default Signup;
