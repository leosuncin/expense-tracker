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
  });
});
