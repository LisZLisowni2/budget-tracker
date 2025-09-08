// TODO: UPDATE TO SERVE THE DATA FROM SERVER

import { useUser } from "../../context/UserContext";

interface IStatsItem {
    title: string,
    value: number,
    currency: string,
    weekDiff: number,
    monthDiff: number,
    type: "other" | "expense" | "income"
}

interface INotes {
    title: string,
    notes: string[]
}

function StatsItem({ title, value, currency, weekDiff, monthDiff, type }: IStatsItem) {
    const bgColor = (type === "income") ? "bg-green-500 text-white" : ((type === "expense") ? "bg-red-500 text-white" : "bg-whtie text-black")
    return (
        <div className={`w-full rounded-xl shadow-2xl ${bgColor}`}>
            <div className="flex flex-row justify-between">
                <h3>{ title }</h3>
            </div>
            <h1 className="text-3xl">{ value }{ currency }</h1>
            <div className="flex flex-row justify-evenly">
                <h3>Weekly: <span className="font-bold">{ weekDiff }%</span></h3>
                <h3>Monthly: <span className="font-bold">{ monthDiff }%</span></h3>
            </div>
        </div>
    )
}

function Notes({ title, notes }: INotes) {
    return (
        <div className="overflow-auto w-1/2 mx-2 h-80">
            <h2 className="text-xl lg:text-2xl">{ title }</h2>
            <hr />
            <ul className="*:p-2 text-md">
                { notes.map((note) => <li>{ note }</li>) }
            </ul>
        </div>
    )
}

export default function Overall() {
    const { user, loading } = useUser()

    if (loading) {
        return (<p>
            Loading profile...
        </p>)
    }

    console.log(user)
    
    return (
        <div className="flex items-center justify-between flex-col h-full *:p-4 max-lg:overflow-auto">
            <div className="flex-col w-full h-1/4 *:p-8 max-sm:*:my-3">
                <div className="flex flex-row md:w-1/2 *:m-1 *:p-4">
                    <StatsItem title="Total income" value={ 6250 } currency="zł" weekDiff={ -1 } monthDiff={ 2 } type="income" />
                    <StatsItem title="Total costs" value={ 2000 } currency="zł" weekDiff={ 3 } monthDiff={ -4 } type="expense" />
                </div>
                <div className="flex flex-row md:w-1/2 *:m-1 *:p-4">
                    <StatsItem title="Total profit" value={ 4250 } currency="zł" weekDiff={ 5 } monthDiff={ -4 } type="other" />
                    <StatsItem title="Total balance" value={ 7000 } currency="zł" weekDiff={ 3 } monthDiff={ -4 } type="other" />
                </div>
            </div>
            <div className="flex max-sm:flex-col justify-evenly lg:w-full *:bg-white">
                <div className="text-lg lg:text-xl h-80 p-8 m-2 shadow-2xl lg:w-3/5 rounded-3xl flex justify-between overflow-hidden">
                    <Notes title="Latest Notes" notes={["Note 1", "Note 1", "Note 1"]}/>
                    <Notes title="Favourite Notes" notes={["Note 1", "Note 1", "Note 1"]}/>
                </div>
                <div className="text-lg lg:text-xl h-80 p-8 m-2 shadow-2xl lg:w-3/5 rounded-3xl flex justify-between overflow-hidden">
                    <Notes title="Latest Notes" notes={["Note 1", "Note 1", "Note 1"]}/>
                    <Notes title="Favourite Notes" notes={["Note 1", "Note 1", "Note 1"]}/>
                </div>
            </div>
        </div>
    )
}