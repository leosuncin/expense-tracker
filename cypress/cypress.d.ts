import { User } from '@app/features/auth/User';

declare namespace Cypress {
  interface Chainable<Subject> {
    customCommand(): Chainable<number>;

    login(email: string, password: string): Chainable<User>;
  }
}
