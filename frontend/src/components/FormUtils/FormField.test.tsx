import { screen, render, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
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

    it("Password input with show option", () => {
        let passwordView = false
        const inputHandler = vi.fn()
        render(<FormField label="Password Verify:" type={ (passwordView) ? "text" : "password" } id="passwordSecond" onChange={inputHandler}>
                                    <button onClick={() => { passwordView = !passwordView;}} className="self-end relative bottom-7.5 md:bottom-8.5 right-1.5">{ (passwordView) ? "Show" : "Hide" }</button>
                                </FormField>)
        expect(screen.getByText("Password Verify:")).toBeInTheDocument()
        
        const inputField = screen.getByText("Password Verify:") as HTMLInputElement
        const toggleBtn = screen.getByRole('button', { name: /Show/i })

        expect(inputField.type).toBe("password")
        fireEvent.click(toggleBtn)
        expect(inputField.type).toBe("text")
        expect(screen.getByRole('button', { name: /Hide/i })).toBeInTheDocument()
    })
})