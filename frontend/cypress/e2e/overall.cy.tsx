/// <reference types="cypress" />

describe("Overall", () => {
    const apiUrl = Cypress.env("apiUrl")

    beforeEach(() => {
        cy.session("login-test-user", async () => {
            await cy.clearDB()
            cy.request("POST", `${apiUrl}/users/register`, { username: "test", email: "test@example.com", password: "abc123" })
            .then(() => {
                return cy.request("POST", `${apiUrl}/users/login`, { username: "test", password: "abc123" })
            })
            .then((res) => {
                const token = res.body.token
                
                window.localStorage.setItem('token', token)
            })
        }).then(() => {
            cy.visit('/dashboard/overall', {
                headers: {
                    Authorization: `Bearer ${window.localStorage.getItem('token')}`
                }
            })
        })
    })

    it("Is loaded?", () => {
        cy.get('#stats').should('exist')
    })

    it("New transaction", () => {
        cy.request({
            method: "POST",
            url: `${apiUrl}/transactions/new`,
            body: { name: "Test transaction", value: 100, category: "test", receiver: false },
            headers: {
                Authorization: `Bearer ${window.localStorage.getItem('token')}`
            }
        }).then(() => {
            cy.reload()
            cy.get('#stats div:nth-child(2) h1').invoke("text").should('match', /100zł/i)
            cy.get('#stats div:nth-child(3) h1').invoke("text").should('match', /-100zł/i)
            cy.get('#stats div:nth-child(4) h1').invoke("text").should('match', /-100zł/i)
        })
    })

    it("New goal", () => {
        cy.request({
            method: "POST",
            url: `${apiUrl}/goals/new`,
            body: { name: "Test goal", requiredValue: 100 },
            headers: {
                Authorization: `Bearer ${window.localStorage.getItem('token')}`
            }
        }).then(() => {
            cy.reload()
            cy.get('ul:first-of-type li').should("have.length.at.least", 1)
        })
    })

    it("New note", () => {
        cy.request({
            method: "POST",
            url: `${apiUrl}/notes/new`,
            body: { title: "Test note", content: "Test content" },
            headers: {
                Authorization: `Bearer ${window.localStorage.getItem('token')}`
            }
        }).then(() => {
            cy.reload()
            cy.get('ul:last-of-type li').should("have.length.at.least", 1)
        })
    })
})