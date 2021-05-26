import { name } from 'faker';
import * as fc from 'fast-check';
import { ZodError } from 'zod';

import {
  LoginUser,
  RegisterUser,
  loginSchema,
  registerSchema,
} from '@app/features/auth/authSchemas';
import { fakerArbitrary } from '@app/utils/testUtils';

describe('Login Schema', () => {
  it('parse unknown data to login data', () => {
    fc.assert(
      fc.property(
        fc.record<LoginUser>({
          email: fc.emailAddress(),
          password: fc.unicodeString({ minLength: 12, maxLength: 32 }),
        }),
        (data) => {
          const login = loginSchema.parse(data);

          expect(login).toMatchObject<LoginUser>({
            email: data.email,
            password: data.password,
          });
        },
      ),
    );
  });

  it('validate invalid data', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.record<LoginUser>({
            email: fc.string(),
            password: fc.string({ maxLength: 11 }),
          }),
          fc.object(),
        ),
        (data) => {
          expect(loginSchema.parse.bind(loginSchema, data)).toThrow(ZodError);
        },
      ),
    );
  });
});

describe('Register Schema', () => {
  it('parse unknown data to register data', () => {
    fc.assert(
      fc.property(
        fc.record<RegisterUser>({
          email: fc.emailAddress(),
          password: fc.unicodeString({ minLength: 12, maxLength: 32 }),
          name: fakerArbitrary(name.findName),
        }),
        (data) => {
          const register = registerSchema.parse(data);

          expect(register).toMatchObject<RegisterUser>({
            email: data.email,
            password: data.password,
            name: data.name,
          });
        },
      ),
    );
  });

  it('validate invalid data', () => {
    fc.assert(
      fc.property(
        fc.record<RegisterUser>({
          email: fc.string(),
          password: fc.string({ maxLength: 11 }),
          name: fc.string({ maxLength: 2 }),
        }),
        (data) => {
          expect(registerSchema.parse.bind(registerSchema, data)).toThrow(
            ZodError,
          );
        },
      ),
    );
  });
});
