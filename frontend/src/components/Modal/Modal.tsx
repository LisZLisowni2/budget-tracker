import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface IModal {
    header: string;
    children?: ReactNode;
    activator: boolean;
    onClick: () => void;
}

export default function Modal({
    header,
    children,
    activator,
    onClick,
}: IModal) {
    return (
        <div
            className={`${!activator ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'} fixed top-0 left-0 z-10 w-full h-full overflow-auto bg-black/40 m-0 p-0`}
        >
            <div
                className={`flex-col max-w-3/5 min-w-1/6 mt-4 mb-auto ml-auto mr-auto bg-amber-50 hover:scale-105 duration-300 transition-all ${!activator ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            >
                <header className="bg-amber-600 w-full h-1/5 p-4 flex text-center justify-between items-center text-white">
                    <p className="text-2xl">{header}</p>
                    <X
                        className="cursor-pointer transition-all hover:text-gray-300"
                        onClick={() => onClick()}
                    />
                </header>
                <section>{children}</section>
            </div>
        </div>
    );
}
