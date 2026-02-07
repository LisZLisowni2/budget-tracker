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

    it("Change account details without username", () => {
        cy.get("#changeAccountDetailsBtn").click()
        cy.get("#accountDetailsChangeForm").should('exist')
        cy.get("#email").should("exist")
        cy.get("#email").clear().type("newTest@example.com")
        cy.get("#phone").clear().type("+48111333555")
        cy.get("#baseCurrency").clear().type("PLN")
        cy.get("#preferredLanguage").clear().type("en")
        cy.get("#accountDetailsChangeForm button").click()
        cy.reload()
        cy.get("#usernameHeadline").invoke("text").should("contain", "test")
    })        

    it("Change username", () => {
        cy.get("#changeAccountDetailsBtn").click()
        cy.get("#accountDetailsChangeForm").should('exist')
        cy.get("#username").should("exist")
        cy.get("#username").clear().type("newTest")
        cy.get("#accountDetailsChangeForm button").click()
        cy.reload()
        cy.url().should("contain", "login")
        cy.get("#username").type("newTest")
        cy.get("#password").type("abc123")
        cy.get("button").click()
        cy.url().should("contain", "dashboard")
        cy.get("#usernameHeadline").invoke("text").should("contain", "newTest")
    })

    it("Change password", () => {
        cy.visit("/login")
        cy.get("#username").type("newTest")
        cy.get("#password").type("abc123")
        cy.get("button").click()
        cy.get("#changePasswordBtn").click()
        cy.get("#passwordChangeForm").should('exist')
        cy.get("#password").should("exist")
        cy.get("#password").type("ahsj297fh")
        cy.get("#passwordSecond").type("ahsj297fh")
        cy.get("#passwordChangeForm button").click()
        cy.reload()
        cy.get("#logoutBtn").click()
        cy.url().should("contain", "login")
        cy.get("#username").type("newTest")
        cy.get("#password").type("ahsj297fh")
        cy.get("button").click()
        cy.url().should("contain", "dashboard")
    })
})