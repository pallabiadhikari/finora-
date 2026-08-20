import { useState } from 'react';
import EditExpense from './EditExpense';

function ExpenseList({ expenses, onDeleteExpense, onEditExpense, filterCategory, setFilterCategory }) {
  const [editingExpense, setEditingExpense] = useState(null);
  
  const categories = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
  
  const getCategoryIcon = (categoryName) => {
    const categoryMap = {
      'Food': 'fa-utensils',
      'Transport': 'fa-car',
      'Shopping': 'fa-shopping-bag',
      'Bills': 'fa-file-invoice',
      'Entertainment': 'fa-film',
      'Health': 'fa-heartbeat',
      'Education': 'fa-graduation-cap',
      'Other': 'fa-ellipsis-h'
    };
    return categoryMap[categoryName] || 'fa-tag';
  };

  const getCategoryColor = (categoryName) => {
    const colorMap = {
      'Food': '#e94560',
      'Transport': '#0f3460',
      'Shopping': '#2ecc71',
      'Bills': '#f39c12',
      'Entertainment': '#9b59b6',
      'Health': '#e74c3c',
      'Education': '#3498db',
      'Other': '#95a5a6'
    };
    return colorMap[categoryName] || '#95a5a6';
  };

  const handleEditSave = (updatedExpense) => {
    onEditExpense(updatedExpense);
    setEditingExpense(null);
  };

  if (expenses.length === 0) {
    return (
      <div style={{
        background: 'white',
        padding: '40px 24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        textAlign: 'center'
      }}>
        <i className="fas fa-receipt" style={{ fontSize: '48px', color: '#dce0e5', display: 'block', marginBottom: '16px' }}></i>
        <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '18px' }}>No expenses yet</h3>
        <p style={{ margin: 0, color: '#95a5a6', fontSize: '14px' }}>Start tracking your spending today!</p>
      </div>
    );
  }

  return (
    <>
      <div style={{
        background: 'white',
        padding: '20px 24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#2c3e50'
          }}>
            <i className="fas fa-list-ul" style={{ color: '#27ae60', marginRight: '8px' }}></i>
            Expenses ({expenses.length})
          </h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  padding: '4px 12px',
                  background: filterCategory === cat ? '#27ae60' : '#f0f2f5',
                  color: filterCategory === cat ? 'white' : '#2c3e50',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: filterCategory === cat ? '600' : '400'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {expenses.map(expense => (
            <div 
              key={expense.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: getCategoryColor(expense.category),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <i className={`fas ${getCategoryIcon(expense.category)}`}></i>
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '15px', color: '#2c3e50' }}>
                    {expense.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#95a5a6' }}>
                    {expense.category} • {expense.date}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                  Rs. {expense.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => setEditingExpense(expense)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#95a5a6',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#27ae60'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#95a5a6'}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => onDeleteExpense(expense.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#95a5a6',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#e94560'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#95a5a6'}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingExpense && (
        <EditExpense
          expense={editingExpense}
          onSave={handleEditSave}
          onCancel={() => setEditingExpense(null)}
        />
      )}
    </>
  );
}

export default ExpenseList;