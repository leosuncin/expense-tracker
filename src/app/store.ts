import {
  Action,
  ThunkAction,
  configureStore,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import { createRouterMiddleware, routerReducer } from 'connected-next-router';

import authReducer from '@app/features/auth/authSlice';
import counterReducer from '@app/features/counter/counterSlice';

const routerMiddleware = createRouterMiddleware();

export function makeStore() {
  return configureStore({
    reducer: {
      counter: counterReducer,
      auth: authReducer,
      router: routerReducer,
    },
    middleware: [...getDefaultMiddleware(), routerMiddleware],
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
