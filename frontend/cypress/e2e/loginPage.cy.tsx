/// <reference types="cypress"/>

describe("Login page", () => {
    before(() => {
        cy.request("POST", "/api/users/register", { username: "test", email: "test@example.com", password: "abc123" })
    })

    after(() => {
        cy.clearDB()
    })

    it("Render login page", () => {
        cy.visit("/login")
        cy.get("h1").should('contain', /Login form/i)
    })

    it("Password visible", () => {
        cy.visit("/login")
        cy.get("#password").type("Hi!")
        cy.get("#password + span").click()
        cy.get("#password").should('have.attr', 'type', 'text')
    })

    it("Test without any data", () => {
        cy.visit("/login")
        cy.get("button").click()
        cy.get('#status')
            .should('contain.text', 'Username or password not present')
    })

    it("Input data and send data", () => {
        cy.visit("/login")
        cy.get("input[id=\"login\"").type("test")
        cy.get("input[id=\"password\"").type("abc123")
        cy.get("button").click()
        cy.url().should("contain", "dashboard")
    })

    it("Input data with incorrect password", () => {
        cy.visit("/login")
        cy.get("input[id=\"login\"").type("test")
        cy.get("input[id=\"password\"").type("def456")
        cy.get("button").click()
        cy.get("#passwordError").invoke("text").should('match', /^Wrong password$/i) 
    })

    it("Input data with incorrect login", () => {
        cy.visit("/login")
        cy.get("input[id=\"login\"").type("anotherTest")
        cy.get("input[id=\"password\"").type("abc123")
        cy.get("button").click()
        cy.get("#usernameError").invoke("text").should('match', /^That username doesn't exist$/i) 
    })
})