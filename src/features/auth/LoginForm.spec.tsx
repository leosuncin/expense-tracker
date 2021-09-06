/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { enableFetchMocks } from 'jest-fetch-mock';
import { createRouter } from 'next/router';

import { makeStore } from '@app/app/store';
import { loginFactory, userFactory } from '@app/features/auth/authFactories';
import LoginForm from '@app/features/auth/LoginForm';
import { render } from '@app/utils/testUtils';

enableFetchMocks();

describe('<LoginForm />', () => {
  it('renders the component', () => {
    render(<LoginForm />);

    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('shows the validation errors', async () => {
    render(<LoginForm />);

    user.click(screen.getByRole('button', { name: /login/i }));

    await expect(
      screen.findByText('Email is required'),
    ).resolves.toBeInTheDocument();
    await expect(
      screen.findByText('Password has to be at least 12 characters'),
    ).resolves.toBeInTheDocument();

    user.type(screen.getByLabelText(/email/i), 'email');
    user.type(screen.getByLabelText(/password/i), '123456');

    await expect(
      screen.findByText('Email needs to be a valid address'),
    ).resolves.toBeInTheDocument();
    await expect(
      screen.findByText('Password has to be at least 12 characters'),
    ).resolves.toBeInTheDocument();
  });

  it('submit the form', async () => {
    const store = makeStore();
    const router = createRouter('/login', {}, '/login', {
      subscription: jest.fn().mockImplementation(Promise.resolve),
      initialProps: {},
      pageLoader: jest.fn(),
      Component: jest.fn(),
      App: jest.fn(),
      wrapApp: jest.fn(),
      isFallback: false,
    });
    const data = loginFactory.build();
    const result = userFactory.build({
      email: data.email,
      isAdmin: false,
    });

    const spyReplace = jest.spyOn(router, 'replace');
    fetchMock.mockResponseOnce(JSON.stringify(result), { status: 201 });
    render(<LoginForm />, store, router);

    user.type(screen.getByLabelText(/email/i), data.email);
    user.type(screen.getByLabelText(/password/i), data.password);
    user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /login/i })).toBeEnabled();
    });

    expect(store.getState().auth).toMatchObject(
      expect.objectContaining({
        isAuthenticated: true,
        isLoading: false,
        user: result,
      }),
    );
    expect(spyReplace).toHaveBeenCalledWith('/', undefined, undefined);
  });

  it('shows the error', async () => {
    const store = makeStore();
    const data = loginFactory.build({ email: 'john@doe.me' });

    fetchMock.mockResponseOnce(
      JSON.stringify({
        message: `Wrong password for user with email: ${data.email}`,
        statusCode: 401,
      }),
      { status: 401 },
    );
    render(<LoginForm />, store);

    user.type(screen.getByLabelText(/email/i), data.email);
    user.type(screen.getByLabelText(/password/i), data.password);
    user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /login/i })).toBeEnabled();
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      `Wrong password for user with email: ${data.email}`,
    );
    expect(store.getState().auth).toMatchObject(
      expect.objectContaining({
        isAuthenticated: false,
        isLoading: false,
        error: `Wrong password for user with email: ${data.email}`,
      }),
    );

    fetchMock.mockAbortOnce();
    user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /login/i })).toBeEnabled();
    });

    expect(store.getState().auth).toMatchObject({
      error: expect.any(String) as string,
      isAuthenticated: false,
      isLoading: false,
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      store.getState().auth.error!.trim(),
    );
  });
});
