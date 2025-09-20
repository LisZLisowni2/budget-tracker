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
})