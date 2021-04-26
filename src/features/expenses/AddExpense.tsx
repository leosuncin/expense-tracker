import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '@app/app/hooks';
import {
  CreateExpense,
  createExpenseSchema,
} from '@app/features/expenses/expenseSchemas';
import {
  createExpense,
  selectError,
} from '@app/features/expenses/expenseSlice';

function AddExpense() {
  const dispatch = useAppDispatch();
  const expenseError = useAppSelector(selectError);
  const { handleSubmit, register, formState, reset } = useForm<CreateExpense>({
    resolver: zodResolver(createExpenseSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(async (formData) => {
        await dispatch(createExpense(formData));
        reset();
      })}
    >
      {expenseError ? (
        <div role="alert">
          <p>{expenseError}</p>
        </div>
      ) : null}
      <fieldset aria-disabled={formState.isSubmitting}>
        <div>
          <label htmlFor="add-expense-name">
            Name:
            <input
              id="add-expense-name"
              type="text"
              aria-invalid={Boolean(formState.errors.name)}
              {...register('name')}
            />
          </label>
          {formState.errors.name ? (
            <span role="alert">{formState.errors.name.message}</span>
          ) : null}
        </div>
        <div>
          <label htmlFor="add-expense-amount">
            Amount:
            <input
              id="add-expense-amount"
              type="text"
              pattern="^[0-9]+(\.?[0-9]{0,2})?$"
              inputMode="decimal"
              defaultValue="0"
              aria-invalid={Boolean(formState.errors.amount)}
              {...register('amount', { valueAsNumber: true })}
            />
          </label>
          {formState.errors.amount ? (
            <span role="alert">{formState.errors.amount.message}</span>
          ) : null}
        </div>
        <div>
          <label htmlFor="add-expense-description">Description:</label>
          <textarea
            id="add-expense-description"
            aria-invalid={Boolean(formState.errors.description)}
            {...register('description')}
          ></textarea>
          {formState.errors.description ? (
            <span role="alert">{formState.errors.description.message}</span>
          ) : null}
        </div>
      </fieldset>
      <button type="submit" disabled={formState.isSubmitting}>
        Add expense
      </button>
    </form>
  );
}

export default AddExpense;
