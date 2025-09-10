import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom"
import Footer from "./Footer";

describe("Footer component test", () => {
    it("Correct render with actual year", () => {
        const currentYear = new Date().getFullYear()
        render(<Footer />)
        expect(screen.getByRole('paragraph')).toHaveTextContent(`${currentYear}`)
    })
})