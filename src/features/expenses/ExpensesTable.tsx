import { useAppSelector } from '@app/app/hooks';
import type { ExpenseJson as Expense } from '@app/features/expenses/Expense';
import { selectExpenses } from '@app/features/expenses/expenseSlice';

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
          <ExpenseRow key={expense.id} {...expense} />
        ))}
      </tbody>
    </table>
  );
}

export default ExpensesTable;
