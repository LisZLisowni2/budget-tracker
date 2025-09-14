import { useUser } from "../../context/UserContext"
import Button from "../Button/Button"

export default function Goals() {
    const { user, loading } = useUser()

    if (loading) {
        return (<p>
            Loading profile...
        </p>)
    }

    console.log(user)
    
    return (
        <div className="flex items-center justify-between flex-col h-full *:p-4 max-lg:overflow-auto">
            <div className="bg-white w-4/5 shadow-2xl rounded-4xl max-h-150 m-8 overflow-auto">
                <table className="**:p-3 **:border border-collapse w-full h-full table-auto">
                    <thead className="bg-gray-300 sticky top-0">
                        <tr><th>Date Creation</th><th>Goal</th><th>Required money</th><th>Done?</th><th>Date Complete</th><th></th></tr>
                    </thead>
                    <tbody className="*:hover:bg-gray-100 *:transition-all">
                        <tr><td>2025-08-01</td><td>Birman Cat</td><td>8000 zł</td><td>true</td><td>2025-09-01</td><td className="*:m-auto *:text-white"><Button text="Complete" onClick={() => console.log()}/></td></tr>
                    </tbody>
                </table>
            </div>
            <div className="text-white flex justify-evenly w-full h-1/3 items-center">
                <Button text="Add new goal"/>
                <Button text="Change goal details"/>
                <Button text="Delete goal"/>
            </div>
        </div>
    )
}