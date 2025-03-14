import { Link } from "react-router"

interface INavOption {
    text: string,
    route: string,
    active?: boolean,
}

interface IChildren {
    children?: React.ReactNode
}

function NavOption({ text, route, active }: INavOption) {
    return (active) ? (<Link to={`/dashboard/${route}`}><span className="block text-2xl p-4 bg-rose-800 hover:bg-rose-700 transition">{ text }</span></Link>) : (<Link to={`/dashboard/${route}`}><span className="block text-2xl p-4 bg-rose-500 hover:bg-rose-700 transition">{ text }</span></Link>)
}

export default function Dashboard({ children }: IChildren) {
    return (
        <section className="w-4/5 h-auto m-16 flex border-8 rounded-4xl bg-rose-300 text-center z-10 shadow-2xl backdrop-blur-3xl overflow-hidden">
            <nav className="flex flex-col w-1/3 bg-rose-500">
                <NavOption text="Overall" route="overall"/>
                <NavOption text="Transactions" route="transactions"/>
                <NavOption text="Investments" route="investments"/>
                <NavOption text="Notes" route="notes"/>
                <NavOption text="Trends" route="trends"/>
                <NavOption text="Profile" route="profile"/>
            </nav>
            <div className="w-2/3">
                { children }
            </div>
        </section>
    )
}