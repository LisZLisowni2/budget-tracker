/// <reference types="cypress"/>

describe("Login page", () => {
    after(() => {
        cy.clearDB()
    })

    it("Render login page", () => {
        cy.visit("/login")
        cy.get("h1").should('contain', /Login form/i)
    })

    it("Password visible", () => {
        cy.visit("/register")
        cy.get("#password").type("Hi!")
        cy.get("#password + span[class=\"self-end relative bottom-7.5 md:bottom-8.5 right-1.5\"]").click()
        cy.get("#password").should('have.attr', 'type', 'text')
    })

    it("Test without any data", () => {
        cy.visit("/register")
        cy.get("button").click()
        cy.get('#status')
            .should('contain.text', 'Username, email, password or second password not present')
    })

    it("Input data and send data", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test")
        cy.get("input[id=\"email\"").type("test@example.com")
        cy.get("input[id=\"password\"").type("abc123")
        cy.get("input[id=\"passwordSecond\"").type("abc123")
        cy.get("button").click()
        cy.get("#status").invoke("text").should('not.match', /^Error while registering:.*$/i) 
        cy.get("#status").invoke("text").should('match', /^Account has created$/)
    })

    it("Input data with different passwords", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test2")
        cy.get("input[id=\"email\"").type("test2@example.com")
        cy.get("input[id=\"password\"").type("abc123")
        cy.get("input[id=\"passwordSecond\"").type("abc124")
        cy.get("button").click()
        cy.get("#status").should('contain.text', 'Passwords are not the same') 
    })

    it("Input data with uncorrect email", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test3")
        cy.get("input[id=\"email\"").type("test3example.com")
        cy.get("input[id=\"password\"").type("abc124")
        cy.get("input[id=\"passwordSecond\"").type("abc124")
        cy.get("button").click()
        cy.get("#status").invoke("text").should('match', /Email format isn't correct/i) 
    })

    it("Try create account with existed email", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test4")
        cy.get("input[id=\"email\"").type("test@example.com")
        cy.get("input[id=\"password\"").type("abc125")
        cy.get("input[id=\"passwordSecond\"").type("abc125")
        cy.get("button").click()
        cy.get("#status").invoke("text").should('match', /^Error while registering:.*$/i) 
    })

    it("Try create account with existed username", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test")
        cy.get("input[id=\"email\"").type("test5@example.com")
        cy.get("input[id=\"password\"").type("abc125")
        cy.get("input[id=\"passwordSecond\"").type("abc125")
        cy.get("button").click()
        cy.get("#status").invoke("text").should('match', /^Error while registering:.*$/i) 
    })
})