import { useState, MouseEventHandler, ReactNode } from "react"
import { Link } from "react-router"

interface INavOption {
    text: string,
    route: string,
    active?: boolean,
    onClick?: MouseEventHandler
}

interface IChildren {
    children?: ReactNode
}


function NavOption({ text, route, active, onClick }: INavOption) {
    return (active) ? (<Link to={`/dashboard/${route}`} onClick={onClick}><span className="block text-2xl p-2 lg:p-4 font-bold bg-rose-800 hover:bg-rose-700 transition">{ text }</span></Link>) : (<Link to={`/dashboard/${route}`} onClick={onClick}><span className="block text-2xl p-2 lg:p-4 bg-rose-500 hover:bg-rose-700 transition">{ text }</span></Link>)
}

export default function Dashboard({ children }: IChildren ) {
    const [selected, setSelected] = useState<number>(5) // TODO: Selected item highlight
    return (
        <section className="w-4/5 h-auto m-16 lg:max-sm:flex-col lg:flex border-8 rounded-4xl bg-orange-400 text-center z-10 shadow-2xl backdrop-blur-3xl overflow-hidden">
            <nav className="flex flex-col lg:w-1/3 bg-rose-500 max-md:overflow-auto">
                <NavOption text="Overall" route="overall" active={ (selected == 0) ? true : false } onClick={() => setSelected(0)}/>
                <NavOption text="Transactions" route="transactions" active={ (selected == 1) ? true : false } onClick={() => setSelected(1)}/>
                <NavOption text="Investments" route="investments" active={ (selected == 2) ? true : false } onClick={() => setSelected(2)}/>
                <NavOption text="Notes" route="notes" active={ (selected == 3) ? true : false } onClick={() => setSelected(3)}/>
                <NavOption text="Trends" route="trends" active={ (selected == 4) ? true : false } onClick={() => setSelected(4)}/>
                <NavOption text="Profile" route="profile" active={ (selected == 5) ? true : false } onClick={() => setSelected(5)}/>
            </nav>
            <div className="lg:w-2/3 text-center">
                { children }
            </div>
        </section>
    )
}