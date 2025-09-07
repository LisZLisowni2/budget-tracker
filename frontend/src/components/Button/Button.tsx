interface ButtonProps {
    text: string,
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Button ({text, onClick}: ButtonProps) {
    return (
        <button onClick={onClick} className="mt-5 border p-4 bg-gradient-to-r from-orange-700 to-yellow-700 rounded-4xl text-xl hover:scale-105 font-extrabold transition-all shadow-xl cursor-pointer">
            { text }
        </button>
    )
}