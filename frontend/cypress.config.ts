/// <reference types="cypress" />
import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:5173",
        supportFile: "cypress/e2e/*.{js,jsx,ts,tsx}"
    }
})