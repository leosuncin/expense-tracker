import { AsyncThunkPayloadCreator } from '@reduxjs/toolkit';
import { push } from 'connected-next-router';

import type { AppDispatch, AppState } from '@app/app/store';
import { setError as setAuthError } from '@app/features/auth/authSlice';
import type { ExpenseJson as Expense } from '@app/features/expenses/Expense';
import type {
  CreateExpense,
  UpdateExpense,
} from '@app/features/expenses/expenseSchemas';
import { selectExpense } from '@app/features/expenses/expenseSlice';
import type { ErrorResponse } from '@app/utils/middleware';

export const createExpense: AsyncThunkPayloadCreator<
  Expense,
  CreateExpense,
  { rejectValue: ErrorResponse; dispatch: AppDispatch }
> = async (body, thunkApi) => {
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status >= 400 && response.status < 500) {
    const error = (await response.json()) as ErrorResponse;

    if (response.status === 401) {
      thunkApi.dispatch(setAuthError(error.message));
      thunkApi.dispatch(push('/login'));
    }

    return thunkApi.rejectWithValue(error);
  }

  return response.json();
};

export const findExpenses: AsyncThunkPayloadCreator<
  Expense[],
  void,
  { rejectValue: ErrorResponse; dispatch: AppDispatch }
> = async (_, thunkApi) => {
  const response = await fetch('/api/expenses');

  if (response.status >= 400 && response.status < 500) {
    const error = (await response.json()) as ErrorResponse;

    if (response.status === 401) {
      thunkApi.dispatch(setAuthError(error.message));
      thunkApi.dispatch(push('/login'));
    }

    return thunkApi.rejectWithValue(error);
  }

  return response.json();
};

export const getExpense: AsyncThunkPayloadCreator<
  Expense,
  Expense['id'],
  { rejectValue: ErrorResponse; dispatch: AppDispatch; state: AppState }
> = async (id, thunkApi) => {
  const expense = selectExpense(thunkApi.getState(), id);

  if (expense) return expense;

  const response = await fetch(`/api/expenses/${id}`);

  if (response.status >= 400 && response.status < 500) {
    const error = (await response.json()) as ErrorResponse;

    if (response.status === 401 || response.status === 403) {
      thunkApi.dispatch(setAuthError(error.message));
      thunkApi.dispatch(push('/login'));
    }

    return thunkApi.rejectWithValue(error);
  }

  return response.json();
};

export const updateExpense: AsyncThunkPayloadCreator<
  Expense,
  UpdateExpense & { id: Expense['id'] },
  { rejectValue: ErrorResponse; dispatch: AppDispatch }
> = async ({ id, ...body }, thunkApi) => {
  const response = await fetch(`/api/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status >= 400 && response.status < 500) {
    const error = (await response.json()) as ErrorResponse;

    if (response.status === 401 || response.status === 403) {
      thunkApi.dispatch(setAuthError(error.message));
      thunkApi.dispatch(push('/login'));
    }

    return thunkApi.rejectWithValue(error);
  }

  return response.json();
};

export const removeExpense: AsyncThunkPayloadCreator<
  void,
  Expense['id'],
  { rejectValue: ErrorResponse; dispatch: AppDispatch }
> = async (id, thunkApi) => {
  const response = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });

  if (response.status >= 400 && response.status < 500) {
    const error = (await response.json()) as ErrorResponse;

    if (response.status === 401 || response.status === 403) {
      thunkApi.dispatch(setAuthError(error.message));
      thunkApi.dispatch(push('/login'));
    }

    return thunkApi.rejectWithValue(error);
  }
};
