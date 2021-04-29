import { AsyncThunkPayloadCreator } from '@reduxjs/toolkit';
import { replace } from 'connected-next-router';

import { AppDispatch } from '@app/app/store';
import type { LoginUser, RegisterUser } from '@app/features/auth/authSchemas';
import type { UserJson as User } from '@app/features/auth/User';
import type { ErrorResponse } from '@app/utils/middleware';

export const registerUser: AsyncThunkPayloadCreator<
  User,
  RegisterUser,
  { rejectValue: string; dispatch: AppDispatch }
> = async (body, thunkApi) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status === 409 || response.status === 422) {
    const error: ErrorResponse = await response.json();

    return thunkApi.rejectWithValue(error.message);
  }

  thunkApi.dispatch(replace('/'));

  return response.json();
};

export const loginUser: AsyncThunkPayloadCreator<
  User,
  LoginUser,
  { rejectValue: string; dispatch: AppDispatch }
> = async (body, thunkApi) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401 || response.status === 422) {
    const error: ErrorResponse = await response.json();

    return thunkApi.rejectWithValue(error.message);
  }

  thunkApi.dispatch(replace('/'));

  return response.json();
};

export const logoutUser: AsyncThunkPayloadCreator<void> = async () => {
  void (await fetch('/api/auth/login', { method: 'DELETE' }));
};
