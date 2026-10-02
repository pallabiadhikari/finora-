/* =====================================================
   Finora — Storage helpers
   Thin wrappers around the record API. Each entity
   (expense, income, budget, goal) has the same shape:
     get     → list all
     add     → create one, return the new list
     update  → edit one, return the new list
     delete  → remove one, return the new list

   Errors are NOT swallowed — callers should try/catch.
   The pages already do this and show empty/error states.
   ===================================================== */

import {
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from './api';

// Server-side "kind" strings — change these in one place if the
// backend ever renames an endpoint.
const KINDS = {
  expense: 'expense',
  income: 'income',
  budget: 'budget',
  goal: 'goal',
};

/* ---------- Factory ---------- */

// Builds { get, add, update, remove } for a given record kind.
function makeStorage(kind) {
  // List all records of this kind. Throws on API failure.
  async function get() {
    const res = await listRecords(kind);
    return res?.records || [];
  }

  // Create one record, then return the fresh list.
  // Uses the record returned by the API to update in place, then
  // refetches once so ordering from the server is preserved.
  async function add(record) {
    await createRecord(kind, record);
    return get();
  }

  // Update one record by id, then return the fresh list.
  async function update(record) {
    if (!record?.id) {
      throw new Error(`Cannot update ${kind}: missing id`);
    }
    await updateRecord(kind, record.id, record);
    return get();
  }

  // Delete one record by id, then return the fresh list.
  async function remove(id) {
    if (!id) {
      throw new Error(`Cannot delete ${kind}: missing id`);
    }
    await deleteRecord(kind, id);
    return get();
  }

  return { get, add, update, remove };
}

/* ---------- Concrete storage objects ---------- */

const expenseStorage = makeStorage(KINDS.expense);
const incomeStorage = makeStorage(KINDS.income);
const budgetStorage = makeStorage(KINDS.budget);
const goalStorage = makeStorage(KINDS.goal);

/* ---------- Expenses ---------- */

export const getExpenses = expenseStorage.get;
export const addExpense = expenseStorage.add;
export const updateExpense = expenseStorage.update;
export const deleteExpense = expenseStorage.remove;

/* ---------- Income ---------- */

export const getIncomes = incomeStorage.get;
export const addIncome = incomeStorage.add;
export const updateIncome = incomeStorage.update;
export const deleteIncome = incomeStorage.remove;

/* ---------- Budgets ---------- */

export const getBudgets = budgetStorage.get;
export const addBudget = budgetStorage.add;
export const updateBudget = budgetStorage.update;
export const deleteBudget = budgetStorage.remove;

/* ---------- Goals ---------- */

export const getGoals = goalStorage.get;
export const addGoal = goalStorage.add;
export const updateGoal = goalStorage.update;
export const deleteGoal = goalStorage.remove;