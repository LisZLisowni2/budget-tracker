import React from "react";

interface ButtonProps {
    text: string,
    onClick?: () => void
}

export default function Button ({text, onClick}: ButtonProps) {
    return (
        <button onClick={onClick} className="mt-5 border p-4 rounded-4xl text-xl font-semibold hover:bg-gray-200 hover:text-black transition hover:shadow-2xl cursor-pointer">
            { text }
        </button>
    )
}