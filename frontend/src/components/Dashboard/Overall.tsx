import { useGoals } from '@/context/GoalContext';
import { useUser } from '@/context/UserContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Colors
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Colors
);
import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { useTransactions } from '@/context/TransactionContext';
import { useNotes } from '@/context/NoteContext';

interface IStatsItem {
    title: string;
    value: number;
    currency: string;
    type: 'other' | 'expense' | 'income';
}

interface INotes {
    title: string;
    notes: string[];
}

function StatsItem({ title, value, currency, type }: IStatsItem) {
    const bgColor =
        type === 'income'
            ? 'bg-green-500 text-white'
            : type === 'expense'
              ? 'bg-red-500 text-white'
              : 'bg-whtie text-black';
    return (
        <div
            className={`w-full rounded-xl shadow-md hover:scale-105 transition-all ${bgColor}`}
        >
            <div className="flex flex-row justify-between">
                <h3>{title}</h3>
            </div>
            <h1 className="text-3xl">
                {value}
                {currency}
            </h1>
        </div>
    );
}

function Notes({ title, notes }: INotes) {
    return (
        <div className="overflow-hidden mx-2 h-80">
            <h2 className="text-xl lg:text-2xl">{title}</h2>
            <hr />
            <ul className="*:p-2 text-md">
                {notes.map((note) => (
                    <li className="shadow-md p-1 m-2 hover:scale-105 transition-all">
                        {note}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Overall() {
    sessionStorage.setItem('selectedDashboard', '0');
    const { user, loading } = useUser();
    const { goals, loading: goalsLoading } = useGoals();
    const { notes, loading: notesLoading } = useNotes();
    const { transactions, loading: transactionsLoading } = useTransactions();

    if (loading || goalsLoading || notesLoading || transactionsLoading) {
        return (
            <p>
                Loading... User: {loading ? 'Loading' : 'Loaded'}, Goals:
                {goalsLoading ? 'Loading' : 'Loaded'}, Transactions:
                {transactionsLoading ? 'Loading' : 'Loaded'}, Notes:
                {notesLoading ? 'Loading' : 'Loaded'}
            </p>
        );
    }

    if (!user) {
        return (
            <div className="w-full flex justify-center items-center">
                <p className="text-black text-4xl font-bold text-center">
                    You are not allowed to access Dashboard.
                    <br />
                    Please login to continue
                </p>
            </div>
        );
    }

    if (!notes) {
        return (
            <div className="w-full flex justify-center items-center">
                <p className="text-black text-4xl font-bold text-center">
                    Notes doesn't load. Probably server's error.
                    <br />
                    Please try again later
                </p>
            </div>
        );
    }

    if (!goals) {
        return (
            <div className="w-full flex justify-center items-center">
                <p className="text-black text-4xl font-bold text-center">
                    Goals doesn't load. Probably server's error.
                    <br />
                    Please try again later
                </p>
            </div>
        );
    }

    if (!transactions) {
        return (
            <div className="w-full flex justify-center items-center">
                <p className="text-black text-4xl font-bold text-center">
                    Transactions doesn't load. Probably server's error.
                    <br />
                    Please try again later
                </p>
            </div>
        );
    }

    const latestNotes = 5;
    const sortedNotes = useMemo(
        () =>
            notes
                .sort(
                    (noteA, noteB) => {
                        const dateA = new Date(noteA.dateUpdate)
                        const dateB = new Date(noteB.dateUpdate)
                        return dateA.getTime() - dateB.getTime()
                    })
                .slice(0, latestNotes),
        [notes]
    );
    const income = useMemo(() => {
        let result = 0;
        transactions.map((transaction) => {
            if (transaction.receiver) result += transaction.price;
        });

        return result;
    }, [transactions]);
    const expensive = useMemo(() => {
        let result = 0;
        transactions.map((transaction) => {
            if (!transaction.receiver) result += transaction.price;
        });

        return result;
    }, [transactions]);
    const categories = useMemo(() => {
        let categories = new Set<string>()
        transactions.map((transaction) => {
            if (!transaction.receiver) categories.add(transaction.category)
        });

        return Array.from(categories)
    }, [transactions]);
    const valuesByCategories = useMemo(() => {
        let dictionary = new Map<string, number>()
        categories.map(category => {
            let res = 0
            transactions.map(transaction => {
                res += (transaction.category === category && !transaction.receiver) ? transaction.price : 0
            })
            dictionary.set(category, res)
        })
        return Array.from(dictionary.values())
    }, [transactions])

    const data = {
        labels: categories,
        datasets: [
            {
                label: 'Expenses',
                data: valuesByCategories,
                // borderColor: 'blue',
                // backgroundColor: 'lightblue',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            // legend: { position: "top" },
            title: {
                display: true,
                text: 'Expenses by categories',
            },
            colors: {
                enabled: true
            }
        },
    };

    return (
        <div className="flex items-center flex-col h-full *:p-4 max-lg:overflow-auto">
            <div className="flex max-md:flex-col w-full max-md:justify-center h-1/2">
                <div className="flex flex-col w-full h-1/4 md:*:p-8 ">
                    <div className="flex max-md:flex-col flex-row *:m-1 *:p-4">
                        <StatsItem
                            title="Total income"
                            value={income}
                            currency="zł"
                            type="income"
                        />
                        <StatsItem
                            title="Total costs"
                            value={expensive}
                            currency="zł"
                            type="expense"
                        />
                    </div>
                    <div className="max-mdflex-col flex flex-row *:m-1 *:p-4">
                        <StatsItem
                            title="Total profit"
                            value={income - expensive}
                            currency="zł"
                            type="other"
                        />
                        <StatsItem
                            title="Total balance"
                            value={income - expensive}
                            currency="zł"
                            type="other"
                        />
                    </div>
                </div>
                <div className="flex-col lg:w-full h-1/4 max-md:hidden mt-8">
                    <h1>Goals here</h1>
                </div>
            </div>
            <div className="flex max-md:flex-col h-1/2 justify-evenly items-center w-full *:bg-white">
                <div className="text-lg lg:text-xl w-full h-full p-8 m-2 shadow-2xl rounded-3xl flex justify-between overflow-hidden">
                    <div className="w-full h-full flex justify-center">
                        <Pie data={data} options={options} />
                    </div>
                </div>
                <div className="text-lg lg:text-xl w-full h-full p-8 m-2 shadow-2xl rounded-3xl flex flex-col justify-between overflow-hidden">
                    <h3 className="text-3xl">Notes</h3>
                    <Notes
                        title="Latest (last 5)"
                        notes={sortedNotes.map((note) => note.title)}
                    />
                </div>
            </div>
        </div>
    );
}
