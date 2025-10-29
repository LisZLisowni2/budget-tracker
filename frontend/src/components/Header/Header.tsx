import { Link } from 'react-router';
import { useUser } from '../../context/UserContext';

export default function Header() {
    const { user, loading } = useUser();

    if (loading) {
        return (
            <div className="h-auto p-5 flex justify-between bg-gradient-to-r from-yellow-500 to-orange-500 shadow-xl">
                <h1 className="text-2xl md:text-3xl lg:text-5xl">
                    BudgetTracker - Loading
                </h1>
                <div className="flex items-center justify-center *:mx-3 cursor-pointer transition hover:text-gray-300">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-8 lg:size-12"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className="h-auto p-5 flex justify-between bg-gradient-to-r from-yellow-500 to-orange-500 shadow-xl">
            <Link to={user ? '/dashboard' : '/'}>
                <h1 className="text-2xl md:text-3xl lg:text-5xl">
                    BudgetTracker
                </h1>
            </Link>
            <div className="flex items-center justify-center *:mx-3 cursor-pointer transition hover:text-gray-300">
                <Link to={user ? '/dashboard/profile' : '/login'}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-8 lg:size-12"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
