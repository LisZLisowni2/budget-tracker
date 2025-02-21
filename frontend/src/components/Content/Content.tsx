import React from "react"

interface IChildren {
    children?: React.ReactNode
}

export default function Content({ children }: IChildren ) {
    return (
        <div className="flex justify-center items-center flex-1 bg-violet-900">
            { children }
        </div>
    )
}