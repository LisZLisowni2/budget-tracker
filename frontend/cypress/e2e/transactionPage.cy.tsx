/// <reference types="cypress" />

describe("transaction page", () => {
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

                cy.visit('/dashboard/transactions')
            })
        }).then(() => {
            cy.visit('/dashboard/transactions', {
                headers: {
                    Authorization: `Bearer ${window.localStorage.getItem('token')}`
                }
            })
        })
    })

    it("Is loaded?", () => {
        cy.get('table').should('exist')
    })

    it("Add transaction", () => {
        cy.get("#add").click()
        cy.get("#addForm form").should('exist')
        cy.get("#name").should("exist")
        cy.get("#name").type("test transaction 4")
        cy.get("#category").type("test")
        cy.get("#value").type("2825")
        cy.get("#receiver").check()
        cy.get("#addForm button").click()
        cy.reload()
        cy.get('table tbody tr').should('have.length.at.least', 1)
    })

    it("Update transaction", () => {
        cy.get("#change").click()
        cy.get("#select").should('exist')
        cy.get("#select").select(1)
        cy.get("#select").invoke('val').should('not.equal', "Select one of these")
        cy.get("#changeForm form").should('exist')
        cy.get("#name2").should("be.visible")
        cy.get("#name2").clear().type("test transaction 2", { delay: 50 })
        cy.get("#category2").should("be.visible")
        cy.get("#category2").clear().type("test2", { delay: 50 })
        cy.get("#value2").should("be.visible")
        cy.get("#value2").clear().type("6000", { delay: 50 })
        cy.get("#receiver2").should("be.visible")
        cy.get("#receiver2").uncheck()
        cy.get("#submit2").click()
        cy.reload()
        cy.get('table tbody tr').should('have.length.at.least', 1)
    })

    it("Delete transaction", () => {
        cy.get("#delete").click()
        cy.get("#select2").should('exist')
        cy.get("#select2").select(1)
        cy.get("#select2").invoke('val').should('not.equal', "Select one of these")
        cy.get("#submit3").click()
        cy.reload()
        cy.get('table tbody tr').should('have.length.at.most', 1)
    })
})