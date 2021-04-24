import { loginFactory } from '@app/features/auth/authFactories';

describe('Login page', () => {
  beforeEach(() => {
    cy.task('loadFixtures');

    cy.intercept('POST', '**/api/auth/login').as('login');
    cy.visit('/login');
  });

  it('shows the validation errors', () => {
    cy.findByRole('button', { name: /login/i }).click();

    cy.findByText('Email is required').should('be.visible');
    cy.findByText('Password is required').should('be.visible');

    cy.findByLabelText(/email/i).type('email');
    cy.findByLabelText(/password/i).type('123456');

    cy.findByText('Email needs to be a valid address').should('be.visible');
    cy.findByText('Password has to be at least 12 characters').should(
      'be.visible',
    );
  });

  it('login with existing user', () => {
    const data = {
      email: 'john@doe.me',
      password: 'appraisal-fretful-roving',
    };

    cy.findByLabelText(/email/i).type(data.email);
    cy.findByLabelText(/password/i).type(data.password);
    cy.findByRole('button', { name: /login/i }).click();

    cy.wait('@login').its('response.statusCode').should('equal', 200);
  });

  it('fails with non existing user', () => {
    const data = loginFactory.build();

    cy.findByLabelText(/email/i).type(data.email);
    cy.findByLabelText(/password/i).type(data.password);
    cy.findByRole('button', { name: /login/i }).click();

    cy.wait('@login').its('response.statusCode').should('equal', 401);
    cy.findByText(`There isn't any user with email: ${data.email}`).should(
      'be.visible',
    );
  });

  it('fails with incorrect password', () => {
    const data = loginFactory.build({ email: 'armando@martin.me' });

    cy.findByLabelText(/email/i).type(data.email);
    cy.findByLabelText(/password/i).type(data.password);
    cy.findByRole('button', { name: /login/i }).click();

    cy.wait('@login').its('response.statusCode').should('equal', 401);
    cy.findByText(`Wrong password for user with email: ${data.email}`).should(
      'be.visible',
    );
  });
});
