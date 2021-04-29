import type { GetServerSidePropsResult, NextPage } from 'next';
import { applySession } from 'next-iron-session';

import { wrapper } from '@app/app/store';
import type { User } from '@app/features/auth/authApi';
import { setUser } from '@app/features/auth/authSlice';
import AddExpense from '@app/features/expenses/AddExpense';
import { Expense } from '@app/features/expenses/Expense';
import { setExpenses } from '@app/features/expenses/expenseSlice';
import ExpensesTable from '@app/features/expenses/ExpensesTable';
import type { ExpenseResponse } from '@app/pages/api/expenses/[[...id]]';
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
  async ({ store, req, res }): Promise<GetServerSidePropsResult<unknown>> => {
    await applySession(req, res, sessionOptions);
    const author = (req as ApiRequest).session.get<User>('user');

    if (!author)
      return {
        redirect: {
          destination: '/login',
          permanent: true,
        },
      };

    const expenses = (await Expense.find({ author: author._id })).map(
      (expense) =>
        expense.toJSON({
          transform: (expense) => JSON.parse(JSON.stringify(expense)),
        }) as ExpenseResponse,
    );
    store.dispatch(setUser(author));
    store.dispatch(setExpenses(expenses));

    return {
      props: {},
    };
  },
);

export default IndexPage;
