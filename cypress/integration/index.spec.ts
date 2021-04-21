describe('Example Counter test', () => {
  beforeEach(() => {
    // https://on.cypress.io/visit
    cy.visit('/');
  });

  it('shows "Redux Toolkit"', () => {
    cy.findByText(/redux toolkit/i, { selector: 'a' }).should('exist');
  });

  it('calls custom commands from support file', () => {
    cy.customCommand().should('equal', 42);
  });

  it('calls into plugins process via cy.task', () => {
    cy.task('log', 'Hello Node!');
  });

  // More examples
  //
  // https://github.com/cypress-io/cypress-example-todomvc
  // https://github.com/cypress-io/cypress-example-kitchensink
  // https://on.cypress.io/writing-your-first-test
});
