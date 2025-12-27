interface ButtonProps {
    text: string;
    id?: string
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Button({ text, id, onClick }: ButtonProps) {
    return (
        <button
            id={id}
            onClick={onClick}
            className="border text-white p-4 bg-gradient-to-r from-orange-700 to-yellow-700 rounded-4xl text-xl hover:scale-105 font-extrabold transition-all shadow-xl cursor-pointer"
        >
            {text}
        </button>
    );
}
