import { useState, useEffect } from 'react';
import Header from './components/Header';
import Balance from './components/Balance';
import AddExpense from './components/AddExpense';
import ExpenseList from './components/ExpenseList';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('currentUser') || '';
  });

  const [showSignup, setShowSignup] = useState(false);

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', currentUser);
    }
  }, [currentUser]);

  const handleLogin = (email, name) => {
    setIsLoggedIn(true);
    const displayName = name || email.split('@')[0];
    setCurrentUser(displayName);
    localStorage.setItem('currentUser', displayName);
  };

  const handleSignup = (email, name) => {
    setIsLoggedIn(true);
    const displayName = name || email.split('@')[0];
    setCurrentUser(displayName);
    localStorage.setItem('currentUser', displayName);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
  };

  const addExpense = (newExpense) => {
    setExpenses([newExpense, ...expenses]);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const editExpense = (updatedExpense) => {
    setExpenses(expenses.map(exp => 
      exp.id === updatedExpense.id ? updatedExpense : exp
    ));
  };

  const filteredExpenses = filterCategory === 'All' 
    ? expenses 
    : expenses.filter(exp => exp.category === filterCategory);

  if (!isLoggedIn) {
    if (showSignup) {
      return (
        <Signup 
          onSignup={handleSignup} 
          onSwitchToLogin={() => setShowSignup(false)} 
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setShowSignup(true)} 
      />
    );
  }

  return (
    <div style={{ 
      maxWidth: '720px', 
      margin: '0 auto', 
      padding: '0'
    }}>
      <Header onLogout={handleLogout} currentUser={currentUser} />
      <Balance expenses={expenses} />
      <AddExpense onAddExpense={addExpense} />
      <ExpenseList 
        expenses={filteredExpenses} 
        onDeleteExpense={deleteExpense}
        onEditExpense={editExpense}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        totalExpenses={expenses.length}
      />
    </div>
  );
}

export default App;