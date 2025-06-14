// TODO: UPDATE TO SERVE THE DATA FROM SERVER

import { useUser } from "../../context/UserContext";

export default function Profile() {
    const { user, loading } = useUser()

    if (loading) {
        return (<p>
            Loading profile...
        </p>)
    }

    console.log(user)
    
    return (
        <div className="flex justify-center items-center flex-col h-full *:p-4">
            <h1 className="text-6xl">Adam Nowak</h1>
            <h3 className="text-2xl">adam.nowak@gmail.com</h3>
        </div>
    )
}
