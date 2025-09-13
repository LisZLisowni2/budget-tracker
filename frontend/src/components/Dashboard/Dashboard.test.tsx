import { screen, render } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { MemoryRouter } from "react-router";

describe("Dashboard component", () => {
    it("Dashboard render default", () => {
        render(<MemoryRouter><Dashboard /></MemoryRouter>)
        expect(screen.getByText("Overall")).toBeInTheDocument()
        expect(screen.getByText("Transactions")).toBeInTheDocument()
        expect(screen.getByText("Goals")).toBeInTheDocument()
        expect(screen.getByText("Notes")).toBeInTheDocument()
        expect(screen.getByText("Profile")).toBeInTheDocument()
    })
})