export default function ReasonsBox() {
    return (
        <div className="relative bg-gradient-to-r text-black p-8 lg:p-24 text-center max-w-screen lg:max-w-3xl z-10">
            <h2 className="text-xl lg:text-4xl mb-4 font-bold">
                Reasons to use BudgetTracker
            </h2>
            <ul className="text-lg [&>li]:p-1 [&>li]:shadow-md [&>li]:m-2 [&>li]:hover:scale-105 [&>li]:transition-all">
                <li>No ads</li>
                <li>Advanced monitoring</li>
                <li>User-friendly UI</li>
                <li>Account system</li>
            </ul>
        </div>
    );
}
