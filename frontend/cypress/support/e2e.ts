/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        clearDB(): Chainable<void>
    }
}

Cypress.Commands.add("clearDB", () => {
    cy.request('POST', '/api/test/cleanup')
})