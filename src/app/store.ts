import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';

import authReducer from '@app/features/auth/authSlice';
import counterReducer from '@app/features/counter/counterSlice';

export function makeStore() {
  return configureStore({
    reducer: { counter: counterReducer, auth: authReducer },
  });
}

const store = makeStore();

export type AppState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;

export default store;
