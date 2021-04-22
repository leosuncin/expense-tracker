import {
  PayloadAction,
  SerializedError,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import type { AppState } from '@app/app/store';
import {
  User,
  loginUser,
  logoutUser,
  registerUser,
} from '@app/features/auth/authApi';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: User;
  error?: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
};

export const register = createAsyncThunk('auth/register', registerUser);

export const login = createAsyncThunk('auth/login', loginUser);

export const logout = createAsyncThunk('auth/logout', logoutUser);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      delete state.error;
    },
  },
  extraReducers: (builder) => {
    function buildLoadingState(state: AuthState) {
      state.isLoading = true;
    }

    function buildSuccessState(
      _: AuthState,
      action: PayloadAction<User>,
    ): AuthState {
      return {
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
      };
    }

    function buildErrorState(
      _: AuthState,
      action: PayloadAction<
        string | undefined,
        string,
        {
          arg: unknown;
          requestId: string;
          rejectedWithValue: boolean;
          requestStatus: 'rejected';
          aborted: boolean;
          condition: boolean;
        },
        SerializedError
      >,
    ) {
      if (action.meta.rejectedWithValue)
        return {
          isAuthenticated: false,
          isLoading: false,
          error: action.payload,
        };

      if (action.error)
        return {
          isAuthenticated: false,
          isLoading: false,
          error: action.error.message,
        };
    }

    function buildLogoutState() {
      return {
        isAuthenticated: false,
        isLoading: false,
      };
    }

    builder
      .addCase(register.pending, buildLoadingState)
      .addCase(login.pending, buildLoadingState)
      .addCase(logout.pending, buildLoadingState);

    builder
      .addCase(register.fulfilled, buildSuccessState)
      .addCase(login.fulfilled, buildSuccessState)
      .addCase(logout.fulfilled, buildLogoutState);

    builder
      .addCase(register.rejected, buildErrorState)
      .addCase(login.rejected, buildErrorState)
      .addCase(logout.rejected, buildLogoutState);
  },
});

export const { clearError } = authSlice.actions;

export const selectAuth = (state: AppState) => state.auth;

export const selectUser = (state: AppState) => state.auth.user;

export const selectError = (state: AppState) => state.auth.error;

export const selectIsAuthenticated = (state: AppState) =>
  state.auth.isAuthenticated;

export default authSlice.reducer;
