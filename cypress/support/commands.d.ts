declare namespace Cypress {
  interface Chainable<Subject> {
    customCommand(): Chainable<number>;
  }
}
