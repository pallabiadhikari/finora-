import { useState } from 'react';
import { categories } from '../data/categories';

function EditExpense({ expense, onSave, onCancel }) {
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount);
  const [category, setCategory] = useState(expense.category);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim() || !amount) {
      alert('Please fill in all fields');
      return;
    }

    const updatedExpense = {
      ...expense,
      title: title.trim(),
      amount: parseFloat(amount),
      category: category
    };

    onSave(updatedExpense);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '450px',
        width: '100%',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>
            <i className="fas fa-edit" style={{ color: '#27ae60', marginRight: '8px' }}></i>
            Edit Expense
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>
            Update your expense details
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px', 
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              Title
            </label>
            <input
              type="text"
              placeholder="What did you spend on?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              Amount (Rs.)
            </label>
            <input
  type="number"
  placeholder="0.00"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
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
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e8ecf1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                background: 'white',
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
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: '1',
                padding: '12px',
                background: '#f0f2f5',
                color: '#2c3e50',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e8ecf1'}
              onMouseLeave={(e) => e.target.style.background = '#f0f2f5'}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: '2',
                padding: '12px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#219a52'}
              onMouseLeave={(e) => e.target.style.background = '#27ae60'}
            >
              <i className="fas fa-save" style={{ marginRight: '8px' }}></i>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditExpense;