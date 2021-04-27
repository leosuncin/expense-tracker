import {
  Action,
  AnyAction,
  DeepPartial,
  ThunkAction,
  ThunkDispatch,
  configureStore,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import { createRouterMiddleware, routerReducer } from 'connected-next-router';
import type { RouterState } from 'connected-next-router/types';

import authReducer, { AuthState } from '@app/features/auth/authSlice';
import expensesReducer, {
  ExpenseState,
} from '@app/features/expenses/expenseSlice';

const routerMiddleware = createRouterMiddleware();

export function makeStore(preloadedState?: DeepPartial<AppState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      router: routerReducer,
      expenses: expensesReducer,
    },
    middleware: [...getDefaultMiddleware(), routerMiddleware],
    preloadedState,
  });
}

const store = makeStore();

export type AppState = {
  auth: AuthState;
  router: RouterState;
  expenses: ExpenseState;
};

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
