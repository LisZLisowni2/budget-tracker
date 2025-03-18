// TODO: UPDATE TO SERVE THE DATA FROM SERVER

import { useUser } from "../../context/UserContext";

export default function Overall() {
    // const { user, loading } = useUser()

    // if (loading) {
    //     return (<p>
    //         Loading profile...
    //     </p>)
    // }

    // console.log(user)
    
    return (
        <div className="flex justify-center items-center flex-col h-full *:p-4 max-lg:overflow-auto">
            <h1 className="text-6xl">Overall</h1>
            <h3 className="text-2xl font-bold">Difference: 4250 zł</h3>
            <div className="flex max-sm:flex-col justify-evenly lg:w-full">
                <h3 className="text-2xl text-green-300 font-bold">Income: 6550 zł</h3>
                <h3 className="text-2xl text-red-500 font-bold">Costs: 2300 zł</h3>
            </div>
            <div className="flex max-sm:flex-col justify-evenly lg:w-full">
                <div className="text-2xl h-80 overflow-auto p-8 m-2 border-4 shadow-2xl lg:w-1/3 rounded-3xl">
                    <h2 className="text-4xl">Latest notes</h2>
                    <hr />
                    <ul className="*:p-2  ">
                        <li>Note 1</li>
                        <li>Note 2</li>
                        <li>Note 3</li>
                    </ul>
                </div>
                <div className="text-2xl h-80 overflow-auto p-8 m-2 border-4 shadow-2xl lg:w-1/3 rounded-3xl">
                    <h2 className="text-4xl">Starred notes</h2>
                    <hr />
                    <ul className="*:p-2">
                        <li>Note 1</li>
                        <li>Note 2</li>
                        <li>Note 3</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}