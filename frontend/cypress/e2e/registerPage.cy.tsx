/// <reference types="cypress"/>

describe("Register page", () => {
    it("Render register page", () => {
        cy.visit("/register")
        cy.get("h1").should('contain', /Register form/i)
    })

    it("Test without any data", () => {
        cy.visit("/register")
        cy.get("button").click()
        cy.get("p[class=\"font-bold lg:text-xl hover:text-gray-300 transition\"]").should('contain', /Error while registering:*/i)
    })

    it("Input data and send data", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test")
        cy.get("input[id=\"email\"").type("test@example.com")
        cy.get("input[id=\"password\"").type("abc123")
        cy.get("input[id=\"passwordsecond\"").type("abc123")
        cy.get("button").click()
        cy.get("p[class=\"font-bold lg:text-xl hover:text-gray-300 transition\"]").should('not.contain', /Error while registering:*/i) 
        cy.get("p[class=\"font-bold lg:text-xl hover:text-gray-300 transition\"]").should('contain', /Account has created/i)
    })

    it("Input data with different passwords", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test2")
        cy.get("input[id=\"email\"").type("test2@example.com")
        cy.get("input[id=\"password\"").type("abc123")
        cy.get("input[id=\"passwordsecond\"").type("abc124")
        cy.get("button").click()
        cy.get("p[class=\"font-bold lg:text-xl hover:text-gray-300 transition\"]").should('contain', /Error while registering:*/i) 
    })

    it("Input data with uncorrect email", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test3")
        cy.get("input[id=\"email\"").type("testexample.com")
        cy.get("input[id=\"password\"").type("abc124")
        cy.get("input[id=\"passwordsecond\"").type("abc124")
        cy.get("button").click()
        cy.get("p[class=\"font-bold lg:text-xl hover:text-gray-300 transition\"]").should('contain', /Error while registering:*/i) 
    })

    it("Try create account with existed email", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test4")
        cy.get("input[id=\"email\"").type("test@example.com")
        cy.get("input[id=\"password\"").type("abc125")
        cy.get("input[id=\"passwordsecond\"").type("abc125")
        cy.get("button").click()
        cy.get("p[class=\"font-bold lg:text-xl hover:text-gray-300 transition\"]").should('contain', /Error while registering:*/i) 
    })

    it("Try create account with existed username", () => {
        cy.visit("/register")
        cy.get("input[id=\"login\"").type("test")
        cy.get("input[id=\"email\"").type("test5@example.com")
        cy.get("input[id=\"password\"").type("abc125")
        cy.get("input[id=\"passwordsecond\"").type("abc125")
        cy.get("button").click()
        cy.get("p[class=\"font-bold lg:text-xl hover:text-gray-300 transition\"]").should('contain', /Error while registering:*/i) 
    })
})