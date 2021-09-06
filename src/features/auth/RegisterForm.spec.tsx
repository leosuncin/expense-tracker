/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { enableFetchMocks } from 'jest-fetch-mock';
import { createRouter } from 'next/router';

import { makeStore } from '@app/app/store';
import { registerFactory, userFactory } from '@app/features/auth/authFactories';
import RegisterForm from '@app/features/auth/RegisterForm';
import { render } from '@app/utils/testUtils';

enableFetchMocks();

describe('<RegisterForm />', () => {
  it('renders the component', () => {
    render(<RegisterForm />);

    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('shows the validation errors', async () => {
    render(<RegisterForm />);

    user.click(screen.getByRole('button', { name: /register/i }));

    await expect(
      screen.findByText('Name has to be at least 2 letters'),
    ).resolves.toBeInTheDocument();
    await expect(
      screen.findByText('Email is required'),
    ).resolves.toBeInTheDocument();
    await expect(
      screen.findByText('Password has to be at least 12 characters'),
    ).resolves.toBeInTheDocument();

    user.type(screen.getByLabelText(/name/i), 'a');
    user.type(screen.getByLabelText(/email/i), 'email');
    user.type(screen.getByLabelText(/password/i), '123456');

    await expect(
      screen.findByText('Name has to be at least 2 letters'),
    ).resolves.toBeInTheDocument();
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
    const data = registerFactory.build();
    const result = userFactory.build({
      name: data.name,
      email: data.email,
      isAdmin: false,
    });

    const spyReplace = jest.spyOn(router, 'replace');
    fetchMock.mockResponseOnce(JSON.stringify(result), { status: 201 });
    render(<RegisterForm />, store, router);

    user.type(screen.getByLabelText(/name/i), data.name);
    user.type(screen.getByLabelText(/email/i), data.email);
    user.type(screen.getByLabelText(/password/i), data.password);
    user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /register/i })).toBeEnabled();
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
    const data = registerFactory.build({ email: 'john@doe.me' });

    fetchMock.mockResponseOnce(
      JSON.stringify({
        errors: ['email is already taken'],
        message: 'Duplicate data: is already register',
        statusCode: 409,
      }),
      { status: 409 },
    );
    render(<RegisterForm />, store);

    user.type(screen.getByLabelText(/name/i), data.name);
    user.type(screen.getByLabelText(/email/i), data.email);
    user.type(screen.getByLabelText(/password/i), data.password);
    user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /register/i })).toBeEnabled();
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Duplicate data: is already register',
    );
    expect(store.getState().auth).toMatchObject(
      expect.objectContaining({
        isAuthenticated: false,
        isLoading: false,
        error: 'Duplicate data: is already register',
      }),
    );

    fetchMock.mockAbortOnce();
    user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /register/i })).toBeEnabled();
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
