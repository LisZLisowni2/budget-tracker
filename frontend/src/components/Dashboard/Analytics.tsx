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
import { ChangeEvent, useMemo, useState } from 'react';
import { DataRanges } from '@/types/dataRanges';

export default function Analytics() {
    sessionStorage.setItem('selectedDashboard', '4');
    const getDataRange = () => {
        const savedRange = localStorage.getItem('selectedRange');
        return savedRange ? JSON.parse(savedRange) : DataRanges.ONE_MONTH;
    };

    const [selectedRange, setSelectedRange] =
        useState<DataRanges>(getDataRange);
    const { data: user, isLoading: isUserLoading } = useUserQuery();
    const { data: notes, isLoading: isNotesLoading } = useNotesQuery();
    const { data: goals, isLoading: isGoalsLoading } = useGoalsQuery();
    const { data: transactions, isLoading: isTransactionsLoading } =
        useTransactionsQuery();

    const handleRangeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedRange(event.target.value as DataRanges);
        localStorage.setItem(
            'selectedRange',
            JSON.stringify(event.target.value)
        );
    };

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

    const calculateTime = useMemo(() => {
        const now = new Date();
        switch (selectedRange) {
            case DataRanges.ONE_WEEK:
                return now.setTime(now.getTime() - 1000 * 60 * 60 * 24 * 7);
            case DataRanges.ONE_MONTH:
                return now.setTime(now.getDate() - 1000 * 60 * 60 * 24 * 30);
            case DataRanges.THREE_MONTHS:
                return now.setTime(now.getDate() - 1000 * 60 * 60 * 24 * 90);
            case DataRanges.SIX_MONTHS:
                return now.setTime(now.getDate() - 1000 * 60 * 60 * 24 * 180);
            case DataRanges.ONE_YEAR:
                return now.setTime(now.getDate() - 1000 * 60 * 60 * 24 * 365);
            case DataRanges.ALL_TIME:
                return now.setTime(0);
            default:
                return now.setTime(0);
        }
    }, [selectedRange]);

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
            if (
                transaction.receiver &&
                new Date(transaction.dateCreation).getTime() > calculateTime
            )
                result += transaction.price;
        });

        return result;
    }, [transactions, calculateTime]);
    const expensive = useMemo(() => {
        let result = 0;
        transactions.map((transaction) => {
            if (
                !transaction.receiver &&
                new Date(transaction.dateCreation).getTime() > calculateTime
            )
                result += transaction.price;
        });

        return result;
    }, [transactions, calculateTime]);
    const categories = useMemo(() => {
        let categories = new Set<string>();
        transactions.map((transaction) => {
            if (
                !transaction.receiver &&
                new Date(transaction.dateCreation).getTime() > calculateTime
            )
                categories.add(transaction.category);
        });

        return Array.from(categories);
    }, [transactions, calculateTime]);
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
        <div className="flex flex-col">
            <select
                className="text-center w-min m-auto"
                defaultValue={getDataRange()}
                onChange={(e) => handleRangeChange(e)}
            >
                <option value="1W">Week</option>
                <option value="1M">Month</option>
                <option value="3M">3 Months</option>
                <option value="6M">6 Months</option>
                <option value="1Y">Year</option>
                <option value="ALL">All time</option>
            </select>
            <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 h-full max-h-screen gap-4 *:m-auto *:w-full *:h-full *:flex *:justify-center *:p-4 max-lg:overflow-auto">
                {/* TODO: Update charts to represent data */}
                <div>
                    {' '}
                    {/* TODO: Income and expanses in SELECTED time */}
                    <Pie data={data} options={options} />
                </div>
                <div>
                    {' '}
                    {/* TODO: Progression of goals */}
                    <Pie data={data} options={options} />
                </div>
                <div>
                    {' '}
                    {/* TODO: Comparision of Income and Expanses in SELECTED time */}
                    <Pie data={data} options={options} />
                </div>
                <div>
                    {' '}
                    {/* TODO: Source of income */}
                    <Pie data={data} options={options} />
                </div>
            </div>
        </div>
    );
}
