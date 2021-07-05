import {
  Action,
  AnyAction,
  CombinedState,
  DeepPartial,
  PreloadedState,
  ThunkAction,
  ThunkDispatch,
  configureStore,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import {
  createRouterMiddleware,
  initialRouterState,
  routerReducer,
} from 'connected-next-router';
import type { RouterState } from 'connected-next-router/types';
import { createWrapper } from 'next-redux-wrapper';
import type { AppContext } from 'next/app';
import Router from 'next/router';

import authReducer, { AuthState } from '@app/features/auth/authSlice';
import expensesReducer, {
  ExpenseState,
} from '@app/features/expenses/expenseSlice';

const routerMiddleware = createRouterMiddleware();

export function makeStore(
  preloadedState?: PreloadedState<CombinedState<AppState>>,
) {
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

export const wrapper = createWrapper((context) => {
  let initialState: DeepPartial<AppState> = {};
  const { asPath } = (context as AppContext).ctx ?? Router.router ?? {};

  if (asPath) {
    initialState = {
      router: initialRouterState(asPath),
    };
  }

  return makeStore(initialState as PreloadedState<AppState>);
});
