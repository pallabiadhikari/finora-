import { useState } from 'react';

function Signup({ onSignup, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (existingUsers.find(user => user.email === email)) {
      setError('Email already registered. Please login.');
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name,
      email: email,
      password: password,
      createdAt: new Date().toLocaleDateString()
    };

    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));

    setSuccess('Account created successfully!');
    
    setTimeout(() => {
      onSignup(email, name);
    }, 1000);
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '60px auto',
      padding: '40px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <i className="fas fa-user-plus" style={{ fontSize: '48px', color: '#27ae60' }}></i>
        <h2 style={{ margin: '12px 0 4px 0', color: '#2c3e50' }}>Create Account</h2>
        <p style={{ color: '#7f8c8d', fontSize: '14px' }}>Start managing your expenses</p>
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

        {success && (
          <div style={{
            background: '#e8f8f0',
            color: '#27ae60',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
            {success}
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
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        <div style={{ marginBottom: '16px' }}>
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
              placeholder="Min 6 characters"
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

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            fontWeight: '500',
            color: '#2c3e50'
          }}>
            Confirm Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              <i className={showConfirmPassword ? 'fas fa-eye' : 'fas fa-eye-slash'}></i>
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
          <i className="fas fa-user-plus" style={{ marginRight: '8px' }}></i>
          Create Account
        </button>

        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#7f8c8d'
        }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#27ae60',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}

export default Signup;