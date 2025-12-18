import { useState, MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router';
import useUserQuery from '@/hooks/useUserQuery';
import ErrorData from './ErrorData';

interface INavOption {
    text: string;
    route: string;
    active?: boolean;
    onClick?: MouseEventHandler;
}

interface IChildren {
    children?: ReactNode;
}

function NavOption({ text, route, active, onClick }: INavOption) {
    return active ? (
        <Link to={`/dashboard/${route}`} onClick={onClick}>
            <span className="block text-2xl p-2 lg:p-4 font-bold bg-rose-800 hover:bg-rose-700 transition">
                {text}
            </span>
        </Link>
    ) : (
        <Link to={`/dashboard/${route}`} onClick={onClick}>
            <span className="block text-2xl p-2 lg:p-4 bg-rose-500 hover:bg-rose-700 transition">
                {text}
            </span>
        </Link>
    );
}

export default function Dashboard({ children }: IChildren) {
    const [selected, setSelected] = useState<string | null>(
        sessionStorage.getItem('selectedDashboard')
            ? sessionStorage.getItem('selectedDashboard')
            : '5'
    );
    const { data: user, isLoading: isUserLoading } = useUserQuery();

    if (isUserLoading) {
        return <p>Loading profile...</p>;
    }

    if (!user)
        return (
            <ErrorData
                dataType="User"
                message="You are not allowed to access Dashboard. "
            />
        );

    return (
        <section className="w-full flex flex-col lg:flex-row border-t-8 min-h-screen text-center z-10">
            <nav className="flex flex-col lg:sticky lg:top-0 lg:w-1/5 bg-rose-500">
                <NavOption
                    text="Overall"
                    route="overall"
                    active={selected == '0' ? true : false}
                    onClick={() => setSelected('0')}
                />
                <NavOption
                    text="Transactions"
                    route="transactions"
                    active={selected == '1' ? true : false}
                    onClick={() => setSelected('1')}
                />
                <NavOption
                    text="Goals"
                    route="goals"
                    active={selected == '2' ? true : false}
                    onClick={() => setSelected('2')}
                />
                <NavOption
                    text="Notes"
                    route="notes"
                    active={selected == '3' ? true : false}
                    onClick={() => setSelected('3')}
                />
                <NavOption
                    text="Analytics"
                    route="analytics"
                    active={selected == '4' ? true : false}
                    onClick={() => setSelected('4')}
                />
                <NavOption
                    text="Profile"
                    route="profile"
                    active={selected == '5' ? true : false}
                    onClick={() => setSelected('5')}
                />
            </nav>
            <div className="lg:w-4/5 max-md:w-full min-h-screen grow text-center text-black bg-white">
                {children}
            </div>
        </section>
    );
}
