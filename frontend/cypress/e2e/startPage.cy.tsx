/// <reference types="cypress"/>

describe("Home page", () => {
    it("Render home page", () => {
        cy.visit("/")
        cy.contains("Take control over your budget with BudgetTracker!").should("be.visible")
    })

    it("Test 'Get Started' button", () => {
        cy.visit("/")
        cy.get("button").click()
        cy.url().should('include', 'register')
    })

    it("Check if footer rendered", () => {
        cy.visit("/")
        cy.contains("Copyright").should("be.visible")
    })
})