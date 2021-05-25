/* eslint-disable import/no-unassigned-import */
// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
import '@testing-library/cypress/add-commands';
import '@cypress/code-coverage/support';

Cypress.Commands.add('customCommand', () => {
  return cy.wrap(42);
});

Cypress.Commands.add('login', (email: string, password: string) => {
  let user: Record<string, unknown>;
  let status: number;
  Cypress.Cookies.preserveOnce('app-session');
  const log = Cypress.log({
    name: 'login',
    message: `login with ${email}`,
    autoEnd: false,
    consoleProps() {
      return { user, status };
    },
  });

  return cy
    .clearCookies()
    .request('POST', '/api/auth/login', { email, password })
    .then((response: Cypress.Response) => {
      user = response.body;
      status = response.status;
      log.end();

      return user;
    });
});
