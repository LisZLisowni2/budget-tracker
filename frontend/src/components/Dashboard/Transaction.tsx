import { useState } from "react"
import { useTransactions } from "../../context/TransactionContext"
import { useUser } from "../../context/UserContext"
import Button from "../Button/Button"
import Modal from "../Modal/Modal"

export default function Transactions() { // TODO: Create context for transactions
    // TODO: Handle CRUD for transactions
    sessionStorage.setItem("selectedDashboard", "1")
    const { user, loading: userLoading } = useUser()
    const { transactions, loading: transactionLoading } = useTransactions()
    const [ isAddForm, setStateAddForm ] = useState<boolean>(false)

    if (userLoading) {
        return (<p>
            Loading profile...
        </p>)
    }

    if (transactionLoading) {
        return (<p>
            Loading transactions...
        </p>)
    }

    if (!user) {
        return (
            <div className="w-full flex justify-center items-center">
                <p className="text-black text-4xl font-bold text-center">You are not allowed to access Dashboard.<br />Please login to continue</p>
            </div>
        )
    }

    if (!transactions) { return (
        <div className="w-full flex justify-center items-center">
            <p className="text-black text-4xl font-bold text-center">Transactions doesn't load. Probably server's error.<br />Please try again later</p>
        </div>)
    }

    // const handleAdd = () => {
    //     handleAddTransaction()
    // }
    
    return (
        <div className="flex items-center justify-between flex-col h-full *:p-4 max-lg:overflow-auto">
            <Modal activator={isAddForm}/>
            <div className="bg-white w-4/5 shadow-2xl rounded-4xl max-h-150 m-8 overflow-auto">
                <table className="**:p-3 **:border border-collapse w-full h-full table-auto">
                    <thead className="bg-gray-300 sticky top-0">
                        <tr><th>Date creation</th><th>Last update</th><th>Transaction Name</th><th>Receiver?</th><th>Quantity</th></tr>
                        { transactions.map((transaction) => <tr><td>{transaction.dateCreation.toString()}</td><td>{transaction.dateUpdate.toString()}</td><td>{transaction.name}</td><td>{transaction.receiver}</td><td>{transaction.price}</td></tr>) }
                    </thead>
                    <tbody className="*:hover:bg-gray-100 *:transition-all">
                    </tbody>
                </table>
            </div>
            <div className="text-white flex max-md:flex-col justify-evenly w-full h-1/3 items-center">
                <Button text="Add new transaction" onClick={() => setStateAddForm(!isAddForm)}/>
                <Button text="Change transaction details"/>
                <Button text="Delete transactions"/>
            </div>
        </div>
    )
}