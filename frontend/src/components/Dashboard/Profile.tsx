import { useUser } from '../../context/UserContext';

export default function Profile() {
    sessionStorage.setItem('selectedDashboard', '5');
    const { user, loading } = useUser();

    if (loading) {
        return <p>Loading profile...</p>;
    }

    if (!user) {
        return (
            <div className="w-full flex justify-center items-center">
                <p className="text-black text-4xl font-bold text-center">
                    You are not allowed to access Dashboard.
                    <br />
                    Please login to continue
                </p>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center flex-col h-full *:p-4">
            <h1 className="text-6xl">{user?.username} </h1>
            <h3 className="text-2xl">{user?.email}</h3>
        </div>
    );
}
