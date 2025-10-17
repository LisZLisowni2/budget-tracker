import { ReactNode } from "react"

interface IModal {
    children?: ReactNode,
    activator: boolean
}

export default function Modal({ children, activator } : IModal) {
    return (<div className={`${(!activator) ? "hidden" : ""} fixed top-0 left-0 z-10 w-full h-full overflow-auto bg-black/40 m-0 p-0`}>
        <div className="w-80 h-80 p-12 mt-4 mb-auto ml-auto mr-auto">
            { children }
        </div>
    </div>)
}