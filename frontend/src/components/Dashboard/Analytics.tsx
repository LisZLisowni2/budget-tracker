import useGoalsQuery from '@/hooks/useGoalsQuery';
import useNotesQuery from '@/hooks/useNotesQuery';
import useTransactionsQuery from '@/hooks/useTransactionsQuery';
import useUserQuery from '@/hooks/useUserQuery';
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
    Colors,
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

import { Pie } from 'react-chartjs-2';
import ErrorData from './ErrorData';
import { useMemo } from 'react';

export default function Analytics() {
    sessionStorage.setItem('selectedDashboard', '4');
    const { data: user, isLoading: isUserLoading } = useUserQuery();
    const { data: notes, isLoading: isNotesLoading } = useNotesQuery();
    const { data: goals, isLoading: isGoalsLoading } = useGoalsQuery();
    const { data: transactions, isLoading: isTransactionsLoading } =
        useTransactionsQuery();

    if (
        isUserLoading ||
        isGoalsLoading ||
        isNotesLoading ||
        isTransactionsLoading
    ) {
        return (
            <p>
                Loading... User: {isUserLoading ? 'Loading' : 'Loaded'}, Goals:
                {isGoalsLoading ? 'Loading' : 'Loaded'}, Transactions:
                {isTransactionsLoading ? 'Loading' : 'Loaded'}, Notes:
                {isNotesLoading ? 'Loading' : 'Loaded'}
            </p>
        );
    }

    if (!user)
        return (
            <ErrorData
                dataType="User"
                message="You are not allowed to access Dashboard. "
            />
        );
    if (!notes) return <ErrorData dataType="Note" />;
    if (!goals) return <ErrorData dataType="Goals" />;
    if (!transactions) return <ErrorData dataType="Transactions" />;

    const latestNotes = 5;
    const sortedNotes = useMemo(
        () =>
            notes
                .sort((noteA, noteB) => {
                    const dateA = new Date(noteA.dateUpdate);
                    const dateB = new Date(noteB.dateUpdate);
                    return dateA.getTime() - dateB.getTime();
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
        let categories = new Set<string>();
        transactions.map((transaction) => {
            if (!transaction.receiver) categories.add(transaction.category);
        });

        return Array.from(categories);
    }, [transactions]);
    const valuesByCategories = useMemo(() => {
        let dictionary = new Map<string, number>();
        categories.map((category) => {
            let res = 0;
            transactions.map((transaction) => {
                res +=
                    transaction.category === category && !transaction.receiver
                        ? transaction.price
                        : 0;
            });
            dictionary.set(category, res);
        });
        return Array.from(dictionary.values());
    }, [transactions]);

    console.log(income)
    console.log(sortedNotes)
    console.log(valuesByCategories)
    console.log(expensive)
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Sales',
                data: [100, 300, 200, 100, 500, 300],
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
                text: 'Monthly income and expenses, last 6 months',
            },
            colors: {
                enabled: true,
            },
        },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 h-full max-h-screen gap-4 *:m-auto *:w-full *:h-full *:flex *:justify-center *:p-4 max-lg:overflow-auto">
            {/* TODO: Update charts to represent data */}
            <div>
                {' '}
                {/* TODO: Income and expanses in 6 months */}
                <Pie data={data} options={options} />
            </div>
            <div>
                {' '}
                {/* TODO: Progression of goals */}
                <Pie data={data} options={options} />
            </div>
            <div>
                {' '}
                {/* TODO: Comparision of Income and Expanses in 2 months */}
                <Pie data={data} options={options} />
            </div>
            <div>
                {' '}
                {/* TODO: Source of income */}
                <Pie data={data} options={options} />
            </div>
        </div>
    );
}
