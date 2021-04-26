import { useAppSelector } from '@app/app/hooks';
import { selectExpenses } from '@app/features/expenses/expenseSlice';
import type { ExpenseResponse as Expense } from '@app/pages/api/expenses/[[...id]]';

function ExpenseRow({ name, amount, description, createdAt }: Expense) {
  return (
    <tr>
      <td>{name}</td>
      <td>{amount}</td>
      <td>{description}</td>
      <td>{new Date(createdAt).toLocaleDateString()}</td>
    </tr>
  );
}

function ExpensesTable() {
  const expenses = useAppSelector(selectExpenses);

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Amount</th>
          <th>Description</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <ExpenseRow key={expense._id} {...expense} />
        ))}
      </tbody>
    </table>
  );
}

export default ExpensesTable;
