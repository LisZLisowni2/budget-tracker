/// <reference types="cypress"/>

describe("Register page", () => {
    before(() => {
        cy.clearDB()
    })
    
    after(() => {
        cy.clearDB()
    })

    it("Render register page", () => {
        cy.visit("/register")
        cy.get("h1").should('contain', /Register form/i)
    })

    it("Password visible", () => {
        cy.visit("/register")
        cy.get("#password").type("Hi!")
        cy.get("#password + span").click()
        cy.get("#password").should('have.attr', 'type', 'text')
    })

    it("Test without any data", () => {
        cy.visit("/register")
        cy.get("button").click()
        cy.get("#usernameError").should('contain.text', 'Username too short')
        cy.get("#emailError").should('contain.text', 'Invalid email pattern')
        cy.get("#passwordError").should('contain.text', 'Password too short')
        cy.get("#passwordSecondError").should('contain.text', 'Password too short')
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
        cy.get("#passwordSecondError").should('contain.text', 'Passwords are not the same') 
    })

    it("Input data with uncorrect email", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test3")
        cy.get("input[id=\"email\"").type("test3example.com")
        cy.get("input[id=\"password\"").type("abc124")
        cy.get("input[id=\"passwordSecond\"").type("abc124")
        cy.get("button").click()
        cy.get("#emailError").invoke("text").should('match', /Invalid email pattern/i) 
    })

    it("Try create account with existed email", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test4")
        cy.get("input[id=\"email\"").type("test@example.com")
        cy.get("input[id=\"password\"").type("abc125")
        cy.get("input[id=\"passwordSecond\"").type("abc125")
        cy.get("button").click()
        cy.get("#emailError").invoke("text").should('match', /^Email already in use$/i) 
    })

    it("Try create account with existed username", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test")
        cy.get("input[id=\"email\"").type("test5@example.com")
        cy.get("input[id=\"password\"").type("abc125")
        cy.get("input[id=\"passwordSecond\"").type("abc125")
        cy.get("button").click()
        cy.get("#usernameError").invoke("text").should('match', /^Username already in use$/i) 
    })
})