import {
  PayloadAction,
  SerializedError,
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';

import type { AppState } from '@app/app/store';
import * as api from '@app/features/expenses/expenseApi';
import type { ExpenseResponse as Expense } from '@app/pages/api/expenses/[[...id]]';
import type { ErrorResponse } from '@app/utils/middleware';

export type ExpenseState = typeof initialState;

export const createExpense = createAsyncThunk(
  'expenses/create',
  api.createExpense,
);
export const findExpenses = createAsyncThunk('expenses/find', api.findExpenses);
export const getExpense = createAsyncThunk('expenses/get', api.getExpense);
export const updateExpense = createAsyncThunk(
  'expenses/update',
  api.updateExpense,
);
export const removeExpense = createAsyncThunk(
  'expenses/remove',
  api.removeExpense,
);

const expensesAdapter = createEntityAdapter<Expense>({
  selectId: (expense) => expense._id,
  sortComparer: (expense1, expense2) =>
    expense1.createdAt.localeCompare(expense2.createdAt),
});

const initialState = expensesAdapter.getInitialState<{
  isLoading: boolean;
  error?: string;
  errors?: string[];
}>({ isLoading: false });

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearErrors(state) {
      delete state.error;
      delete state.errors;
    },
  },
  extraReducers: (builder) => {
    function buildLoadingState(state: ExpenseState) {
      state.isLoading = true;
    }

    function buildErrorState(
      state: ExpenseState,
      action: PayloadAction<
        ErrorResponse | undefined,
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
      if (action.meta.rejectedWithValue) {
        state.error = action.payload?.message;
        state.errors = action.payload?.errors;
      } else if (action.error) {
        state.error = action.error.message;
      }

      state.isLoading = false;
    }

    builder.addCase(createExpense.pending, buildLoadingState);
    builder.addCase(createExpense.fulfilled, (state, action) => {
      expensesAdapter.addOne(state, action.payload);
      state.isLoading = false;
    });
    builder.addCase(createExpense.rejected, buildErrorState);

    builder.addCase(findExpenses.pending, buildLoadingState);
    builder.addCase(findExpenses.fulfilled, (state, action) => {
      expensesAdapter.setAll(state, action.payload);
      state.isLoading = false;
    });
    builder.addCase(findExpenses.rejected, buildErrorState);

    builder.addCase(getExpense.pending, buildLoadingState);
    builder.addCase(getExpense.fulfilled, (state, action) => {
      expensesAdapter.addOne(state, action.payload);
      state.isLoading = false;
    });
    builder.addCase(getExpense.rejected, buildErrorState);

    builder.addCase(updateExpense.pending, buildLoadingState);
    builder.addCase(updateExpense.fulfilled, (state, action) => {
      expensesAdapter.upsertOne(state, action.payload);
      state.isLoading = false;
    });
    builder.addCase(updateExpense.rejected, buildErrorState);

    builder.addCase(removeExpense.pending, buildLoadingState);
    builder.addCase(removeExpense.fulfilled, (state, action) => {
      expensesAdapter.removeOne(state, action.meta.arg);
      state.isLoading = false;
    });
    builder.addCase(removeExpense.rejected, buildErrorState);
  },
});

export const { clearErrors } = expensesSlice.actions;

const selectors = expensesAdapter.getSelectors(
  (state: AppState) => state.expenses,
);

export const selectExpenses = selectors.selectAll;
export const selectExpense = selectors.selectById;
export const selectError = (state: AppState) => state.expenses.error;
export const selectErrors = (state: AppState) => state.expenses.errors;

export default expensesSlice.reducer;
