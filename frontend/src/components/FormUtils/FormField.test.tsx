import { screen, render } from '@testing-library/react'
import "@testing-library/jest-dom"
import FormField from './FormField'

describe("Form Field component", () => {
    it("Basic text input", () => {
        render(<FormField label='Text' type='text' id='textTest' />)
        expect(screen.getByText("Text")).toBeInTheDocument()
    })

    it("Basic number input", () => {
        render(<FormField label='Number' type='number' id='numberTest' />)
        expect(screen.getByText("Number")).toBeInTheDocument()
    })
})