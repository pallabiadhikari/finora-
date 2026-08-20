export const formatDate = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    // Optional: add Nepali calendar support
    // calendar: 'nepali'
  };
  return new Date(date).toLocaleDateString('en-US', options);
};