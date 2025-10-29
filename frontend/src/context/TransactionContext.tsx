import {
    useState,
    createContext,
    useContext,
    useEffect,
    ReactNode,
} from 'react';
import api from '../api';

interface IChildren {
    children?: ReactNode;
}

interface ITranscation {
    _id: string;
    dateCreation: Date;
    dateUpdate: Date;
    name: string;
    price: number;
    category: string;
    receiver: boolean;
}

interface ITransactionContext {
    transactions: ITranscation[] | null;
    loading: boolean;
    handleTransactions: () => Promise<void>;
    handleAddTransaction: (body: object) => Promise<void>;
    handleChangeTransaction: (_id: string, body: object) => Promise<void>;
    handleDeleteTransaction: (_id: string) => Promise<void>;
}

const TransactionContext = createContext<ITransactionContext | null>(null);

export function TransactionProvide({ children }: IChildren) {
    const [transactions, setTransactions] = useState<ITranscation[] | null>(
        null
    );
    const [loading, setLoading] = useState<boolean>(true);

    const handleTransactions = async () => {
        await api.get('/transactions/all').then((res) => {
            setTransactions(res.data);
        });
    };

    const handleAddTransaction = async (body: object) => {
        await api
            .post('/transactions/new', body)
            .then(() => handleTransactions());
    };

    const handleDeleteTransaction = async (_id: string) => {
        await api
            .delete(`/transactions/delete/${_id}`)
            .then(() => handleTransactions());
    };

    const handleChangeTransaction = async (_id: string, body: object) => {
        await api
            .put(`/transactions/edit/${_id}`, body)
            .then(() => handleTransactions());
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                await handleTransactions();
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    return (
        <TransactionContext.Provider
            value={{
                transactions,
                handleTransactions,
                handleAddTransaction,
                handleChangeTransaction,
                handleDeleteTransaction,
                loading,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransactions() {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useNotes must be used within an NoteProvide');
    }
    return context;
}
