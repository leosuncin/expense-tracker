import type { NextPage } from 'next';
import { applySession } from 'next-iron-session';

import { wrapper } from '@app/app/store';
import { setUser } from '@app/features/auth/authSlice';
import type { UserJson } from '@app/features/auth/User';
import AddExpense from '@app/features/expenses/AddExpense';
import Expense, { ExpenseJson } from '@app/features/expenses/Expense';
import { setExpenses } from '@app/features/expenses/expenseSlice';
import ExpensesTable from '@app/features/expenses/ExpensesTable';
import { ApiRequest, sessionOptions } from '@app/utils/middleware';

const IndexPage: NextPage = () => {
  return (
    <>
      <AddExpense />
      <ExpensesTable />
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req, res }) => {
      await applySession(req, res, sessionOptions);
      const author = (req as ApiRequest).session.get<UserJson>('user');

      if (!author)
        return {
          redirect: {
            destination: '/login',
            permanent: true,
          },
        };

      const expenses = (await Expense.find({ author: author.id })).map(
        (expense) => expense.toJSON<ExpenseJson>(),
      );
      store.dispatch(setUser(author));
      store.dispatch(setExpenses(expenses));

      return {
        props: {},
      };
    },
);

export default IndexPage;
