import { AsyncThunkPayloadCreator } from '@reduxjs/toolkit';
import { push } from 'connected-next-router';

import type { AppDispatch } from '@app/app/store';
import { setError as setAuthError } from '@app/features/auth/authSlice';
import type {
  CreateExpense,
  UpdateExpense,
} from '@app/features/expenses/expenseSchemas';
import type { ExpenseResponse as Expense } from '@app/pages/api/expenses/[[...id]]';
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
    const error: ErrorResponse = await response.json();

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
    const error: ErrorResponse = await response.json();

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
  Expense['_id'],
  { rejectValue: ErrorResponse; dispatch: AppDispatch }
> = async (id, thunkApi) => {
  const response = await fetch(`/api/expenses/${id}`);

  if (response.status >= 400 && response.status < 500) {
    const error: ErrorResponse = await response.json();

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
  UpdateExpense & { _id: Expense['_id'] },
  { rejectValue: ErrorResponse; dispatch: AppDispatch }
> = async ({ _id: id, ...body }, thunkApi) => {
  const response = await fetch(`/api/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status >= 400 && response.status < 500) {
    const error: ErrorResponse = await response.json();

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
  Expense['_id'],
  { rejectValue: ErrorResponse; dispatch: AppDispatch }
> = async (id, thunkApi) => {
  const response = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });

  if (response.status >= 400 && response.status < 500) {
    const error: ErrorResponse = await response.json();

    if (response.status === 401 || response.status === 403) {
      thunkApi.dispatch(setAuthError(error.message));
      thunkApi.dispatch(push('/login'));
    }

    return thunkApi.rejectWithValue(error);
  }
};
