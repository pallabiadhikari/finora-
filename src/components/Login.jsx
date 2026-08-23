import { useState } from 'react';

function Login({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      onLogin(email, user.name);
    } else {
      setError('Invalid email or password. Please try again or sign up.');
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '80px auto',
      padding: '40px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <i className="fas fa-wallet" style={{ fontSize: '48px', color: '#27ae60' }}></i>
        <h2 style={{ margin: '12px 0 4px 0', color: '#2c3e50' }}>Expense Tracker</h2>
        <p style={{ color: '#7f8c8d', fontSize: '14px' }}>Sign in to manage your expenses</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            background: '#fde8e8',
            color: '#e74c3c',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            fontWeight: '500',
            color: '#2c3e50'
          }}>
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e8ecf1',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#27ae60'}
            onBlur={(e) => e.target.style.borderColor = '#e8ecf1'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            fontWeight: '500',
            color: '#2c3e50'
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                paddingRight: '44px',
                border: '2px solid #e8ecf1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#27ae60'}
              onBlur={(e) => e.target.style.borderColor = '#e8ecf1'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#7f8c8d',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px'
              }}
            >
              <i className={showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'}></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '14px',
            background: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#219a52'}
          onMouseLeave={(e) => e.target.style.background = '#27ae60'}
        >
          <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
          Sign In
        </button>

        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#7f8c8d'
        }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            style={{
              background: 'none',
              border: 'none',
              color: '#27ae60',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;