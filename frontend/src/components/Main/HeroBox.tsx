import Button from "../Button/Button"
import { Link } from "react-router"

export default function HeroBox() {
    return (
        <div className="relative bg-gradient-to-r from-rose-400 to-rose-500 p-8 lg:p-24 rounded-4xl text-center max-w-3xs lg:max-w-3xl z-10 shadow-xl backdrop-blur-xl">
            <h2 className="text-xl lg:text-4xl mb-4 font-bold">Take control over your budget with BudgetTracker!</h2>
            <p className="text-sm lg:text-1xl">Easy to use, functional UI, no ads, account system for multiple spheres (home, business)</p>
            <p><Link to="/register"><Button text="Get Started" /></Link></p>
        </div>
    )
}