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
                <Pie data={data} options={options} />
            </div>
            <div>
                <Pie data={data} options={options} />
            </div>
            <div>
                <Pie data={data} options={options} />
            </div>
            <div>
                <Pie data={data} options={options} />
            </div>
        </div>
    );
}
