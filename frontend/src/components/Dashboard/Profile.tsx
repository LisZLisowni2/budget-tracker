
// TODO: Add more info about User like: Currency, 
// TODO: Enable change details about account and it deletion.

import useUserQuery from "@/hooks/useUserQuery";
import { useUser } from "@/context/UserContext";
import Button from "../Button/Button";

export default function Profile() {
    sessionStorage.setItem('selectedDashboard', '5');
    const { data: user, isLoading: isUserLoading } = useUserQuery();
    const { logoutMutation } = useUser();

    if (isUserLoading) {
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

    const handleLogout = () => {
        logoutMutation()
    }
    
    // FIXME: Background of section only white, not gradient gray.
    return (
        <div className="flex justify-center items-center flex-col h-full max-md:overflow-auto *:p-4"> 
            <h1 className="text-6xl">{user?.username} </h1>
            <h3 className="text-2xl">{user?.email}</h3>
            <Button text="Wyloguj się" onClick={handleLogout} />
        </div>
    );
}
