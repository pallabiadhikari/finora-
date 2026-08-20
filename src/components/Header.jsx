function Header({ onLogout, currentUser }) {
  // Capitalize first letter, rest small
  const capitalizeName = (name) => {
    if (!name) return 'User';
    // If it's an email, extract name before @
    if (name.includes('@')) {
      name = name.split('@')[0];
    }
    // Get first word only
    name = name.split(' ')[0];
    // Capitalize first letter, rest small
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const displayName = capitalizeName(currentUser || localStorage.getItem('currentUser') || 'User');

  return (
    <>
      <header style={{
        background: 'linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)',
        color: 'white',
        padding: '20px 24px',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(26, 71, 42, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="fas fa-wallet" style={{ fontSize: '24px' }}></i>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '600', letterSpacing: '-0.5px' }}>
              Expense Tracker
            </h1>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
              <i className="fas fa-user" style={{ marginRight: '4px' }}></i>
              Welcome, {displayName}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </header>

    </>
  );
}

export default Header;