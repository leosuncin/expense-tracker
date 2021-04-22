import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '@app/app/hooks';
import { LoginUser, loginSchema } from '@app/features/auth/authSchemas';
import { login, selectError } from '@app/features/auth/authSlice';

function LoginForm() {
  const dispatch = useAppDispatch();
  const loginError = useAppSelector(selectError);
  const { handleSubmit, formState, register } = useForm<LoginUser>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => dispatch(login(data)))}>
      {loginError ? (
        <div role="alert">
          <p>{loginError}</p>
        </div>
      ) : null}
      <fieldset aria-disabled={formState.isSubmitting}>
        <label htmlFor="login-email">
          Email:
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(formState.errors.email)}
            {...register('email')}
          />
        </label>
        {formState.errors.email ? (
          <span role="alert">{formState.errors.email.message}</span>
        ) : null}
        <label htmlFor="login-password">
          Password:
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(formState.errors.password)}
            {...register('password')}
          />
        </label>
        {formState.errors.password ? (
          <span role="alert">{formState.errors.password.message}</span>
        ) : null}
      </fieldset>
      <button type="submit" disabled={formState.isSubmitting}>
        Login
      </button>
    </form>
  );
}

export default LoginForm;
