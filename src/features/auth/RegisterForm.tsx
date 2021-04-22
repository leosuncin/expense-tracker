import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '@app/app/hooks';
import { RegisterUser, registerSchema } from '@app/features/auth/authSchemas';
import {
  register as registerUser,
  selectError,
} from '@app/features/auth/authSlice';

function RegisterForm() {
  const dispatch = useAppDispatch();
  const registerError = useAppSelector(selectError);
  const { handleSubmit, formState, register } = useForm<RegisterUser>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => dispatch(registerUser(data)))}>
      {registerError ? (
        <div role="alert">
          <p>{registerError}</p>
        </div>
      ) : null}
      <fieldset aria-disabled={formState.isSubmitting}>
        <label htmlFor="register-name">
          Name:
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(formState.errors.name)}
            {...register('name')}
          />
        </label>
        {formState.errors.name ? (
          <span role="alert">{formState.errors.name.message}</span>
        ) : null}
        <label htmlFor="register-email">
          Email:
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(formState.errors.email)}
            {...register('email')}
          />
        </label>
        {formState.errors.email ? (
          <span role="alert">{formState.errors.email.message}</span>
        ) : null}
        <label htmlFor="register-password">
          Password:
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(formState.errors.password)}
            {...register('password')}
          />
        </label>
        {formState.errors.password ? (
          <span role="alert">{formState.errors.password.message}</span>
        ) : null}
      </fieldset>
      <button type="submit" disabled={formState.isSubmitting}>
        Register
      </button>
    </form>
  );
}

export default RegisterForm;
