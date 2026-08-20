import { useState } from 'react';
import { categories } from '../data/categories';

function AddExpense({ onAddExpense }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim() || !amount) {
      alert('Please fill in all fields');
      return;
    }

    const newExpense = {
      id: Date.now(),
      title: title.trim(),
      amount: parseFloat(amount),
      category: category,
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    };

    onAddExpense(newExpense);
    setTitle('');
    setAmount('');
    setCategory('Food');
  };

  return (
    <div style={{
      background: 'white',
      padding: '20px 24px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '20px'
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0', 
        fontSize: '16px', 
        fontWeight: '600',
        color: '#2c3e50'
      }}>
        <i className="fas fa-plus-circle" style={{ color: '#27ae60', marginRight: '8px' }}></i>
        Add Expense
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="What did you spend on?" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ 
                flex: '1',
                padding: '12px 16px',
                border: '2px solid #e8ecf1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                minWidth: '150px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#27ae60'}
              onBlur={(e) => e.target.style.borderColor = '#e8ecf1'}
            />
            <input 
              type="number" 
              placeholder="Amount (Rs.)" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ 
                flex: '0.7',
                padding: '12px 16px',
                border: '2px solid #e8ecf1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                minWidth: '120px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#27ae60'}
              onBlur={(e) => e.target.style.borderColor = '#e8ecf1'}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                flex: '1',
                padding: '12px 16px',
                border: '2px solid #e8ecf1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                background: 'white',
                minWidth: '150px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#27ae60'}
              onBlur={(e) => e.target.style.borderColor = '#e8ecf1'}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button 
              type="submit"
              style={{
                padding: '12px 32px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '120px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.target.style.background = '#219a52'}
              onMouseLeave={(e) => e.target.style.background = '#27ae60'}
            >
              <i className="fas fa-plus"></i>
              Add Expense
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddExpense;