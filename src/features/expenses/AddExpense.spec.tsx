/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { enableFetchMocks } from 'jest-fetch-mock';
import { createRouter } from 'next/router';

import { makeStore } from '@app/app/store';
import AddExpense from '@app/features/expenses/AddExpense';
import {
  createExpenseFactory,
  expenseFactory,
} from '@app/features/expenses/expenseFactories';
import { selectExpenses } from '@app/features/expenses/expenseSlice';
import { render } from '@app/utils/testUtils';

enableFetchMocks();

const oldWindowLocation = window.location;

describe('<AddExpense />', () => {
  beforeEach(() => {
    // @ts-expect-error
    delete window.location;

    window.location = Object.defineProperties(
      {},
      {
        ...Object.getOwnPropertyDescriptors(oldWindowLocation),
        href: {
          configurable: true,
          set: jest.fn(),
          get: jest.fn(() => ''),
        },
      },
    ) as Location;
  });

  afterEach(() => {
    window.location = oldWindowLocation;
  });

  it('renders the component', () => {
    render(<AddExpense />);

    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('shows the validation errors', async () => {
    render(<AddExpense />);

    user.click(screen.getByRole('button', { name: /add expense/i }));

    await expect(
      screen.findByText('Name is required'),
    ).resolves.toBeInTheDocument();
    await expect(
      screen.findByText('Amount needs to be a positive number'),
    ).resolves.toBeInTheDocument();
    await expect(
      screen.findByText('Description can not be empty'),
    ).resolves.toBeInTheDocument();

    user.type(screen.getByLabelText(/amount/i), '-10');

    await expect(
      screen.findByText('Amount needs to be a positive number'),
    ).resolves.toBeInTheDocument();
  });

  it('submit the form', async () => {
    const store = makeStore();
    const router = createRouter('/', {}, '/', {
      subscription: jest.fn().mockImplementation(Promise.resolve),
      initialProps: {},
      pageLoader: jest.fn(),
      Component: jest.fn(),
      App: jest.fn(),
      wrapApp: jest.fn(),
      isFallback: false,
    });
    const data = createExpenseFactory.build();
    const result = expenseFactory.build(
      data as Partial<ReturnType<typeof expenseFactory.build>>,
    );

    fetchMock.mockResponseOnce(JSON.stringify(result), { status: 201 });
    render(<AddExpense />, store, router);

    user.type(screen.getByLabelText(/name/i), data.name);
    user.type(screen.getByLabelText(/amount/i), String(data.amount));
    user.type(screen.getByLabelText(/description/i), String(data.description));
    user.type(screen.getByLabelText(/date/i), String(data.date));
    user.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /add expense/i }),
      ).toBeEnabled();
    });

    expect(store.getState().expenses).toMatchObject({
      entities: expect.any(Object),
      ids: expect.any(Array),
      isLoading: false,
    });
    expect(selectExpenses(store.getState())).toMatchObject([
      expect.objectContaining(result),
    ]);
  });

  it('shows the error', async () => {
    const store = makeStore();
    const data = createExpenseFactory.build();
    const router = createRouter('/login', {}, '/login', {
      subscription: jest.fn().mockImplementation(Promise.resolve),
      initialProps: {},
      pageLoader: jest.fn(),
      Component: jest.fn(),
      App: jest.fn(),
      wrapApp: jest.fn(),
      isFallback: false,
    });

    fetchMock.mockAbortOnce();
    render(<AddExpense />, store);

    user.type(screen.getByLabelText(/name/i), data.name);
    user.type(screen.getByLabelText(/amount/i), String(data.amount));
    user.type(screen.getByLabelText(/description/i), String(data.description));
    user.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /add expense/i }),
      ).toBeEnabled();
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      String(store.getState().expenses.error?.trim()),
    );

    jest
      .spyOn(router, 'push')
      .mockImplementation(async () => Promise.resolve(true));
    fetchMock.mockResponseOnce(
      JSON.stringify({
        message: 'You must be logged in order to access',
        statusCode: 401,
      }),
      { status: 401 },
    );

    user.type(screen.getByLabelText(/name/i), data.name);
    user.type(screen.getByLabelText(/amount/i), String(data.amount));
    user.type(screen.getByLabelText(/description/i), String(data.description));
    user.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /add expense/i }),
      ).toBeEnabled();
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'You must be logged in order to access',
    );
    expect(store.getState().expenses.error).toBe(
      'You must be logged in order to access',
    );
    expect(store.getState().auth.error).toBe(
      'You must be logged in order to access',
    );
  });
});
