/// <reference types="cypress" />

describe("Profile", () => {
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
            cy.visit('/dashboard/profile', {
                headers: {
                    Authorization: `Bearer ${window.localStorage.getItem('token')}`
                }
            })
        })
    })

    it("Is loaded?", () => {
        cy.get('#usernameHeadline').should('exist')
    })

    it("Change password", () => {
        cy.get("#changePasswordBtn").click()
        cy.get("#passwordChangeForm").should('exist')
        cy.get("#password").should("exist")
        cy.get("#password").type("ahsj297fh")
        cy.get("#passwordSecond").type("ahsj297fh")
        cy.get("#passwordChangeForm button").click()
        cy.reload()
        cy.get("#logoutBtn").click()
        cy.url().should("contain", "login")
        cy.get("#username").type("test")
        cy.get("#password").type("ahsj297fh")
        cy.get("button").click()
        cy.url().should("contain", "dashboard")
    })

    it("Change account details", () => {
        cy.get("#changeAccountDetailsBtn").click()
        cy.get("#accountDetailsChangeForm").should('exist')
        cy.get("#username").should("exist")
        cy.get("#username").type("newTest")
        cy.get("#email").type("newTest@example.com")
        cy.get("#phone").type("111333555")
        cy.get("#baseCurrency").type("PLN")
        cy.get("#preferredLanguage").type("en")
        cy.get("#accountDetailsChangeForm button").click()
        cy.reload()
        cy.get("#usernameHeadline").should("contain.text", "newTest")
    })
})