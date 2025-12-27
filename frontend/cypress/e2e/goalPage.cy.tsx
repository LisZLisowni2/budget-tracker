/// <reference types="cypress" />

describe("Goal page", () => {
    before(() => {
        cy.request("POST", "/api/users/register", { username: "test", email: "test@example.com", password: "abc123" })
        cy.request("POST", "/api/users/login", { username: "test", password: "abc123" })
        cy.getCookie("token").should('exist')
        cy.visit('/dashboard/goals')
    })

    after(() => {
        cy.clearDB()
    })

    it("Is loaded?", () => {
        cy.get('table').should('exist')
    })

    it("Add goal", () => {
        cy.get("#add").click()
        cy.get("#addForm form").should('exist')
        cy.get("#addForm form input[type=name]").type("test goal")
        cy.get("#addForm form input[type=requiredValue]").type("3000")
        cy.get("#addForm button").click()
        cy.reload()
        cy.get('table tbody tr').should('have.length', 1)
    })

    it("Update goal", () => {
        cy.get("#change").click()
        cy.get("#changeForm select").should('exist')
        cy.get("#changeForm select").select(1)
        cy.get("#changeForm form").should('exist')
        cy.get("#changeForm form input[type=name]").type("test goal 2")
        cy.get("#changeForm form input[type=requiredValue]").type("6000")
        cy.get("#changeForm button").click()
        cy.reload()
        cy.get('table tbody tr').should('have.length', 1)
    })

    it("Delete goal", () => {
        cy.get("#delete").click()
        cy.get("#deleteForm select").should('exist')
        cy.get("#deleteForm select").select(1)
        cy.get("#deleteForm button").click()
        cy.reload()
        cy.get('table tbody tr').should('have.length', 0)
    })
})