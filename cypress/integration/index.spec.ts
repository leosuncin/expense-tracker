import { StatusCodes } from 'http-status-codes';

import { createExpenseFactory } from '@app/features/expenses/expenseFactories';

describe('Expense tracker', () => {
  beforeEach(() => {
    cy.task('loadFixtures');
    cy.intercept('POST', '**/api/expenses').as('createExpense');
  });

  context('Unauthenticated', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('redirects to login', () => {
      cy.location('pathname').should('equal', '/login');
    });
  });

  context('Authenticated', () => {
    beforeEach(() => {
      cy.login('armando@martin.me', 'reversion-rockband-bonding');
      cy.visit('/');
    });

    it('list the expenses', () => {
      cy.findAllByRole('rowgroup').last().should('not.be.empty');
    });

    it('add a new expense', () => {
      const data = createExpenseFactory.build();

      cy.findByLabelText(/name/i).type(data.name);
      cy.findByLabelText(/amount/i).type(String(data.amount));
      cy.findByLabelText(/description/i).type(String(data.description));
      cy.findByRole('button', { name: /add expense/i }).click();

      cy.wait('@createExpense')
        .its('response.statusCode')
        .should('equal', StatusCodes.CREATED);

      cy.findByRole('cell', { name: data.name }).should('exist');
    });

    it('show validation errors', () => {
      cy.findByRole('button', { name: /add expense/i }).click();

      cy.findByText('Name is required').should('be.visible');
      cy.findByText('Amount needs to be a positive number').should(
        'be.visible',
      );
      cy.findByText('Description can not be empty').should('be.visible');

      cy.findByLabelText(/date/i).clear();
      cy.findByText('Invalid date').should('be.visible');
      cy.findByLabelText(/amount/i).type('{selectall}-10');
      cy.findByText('Amount needs to be a positive number').should(
        'be.visible',
      );
    });

    it('show error when lost session', () => {
      const data = createExpenseFactory.build();

      cy.findByLabelText(/name/i).type(data.name);
      cy.findByLabelText(/amount/i).type(String(data.amount));
      cy.findByLabelText(/description/i).type(String(data.description));
      cy.clearCookies();
      cy.findByRole('button', { name: /add expense/i }).click();

      cy.findByText('You must be logged in order to access').should(
        'be.visible',
      );

      cy.wait('@createExpense')
        .its('response.statusCode')
        .should('equal', StatusCodes.UNAUTHORIZED);

      cy.location('pathname').should('equal', '/login');
    });
  });
});
