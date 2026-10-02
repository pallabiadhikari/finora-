import { useState } from 'react';

function AddIncome({ onAddIncome }) {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    if (!source.trim() || !amount || Number(amount) <= 0) {
      setError('Please enter an income source and an amount greater than zero.');
      return;
    }

    onAddIncome({
      id: Date.now(),
      title: source.trim(),
      amount: Number(amount),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    });
    setSource('');
    setAmount('');
  };

  return (
    <div className="money-form money-form--income" id="income-form">
      <div className="money-form-heading"><span className="money-form-icon"><i className="fas fa-arrow-down"></i></span><div><span className="label">Money in</span><h3>Add income</h3></div></div>
      {error && <div className="form-error" role="alert"><i className="fas fa-circle-exclamation"></i>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input aria-label="Income source" type="text" placeholder="Salary, freelance, gift..." value={source} onChange={(event) => setSource(event.target.value)} />
        <input aria-label="Income amount" type="number" min="0" step="0.01" placeholder="Amount (Rs.)" value={amount} onChange={(event) => setAmount(event.target.value)} />
        <button type="submit" className="income-button"><i className="fas fa-plus"></i> Add income</button>
      </form>
    </div>
  );
}

export default AddIncome;
