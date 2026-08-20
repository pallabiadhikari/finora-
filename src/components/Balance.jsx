function Balance({ expenses }) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalExpenses = expenses.length;
  
  // Calculate total spend (sum of all expenses)
  const totalSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Get current month and year for display
  const now = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  // Calculate this month's spending
  const thisMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === now.getMonth() && 
           expDate.getFullYear() === now.getFullYear();
  });
  const monthlySpend = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div style={{
      background: 'white',
      padding: '20px 24px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px', fontWeight: '500' }}>
            Total Balance
          </p>
          <h2 style={{ 
            margin: '4px 0 0 0', 
            fontSize: '32px', 
            fontWeight: '700',
            color: total >= 0 ? '#27ae60' : '#e74c3c'
          }}>
            Rs. {total.toFixed(2)}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '13px' }}>
            <i className="fas fa-receipt" style={{ marginRight: '4px' }}></i>
            {totalExpenses} transactions
          </p>
        </div>
      </div>

      {/* Total Spend Section */}
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #e8ecf1',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        <div style={{
          background: '#f8f9fa',
          padding: '12px 16px',
          borderRadius: '8px'
        }}>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '12px', fontWeight: '500' }}>
            <i className="fas fa-chart-line" style={{ marginRight: '4px' }}></i>
            Total Spend
          </p>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '20px', 
            fontWeight: '700',
            color: '#e94560'
          }}>
            Rs. {totalSpend.toFixed(2)}
          </p>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '12px 16px',
          borderRadius: '8px'
        }}>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '12px', fontWeight: '500' }}>
            <i className="fas fa-calendar-alt" style={{ marginRight: '4px' }}></i>
            {currentMonth} {currentYear}
          </p>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '20px', 
            fontWeight: '700',
            color: '#27ae60'
          }}>
            Rs. {monthlySpend.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Balance;