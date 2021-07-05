/**
 * @jest-environment jsdom
 */

import type { Dictionary } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { makeStore } from '@app/app/store';
import type { ExpenseJson as Expense } from '@app/features/expenses/Expense';
import { expenseFactory } from '@app/features/expenses/expenseFactories';
import ExpensesTable from '@app/features/expenses/ExpensesTable';
import { render } from '@app/utils/testUtils';

describe('<ExpensesTable />', () => {
  it('renders the component', () => {
    render(<ExpensesTable />);

    expect(screen.getAllByRole('rowgroup')[1]).toBeEmptyDOMElement();
  });

  it('lists all the expenses', () => {
    const expenses = expenseFactory.buildList(10);
    const entities: Dictionary<Expense> = {};
    const ids: string[] = [];

    for (const expense of expenses) {
      entities[expense.id] = expense;
      ids.push(expense.id);
    }

    const store = makeStore({ expenses: { entities, ids, isLoading: false } });

    render(<ExpensesTable />, store);

    expect(screen.getAllByRole('row')).toHaveLength(expenses.length + 1);
  });
});
