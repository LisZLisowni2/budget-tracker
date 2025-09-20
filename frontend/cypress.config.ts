/// <reference types="cypress" />
import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: "https://localhost:443",
        supportFile: "cypress/support/e2e.{js,jsx,ts,tsx}",
        specPattern: "cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}"
    }
})