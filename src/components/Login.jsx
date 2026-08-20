import { useState } from 'react';

function Login({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setIsLoading(true);
    window.setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);

      if (user) {
        onLogin(user.email, user.name);
      } else {
        setError('We could not sign you in with those details. Please check your email and password, or create an account if you are new to Finora.');
        setIsLoading(false);
      }
    }, 350);
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand-top">
          <div className="brand auth-brand"><span className="brand-mark"><i className="fas fa-leaf" aria-hidden="true" /></span><span>finora</span></div>
          <span className="auth-status"><i className="fas fa-shield-halved" aria-hidden="true" /> Your money, your clarity</span>
        </div>
        <div className="auth-message">
          <span className="eyebrow light-eyebrow">A calmer way to manage money</span>
          <h1>Know where your money is going.</h1>
          <p>Finora brings your everyday spending, goals, and financial habits into one clear view.</p>
        </div>
        <div className="auth-quote"><span className="quote-mark">“</span><p>Small choices become meaningful progress when you can see the whole picture.</p><span className="quote-caption">Your personal finance companion</span></div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="mobile-auth-brand brand"><span className="brand-mark"><i className="fas fa-leaf" aria-hidden="true" /></span><span>finora</span></div>
          <div className="auth-heading"><span className="eyebrow">Welcome back</span><h2>Sign in to Finora</h2><p>Pick up right where you left off.</p></div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-error" role="alert"><i className="fas fa-circle-exclamation" aria-hidden="true" /><span>{error}</span></div>}
            <label htmlFor="login-email">Email address</label>
            <div className="auth-input-wrap"><i className="fas fa-envelope" aria-hidden="true" /><input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
            <div className="auth-label-row"><label htmlFor="login-password">Password</label><button type="button" className="forgot-button" onClick={() => setError('Password recovery will be available when Finora is connected to an authentication provider.')}>Forgot password?</button></div>
            <div className="auth-input-wrap"><i className="fas fa-lock" aria-hidden="true" /><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" /></button></div>
            <label className="remember-row"><input type="checkbox" /> <span>Keep me signed in</span></label>
            <button className="auth-submit" type="submit" disabled={isLoading}>{isLoading ? <><i className="fas fa-spinner fa-spin" aria-hidden="true" /> Signing you in...</> : <>Log in <i className="fas fa-arrow-right" aria-hidden="true" /></>}</button>
          </form>

          <p className="auth-switch">Don’t have a Finora account? <button type="button" onClick={onSwitchToSignup}>Create one</button></p>
          <p className="auth-legal">By continuing, you agree to Finora’s Terms and Privacy Policy.</p>
        </div>
      </section>
    </main>
  );
}

export default Login;