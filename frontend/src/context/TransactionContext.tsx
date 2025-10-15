import { useState, createContext, useContext, useEffect, ReactNode } from "react";
import api from "../api";

interface IChildren {
    children?: ReactNode
}

interface ITranscation {
    _id: string,
    'date-creation': Date,
    name: string,
    price: number,
    receiver: boolean,
}

interface ITransactionContext {
	transactions: ITranscation[] | null,
	loading: boolean,
    handleTransactions: () => Promise<void>,
	handleAddTransaction: () => Promise<void>,
	handleChangeTransaction: (_id: string, body: {}) => Promise<void>,
	handleDeleteTransaction: (_id: string) => Promise<void>,
}

const TransactionContext = createContext<ITransactionContext | null>(null);

export function TransactionProvide({ children }: IChildren) {
    const [transactions, setTransactions] = useState<ITranscation[] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const handleTransactions = async () => {
        await api.get('/transactions/all')
        .then(res => {
            setTransactions(res.data)
        })
    }

    const handleAddTransaction = async () => {
        await api.post('/transactions/new', { title: "TEST", content: "" })
        .then(_ => handleTransactions())
    }

    const handleDeleteTransaction = async (_id: string) => {
        await api.delete(`/transactions/delete/${_id}`)
        .then(_ => handleTransactions())
    }

    const handleChangeTransaction = async (_id: string, body: {}) => {
        await api.put(`/transactions/edit/${_id}`, body)
        .then(_ => handleTransactions())
    }

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                await handleTransactions()
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchTransactions()
    }, [])

    return (
        <TransactionContext.Provider value={{ transactions, handleTransactions, handleAddTransaction, handleChangeTransaction, handleDeleteTransaction , loading }}>
            { children }
        </TransactionContext.Provider>
    )
}

export function useNotes() {
    const context = useContext(TransactionContext)
    if (!context) {
    	throw new Error("useNotes must be used within an NoteProvide")
    }
    return context
}
