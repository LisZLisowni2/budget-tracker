/// <reference types="cypress" />

describe("Goal page", () => {
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

                cy.visit('/dashboard/goals')
            })
        }).then(() => {
            cy.visit('/dashboard/goals', {
                headers: {
                    Authorization: `Bearer ${window.localStorage.getItem('token')}`
                }
            })
        })
    })

    it("Is loaded?", () => {
        cy.get('table').should('exist')
    })

    it("Add goal", () => {
        cy.get("#add").click()
        cy.get("#addForm form").should('exist')
        cy.get("#name").should("exist")
        cy.get("#name").type("test goal 4")
        cy.get("#requiredValue").type("3000")
        cy.get("#addForm button").click()
        cy.reload()
        cy.get('table tbody tr').should('have.length.at.least', 1)
    })

    it("Update goal", () => {
        cy.get("#change").click()
        cy.get("#select").should('exist')
        cy.get("#select").select(1)
        cy.get("#select").invoke('val').should('not.equal', "Select one of these")
        cy.get("#changeForm form").should('exist')
        cy.get("#name2").should("be.visible")
        cy.get("#name2").clear().type("test goal 2", { delay: 50 })
        cy.get("#requiredValue2").should("be.visible")
        cy.get("#requiredValue2").clear().type("6000", { delay: 50 })
        cy.get("#submit2").click()
        cy.reload()
        cy.get('table tbody tr').should('have.length.at.least', 1)
    })

    it("Delete goal", () => {
        cy.get("#delete").click()
        cy.get("#select2").should('exist')
        cy.get("#select2").select(1)
        cy.get("#select2").invoke('val').should('not.equal', "Select one of these")
        cy.get("#submit3").click()
        cy.reload()
        cy.get('table tbody tr').should('have.length.at.most', 1)
    })
})