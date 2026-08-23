export const formatDate = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };
  return new Date(date).toLocaleDateString('en-US', options);
};

export const capitalizeName = (name) => {
  if (!name) return 'User';
  if (name.includes('@')) {
    name = name.split('@')[0];
  }
  name = name.split(' ')[0];
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};