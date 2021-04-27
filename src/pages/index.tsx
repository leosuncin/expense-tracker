import type { NextPage } from 'next';
import { useEffect } from 'react';

import { useAppDispatch } from '@app/app/hooks';
import AddExpense from '@app/features/expenses/AddExpense';
import { findExpenses } from '@app/features/expenses/expenseSlice';
import ExpensesTable from '@app/features/expenses/ExpensesTable';

const IndexPage: NextPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const promise = dispatch(findExpenses());

    return () => {
      promise.abort();
    };
  }, [dispatch]);

  return (
    <>
      <AddExpense />
      <ExpensesTable />
    </>
  );
};

export default IndexPage;
