import useUserQuery from '@/hooks/useUserQuery';
import { Link } from 'react-router';
import { CircleUserIcon } from 'lucide-react';

export default function Header() {
    const { data: user, isLoading: isUserLoading } = useUserQuery();

    if (isUserLoading) {
        return (
            <div className="h-auto p-5 flex justify-between bg-gradient-to-r from-yellow-500 to-orange-500 shadow-xl">
                <h1 className="text-2xl md:text-3xl lg:text-5xl">
                    BudgetTracker - Loading
                </h1>
                <div className="flex items-center justify-center *:mx-3 cursor-pointer transition hover:text-gray-300">
                    <CircleUserIcon className="size-10 lg:size-12" />
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
                    <CircleUserIcon className="size-10 lg:size-12" />
                </Link>
            </div>
        </div>
    );
}
