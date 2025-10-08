import { useUser } from "../../context/UserContext";

export default function Profile() {
    sessionStorage.setItem("selectedDashboard", "5")
    const { user, loading } = useUser()

    if (loading) {
        return (<p>
            Loading profile...
        </p>)
    }

    console.log(user)
    
    return (
        <div className="flex justify-center items-center flex-col h-full *:p-4">
            <h1 className="text-6xl">{ user?.username } </h1>
            <h3 className="text-2xl">{ user?.email }</h3>
        </div>
    )
}
