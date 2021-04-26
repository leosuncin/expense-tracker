import {
  Action,
  AnyAction,
  ThunkAction,
  ThunkDispatch,
  configureStore,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import { createRouterMiddleware, routerReducer } from 'connected-next-router';

import authReducer from '@app/features/auth/authSlice';
import counterReducer from '@app/features/counter/counterSlice';
import expensesReducer from '@app/features/expenses/expenseSlice';

const routerMiddleware = createRouterMiddleware();

export function makeStore() {
  return configureStore({
    reducer: {
      counter: counterReducer,
      auth: authReducer,
      router: routerReducer,
      expenses: expensesReducer,
    },
    middleware: [...getDefaultMiddleware(), routerMiddleware],
  });
}

const store = makeStore();

export type AppState = ReturnType<typeof store.getState>;

export type AppDispatch = ThunkDispatch<AppState, null, AnyAction> &
  ThunkDispatch<AppState, undefined, AnyAction> &
  ThunkDispatch<AppDispatch, typeof routerMiddleware, AnyAction>;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;

export default store;
