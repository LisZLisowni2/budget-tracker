interface ButtonProps {
    text: string,
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Button ({text, onClick}: ButtonProps) {
    return (
        <button onClick={onClick} className="mt-5 border p-4 rounded-4xl text-xl font-semibold hover:outline-4 hover:font-extrabold transition-all hover:shadow-2xl cursor-pointer">
            { text }
        </button>
    )
}