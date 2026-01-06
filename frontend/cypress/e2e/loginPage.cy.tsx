/// <reference types="cypress"/>

describe("Login page", () => {
    const apiUrl = Cypress.env("apiUrl")

    beforeEach(() => {
        cy.clearDB()
        cy.request("POST", `${apiUrl}/users/register`, { username: "test", email: "test@example.com", password: "abc123" })
        cy.visit("/login")
    })

    it("Render login page", () => {
        cy.get("h1").should('contain', /Login form/i)
    })

    it("Password visible", () => {
        cy.get("#password").type("Hi!")
        cy.get("#password + span").click()
        cy.get("#password").should('have.attr', 'type', 'text')
    })

    it("Test without any data", () => {
        cy.get("button").click()
        cy.get("#usernameError").invoke("text").should('match', /^Username too short.*$/i) 
        cy.get("#passwordError").invoke("text").should('match', /^Password too short.*$/i) 
    })

    it("Input data and send data", () => {
        cy.get("#username").type("test")
        cy.get("#password").type("abc123")
        cy.get("button").click()
        cy.url().should("contain", "dashboard")
    })

    it("Input data with incorrect password", () => {
        cy.get("#username").type("test")
        cy.get("#password").type("def456")
        cy.get("button").click()
        cy.get("#passwordError").invoke("text").should('match', /^Wrong password$/i) 
    })

    it("Input data with incorrect login", () => {
        cy.get("#username").type("anotherTest")
        cy.get("#password").type("abc123")
        cy.get("button").click()
        cy.get("#usernameError").invoke("text").should('match', /^That username doesn't exist$/i) 
    })
})