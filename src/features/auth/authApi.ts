import { AsyncThunkPayloadCreator } from '@reduxjs/toolkit';

import type { LoginUser, RegisterUser } from '@app/features/auth/authSchemas';

export type User = {
  name: string;
  email: string;
  isAdmin: boolean;
  _id: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
};

export type ErrorResponse = {
  message: string;
  statusCode: number;
  errors?: string[];
};

export const registerUser: AsyncThunkPayloadCreator<
  User,
  RegisterUser,
  { rejectValue: string }
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

  return response.json();
};

export const loginUser: AsyncThunkPayloadCreator<
  User,
  LoginUser,
  { rejectValue: string }
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

  return response.json();
};

export const logoutUser: AsyncThunkPayloadCreator<void> = async () => {
  void (await fetch('/api/auth/login', { method: 'DELETE' }));
};
