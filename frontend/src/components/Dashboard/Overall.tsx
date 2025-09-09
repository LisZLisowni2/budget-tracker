// TODO: UPDATE TO SERVE THE DATA FROM SERVER

import { useUser } from "../../context/UserContext";
import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

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
        <div className={`w-full rounded-xl shadow-2xl hover:scale-105 transition-all ${bgColor}`}>
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
                { notes.map((note) => <li className="shadow-md p-1 m-2 hover:scale-105 transition-all">{ note }</li>) }
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

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: "Sales",
                data: [100, 300, 200, 100, 500, 300],
                borderColor: "blue",
                backgroundColor: "lightblue",
                fill: true, 
                tension: 0.4
            },
            {
                label: "Expenses",
                data: [300, 200, 200, 100, 200, 400],
                borderColor: "red",
                backgroundColor: "orange",
                fill: true,
                tension: 0.4
            }
        ]
    }

    const options = {
        responsive: false,
        plugins: {
            // legend: { position: "top" },
            title: { display: true, text: "Monthly income and expenses, last 6 months" }
        }
    }
    
    return (
        <div className="flex items-center justify-between flex-col h-full *:p-4 max-lg:overflow-auto">
            <div className="flex flex-row w-full">
                <div className="flex-col w-full h-1/4 *:p-8 ">
                    <div className="flex flex-row *:m-1 *:p-4">
                        <StatsItem title="Total income" value={ 6250 } currency="zł" weekDiff={ -1 } monthDiff={ 2 } type="income" />
                        <StatsItem title="Total costs" value={ 2000 } currency="zł" weekDiff={ 3 } monthDiff={ -4 } type="expense" />
                    </div>
                    <div className="flex flex-row *:m-1 *:p-4">
                        <StatsItem title="Total profit" value={ 4250 } currency="zł" weekDiff={ 5 } monthDiff={ -4 } type="other" />
                        <StatsItem title="Total balance" value={ 7000 } currency="zł" weekDiff={ 3 } monthDiff={ -4 } type="other" />
                    </div>
                </div>
                <div className="flex-col w-full h-1/4 max-md:hidden mt-8">
                    <h3 className="text-3xl">Fast actions</h3>
                    <ul className="[&>li]:bg-rose-400 [&>li]:hover:bg-rose-700 [&>li]:hover:scale-105 [&>li]:transition-all [&>li]:my-4 [&>li]:p-2 text-white font-bold">
                        <li>Add/Change income</li>
                        <li>Add/Change cost</li>
                        <li>Update account data</li>
                    </ul>
                </div>
            </div>
            <div className="flex max-md:flex-col justify-evenly lg:w-full *:bg-white">
                <div className="text-lg lg:text-xl max-h-80 p-8 m-2 shadow-2xl md:w-3/5 rounded-3xl flex justify-between overflow-hidden">
                    <div className="w-full h-full flex justify-center">
                        <Line data={data} options={options} width={600} height={250}/>
                    </div>
                </div>
                <div className="text-lg lg:text-xl max-h-80 p-8 m-2 shadow-2xl md:w-3/5 rounded-3xl flex flex-col justify-between overflow-hidden">
                    <h3 className="text-3xl">Notes</h3>
                    <div className="flex">
                        <Notes title="Latest" notes={["Note 1", "Note 1", "Note 1"]}/>
                        <Notes title="Favourite" notes={["Note 1", "Note 1", "Note 1"]}/>
                    </div>
                </div>
            </div>
        </div>
    )
}