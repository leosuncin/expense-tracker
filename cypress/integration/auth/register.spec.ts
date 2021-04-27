import { StatusCodes } from 'http-status-codes';

import { registerFactory } from '@app/features/auth/authFactories';

describe('Register page', () => {
  beforeEach(() => {
    cy.task('loadFixtures', { filter: 'users.*' });

    cy.intercept('POST', '**/api/auth/register').as('register');
    cy.visit('/register');
  });

  it('shows the validation errors', () => {
    cy.findByRole('button', { name: /register/i }).click();

    cy.findByText('Name is required').should('be.visible');
    cy.findByText('Email is required').should('be.visible');
    cy.findByText('Password is required').should('be.visible');

    cy.findByLabelText(/name/i).type('a');
    cy.findByLabelText(/email/i).type('email');
    cy.findByLabelText(/password/i).type('123456');

    cy.findByText('Name has to be at least 2 letters').should('be.visible');
    cy.findByText('Email needs to be a valid address').should('be.visible');
    cy.findByText('Password has to be at least 12 characters').should(
      'be.visible',
    );
  });

  it('creates a new user', () => {
    const data = registerFactory.build();

    cy.findByLabelText(/name/i).type(data.name);
    cy.findByLabelText(/email/i).type(data.email);
    cy.findByLabelText(/password/i).type(data.password);
    cy.findByRole('button', { name: /register/i }).click();

    cy.wait('@register')
      .its('response.statusCode')
      .should('equal', StatusCodes.CREATED);
  });

  it('fails to register a duplicate user', () => {
    const data = registerFactory.build({ email: 'john@doe.me' });

    cy.findByLabelText(/name/i).type(data.name);
    cy.findByLabelText(/email/i).type(data.email);
    cy.findByLabelText(/password/i).type(data.password);
    cy.findByRole('button', { name: /register/i }).click();

    cy.wait('@register')
      .its('response.statusCode')
      .should('equal', StatusCodes.CONFLICT);
    cy.findByText('Duplicate data: is already register').should('be.visible');
  });
});
