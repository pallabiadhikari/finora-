/* =====================================================
   Finora — Static data
   Category lists, payment methods, income sources,
   goal icons, currencies, date formats, and custom
   category icons.

   Referenced by: forms, dropdowns, Money, calculations,
   hooks, and the export util.
   ===================================================== */

/* ---------- Defaults ---------- */

export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_DATE_FORMAT = 'MMM D, YYYY';
export const DEFAULT_THEME = 'system';

/* ---------- Expense categories ---------- */

export const expenseCategories = [
  { id: 'food', label: 'Food', icon: 'fa-utensils' },
  { id: 'housing', label: 'Housing', icon: 'fa-house' },
  { id: 'transportation', label: 'Transportation', icon: 'fa-car' },
  { id: 'shopping', label: 'Shopping', icon: 'fa-bag-shopping' },
  { id: 'bills', label: 'Bills & Utilities', icon: 'fa-lightbulb' },
  { id: 'education', label: 'Education', icon: 'fa-graduation-cap' },
  { id: 'health', label: 'Health', icon: 'fa-heart-pulse' },
  { id: 'entertainment', label: 'Entertainment', icon: 'fa-film' },
  { id: 'travel', label: 'Travel', icon: 'fa-plane' },
  { id: 'fitness', label: 'Fitness', icon: 'fa-dumbbell' },
  { id: 'personal', label: 'Personal', icon: 'fa-shirt' },
  { id: 'other', label: 'Other', icon: 'fa-ellipsis' },
];

/* ---------- Payment methods ---------- */

export const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: 'fa-money-bill' },
  { id: 'debit', label: 'Debit Card', icon: 'fa-credit-card' },
  { id: 'credit', label: 'Credit Card', icon: 'fa-credit-card' },
  { id: 'bank', label: 'Bank Transfer', icon: 'fa-building-columns' },
  { id: 'wallet', label: 'Digital Wallet', icon: 'fa-wallet' },
  { id: 'other', label: 'Other', icon: 'fa-ellipsis' },
];

/* ---------- Income sources ---------- */

export const incomeSources = [
  { id: 'salary', label: 'Salary', icon: 'fa-briefcase' },
  { id: 'freelance', label: 'Freelance', icon: 'fa-laptop-code' },
  { id: 'business', label: 'Business', icon: 'fa-store' },
  { id: 'gift', label: 'Gift', icon: 'fa-gift' },
  { id: 'refund', label: 'Refund', icon: 'fa-rotate-left' },
  { id: 'other', label: 'Other', icon: 'fa-ellipsis' },
];

/* ---------- Goal icons ---------- */

// `id` is the semantic key stored on the goal.
// `icon` is the Font Awesome class used for rendering.
export const goalIcons = [
  { id: 'laptop', label: 'Laptop', icon: 'fa-laptop' },
  { id: 'phone', label: 'Phone', icon: 'fa-mobile-screen' },
  { id: 'home', label: 'Home', icon: 'fa-house' },
  { id: 'car', label: 'Car', icon: 'fa-car' },
  { id: 'plane', label: 'Travel', icon: 'fa-plane' },
  { id: 'graduation', label: 'Education', icon: 'fa-graduation-cap' },
  { id: 'gift', label: 'Gift', icon: 'fa-gift' },
  { id: 'piggy', label: 'Savings', icon: 'fa-piggy-bank' },
  { id: 'heart', label: 'Health', icon: 'fa-heart' },
  { id: 'star', label: 'Dream', icon: 'fa-star' },
];

/* ---------- Currencies ---------- */

export const currencies = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'NPR', label: 'Nepali Rupee', symbol: 'Rs.' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
];

/* ---------- Date formats ---------- */

// `id` is the actual format string used by the settings picker.
// Update via `dateFormats` ids only — do not invent new ids.
export const dateFormats = [
  { id: 'MMM D, YYYY', label: 'Sep 28, 2026' },
  { id: 'DD/MM/YYYY', label: '28/09/2026' },
  { id: 'MM/DD/YYYY', label: '09/28/2026' },
  { id: 'YYYY-MM-DD', label: '2026-09-28' },
];

/* ---------- Custom category icons ---------- */

export const customCategoryIcons = [
  { id: 'tag', icon: 'fa-tag' },
  { id: 'cart', icon: 'fa-cart-shopping' },
  { id: 'coffee', icon: 'fa-mug-hot' },
  { id: 'book', icon: 'fa-book' },
  { id: 'music', icon: 'fa-music' },
  { id: 'paw', icon: 'fa-paw' },
  { id: 'game', icon: 'fa-gamepad' },
  { id: 'tool', icon: 'fa-screwdriver-wrench' },
  { id: 'baby', icon: 'fa-baby' },
  { id: 'leaf', icon: 'fa-leaf' },
];

/* ---------- Lookup helpers ---------- */

export function findCurrency(code) {
  return currencies.find((c) => c.code === code) || currencies[0];
}

export function findDateFormats() {
  return dateFormats;
}

export function findPaymentMethod(id) {
  return paymentMethods.find((p) => p.id === id);
}

export function findIncomeSource(id) {
  return incomeSources.find((s) => s.id === id);
}