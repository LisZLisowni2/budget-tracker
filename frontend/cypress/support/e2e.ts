/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        clearDB(): Chainable<void>
    }
}

Cypress.Commands.add("clearDB", () => {
    const apiUrl = Cypress.env('apiUrl')
    cy.request('POST', `${apiUrl}/test/cleanup`)
})