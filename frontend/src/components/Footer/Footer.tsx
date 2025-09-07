export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <div className="h-auto p-5 flex justify-center text-center bg-gradient-to-r from-yellow-500 to-orange-500 shadow-xl">
            <p>Copyright &copy; { year } BudgetTracker</p>
        </div>
    )
}