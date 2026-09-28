import { useEffect, useState } from 'react';

const durationOptions = [
  { value: 'days', label: 'Custom days' },
  { value: 'week', label: '1 week' },
  { value: 'month', label: '1 month' },
  { value: 'year', label: '1 year' }
];

function AddBudget({ budget, onAddBudget, onDeleteBudget }) {
  const [amount, setAmount] = useState(budget?.amount || '');
  const [duration, setDuration] = useState('month');
  const [days, setDays] = useState(budget?.duration === 'days' ? budget.durationDays : '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (budget) {
      setAmount(budget.amount);
      setDuration(budget.duration);
      setDays(budget.duration === 'days' ? budget.durationDays : '');
    } else {
      setAmount('');
      setDuration('month');
      setDays('');
      setIsEditing(false);
    }
  }, [budget]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const durationDays = duration === 'days' ? Number(days) : duration === 'week' ? 7 : duration === 'month' ? 30 : 365;
    if (!amount || Number(amount) <= 0 || !durationDays || durationDays < 1) return;
    onAddBudget({ amount: Number(amount), duration, durationDays, createdAt: budget?.createdAt || new Date().toISOString() });
    setAmount('');
    setDays('');
    setIsEditing(false);
  };

  return (
    <div className="budget-setup">
      <div className="money-form-heading"><span className="money-form-icon money-form-icon--budget"><i className="fas fa-bullseye"></i></span><div><span className="label">Your plan</span><h3>{isEditing ? 'Edit budget' : 'Set a budget'}</h3></div></div>
      <p>Choose how long this spending limit should last. You can change it whenever your plans change.</p>
      {budget && !isEditing && <div className="budget-actions"><span>Rs. {Number(budget.amount).toFixed(2)} for {budget.duration === 'days' ? `${budget.durationDays} days` : budget.duration}</span><div><button type="button" className="text-action" onClick={() => setIsEditing(true)}><i className="fas fa-pen"></i> Edit</button><button type="button" className="text-action text-action--danger" onClick={onDeleteBudget}><i className="fas fa-trash"></i> Delete</button></div></div>}
      {(!budget || isEditing) && <>
      <form onSubmit={handleSubmit}>
        <input aria-label="Budget amount" type="number" min="0" step="0.01" placeholder="Budget amount (Rs.)" value={amount} onChange={(event) => setAmount(event.target.value)} />
        <select aria-label="Budget duration" value={duration} onChange={(event) => setDuration(event.target.value)}>{durationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        {duration === 'days' && <input aria-label="Number of budget days" type="number" min="1" max="365" placeholder="Number of days" value={days} onChange={(event) => setDays(event.target.value)} />}
        <button type="submit" className="primary-button"><i className="fas fa-check"></i> {isEditing ? 'Update budget' : 'Save budget'}</button>
      </form>
      {isEditing && <button type="button" className="cancel-budget-button" onClick={() => setIsEditing(false)}>Cancel</button>}
      </>}
    </div>
  );
}

export default AddBudget;
