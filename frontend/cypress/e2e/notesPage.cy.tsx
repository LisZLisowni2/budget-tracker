/// <reference types="cypress" />

describe("Notes page", () => {
    const apiUrl = Cypress.env("apiUrl")

    beforeEach(() => {
        cy.session("login-test-user", () => {
            cy.clearDB()
            cy.request("POST", `${apiUrl}/users/register`, { username: "test", email: "test@example.com", password: "abc123" })
            .then(() => {
                return cy.request("POST", `${apiUrl}/users/login`, { username: "test", password: "abc123" })
            })
            .then((res) => {
                const token = res.body.token
                
                window.localStorage.setItem('token', token)

                cy.visit('/dashboard/notes')
            })
        }).then(() => {
            cy.visit('/dashboard/notes', {
                headers: {
                    Authorization: `Bearer ${window.localStorage.getItem('token')}`
                }
            })
        })
    })

    it("is loaded?", () => {
        cy.get('#message').should('exist').invoke("text").should('match', /Choose a note/i)
    })

    it("Add note", () => {
        cy.get('#plusBtn').click()
        cy.get(".note").should('have.length.at.least', 1)
    })

    it("Remove note", () => {
        cy.get(".note").first().click()
        cy.get('#minusBtn').click()
        cy.get(".note").should('have.length.at.most', 0)
    })

    it("Copy note", () => {
        cy.get('#plusBtn').click()
        cy.get(".note").first().click()
        cy.get('#copyBtn').click()
        cy.get(".note").should('have.length.at.least', 2)
    })

    it("Edit note", () => {
        cy.get(".note").first().click()
        cy.get("#title").type("test title", { delay: 50 })
        cy.get("#editPreviewBtn").click()
        cy.get("#content").type("test content", { delay: 50 })
        cy.get("#editPreviewBtn").click()
        cy.get("#title").invoke("val").should('match', /test title/i)
        cy.get("#contentView").invoke("text").should('match', /test content/i)
    })
})