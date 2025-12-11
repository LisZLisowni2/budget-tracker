import useGoalsQuery from '@/hooks/useGoalsQuery';
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
    BarElement
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
    Colors,
    BarElement
);

import { Bar, Line } from 'react-chartjs-2';
import ErrorData from './ErrorData';
import { ChangeEvent, useMemo, useState, useEffect, ReactNode } from 'react';
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
    const { data: goals, isLoading: isGoalsLoading } = useGoalsQuery();
    const { data: transactions, isLoading: isTransactionsLoading } =
        useTransactionsQuery();

    const [comparisonComp, setComparisonComp] = useState<ReactNode>();
    const [balanceComp, setBalanceComp] = useState<ReactNode>();
    const [incomeSourceComp, setIncomeSourceComp] = useState<ReactNode>();
    const [goalsProgressComp, setGoalsProgressComp] = useState<ReactNode>();

    const handleRangeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedRange(event.target.value as DataRanges);
        localStorage.setItem(
            'selectedRange',
            JSON.stringify(event.target.value)
        );
    };

    const calculateTime = useMemo(() => {
        const now = new Date();
        switch (selectedRange) {
            case DataRanges.ONE_WEEK:
                return now.setTime(now.getTime() - 1000 * 60 * 60 * 24 * 7);
            case DataRanges.ONE_MONTH:
                return now.setTime(now.getTime() - 1000 * 60 * 60 * 24 * 30);
            case DataRanges.THREE_MONTHS:
                return now.setTime(now.getTime() - 1000 * 60 * 60 * 24 * 90);
            case DataRanges.SIX_MONTHS:
                return now.setTime(now.getTime() - 1000 * 60 * 60 * 24 * 180);
            case DataRanges.ONE_YEAR:
                return now.setTime(now.getTime() - 1000 * 60 * 60 * 24 * 365);
            case DataRanges.ALL_TIME:
                return now.setTime(0);
            default:
                return now.setTime(0);
        }
    }, [selectedRange]);

    const countDays = useMemo(
        () => Math.round((Date.now() - calculateTime) / 1000 / 60 / 60 / 24),
        [calculateTime]
    );

    const dataLabels = useMemo(() => {
        const startTime = calculateTime;
        const labels = []
        const dateOptions: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };

        for (let i = 0; i < countDays; i++) {
            const currentDayTime = startTime + 1000 * 60 * 60 * 24 * i;
            const date = new Date(currentDayTime);

            labels.push(date.toLocaleDateString(undefined, dateOptions));
        }

        return labels
    }, [calculateTime, countDays])

    const incomeInTime = useMemo(() => {
        let income = new Map<number, number>();
        const startTime = calculateTime;

        for (let i = 0; i < countDays; i++) {
            let dailyIncome = 0;

            const dayStart = startTime + 1000 * 60 * 60 * 24 * i;
            const dayEnd = startTime + 1000 * 60 * 60 * 24 * (i + 1);

            (transactions || []).map((transaction) => {
                const txTime = new Date(transaction.updatedAt).getTime();
                dailyIncome +=
                    transaction.receiver &&
                    txTime >= dayStart &&
                    txTime < dayEnd
                        ? transaction.value
                        : 0;
            });
            income.set(i + 1, dailyIncome);
        }

        return income;
    }, [transactions, calculateTime]);

    const expenseInTime = useMemo(() => {
        let expense = new Map<number, number>();
        const startTime = calculateTime;
        for (let i = 0; i < countDays; i++) {
            let dailyExpense = 0;

            const dayStart = startTime + 1000 * 60 * 60 * 24 * i;
            const dayEnd = startTime + 1000 * 60 * 60 * 24 * (i + 1);

            (transactions || []).map((transaction) => {
                const txTime = new Date(transaction.updatedAt).getTime();
                dailyExpense +=
                    transaction.receiver &&
                    txTime >= dayStart &&
                    txTime < dayEnd
                        ? transaction.value
                        : 0;
            });
            expense.set(i + 1, dailyExpense);
        }

        return expense;
    }, [transactions, calculateTime]);

    const balanceInTime = useMemo(() => {
        let balance = new Map<number, number>();
        const startTime = calculateTime;
        
        for (let i = 0; i < countDays; i++) {
            let dailyBalance = 0

            const dayStart = startTime + 1000 * 60 * 60 * 24 * i;
            const dayEnd = startTime + 1000 * 60 * 60 * 24 * (i + 1);

            (transactions || []).map((transaction) => {
                const txTime = new Date(transaction.updatedAt).getTime();
                dailyBalance +=
                    transaction.receiver &&
                    txTime >= dayStart &&
                    txTime < dayEnd
                        ? transaction.value
                        : 0;
            });
            balance.set(i + 1, dailyBalance);
            }

        return balance;
    }, [transactions, calculateTime]);

    const incomeSources = useMemo(() => {
        let sources = new Map<string, number>();

        (transactions || []).map((transaction) => {
            const txTime = new Date(transaction.updatedAt).getTime();
            if (txTime >= calculateTime) {
                sources.set(transaction.category, (sources.get(transaction.category) || 0) + transaction.value);
            }
        })

        return sources
    }, [transactions, calculateTime]);

    const goalsProgress = useMemo(() => {
        let progress = new Map<string, number>();

        (goals || []).map((goal) => {
            const goalTime = new Date(goal.updatedAt).getTime();
            if (goalTime >= calculateTime) {
                progress.set(goal.name, (progress.get(goal.name) || 0) + goal.requiredValue);
            }
        })

        return progress
    }, [goals, calculateTime])

    useEffect(() => {
        const data = {
            labels: dataLabels,
            datasets: [
                {
                    label: 'Income',
                    data: Array.from(incomeInTime.values()),
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Expenses',
                    data: Array.from(expenseInTime.values()),
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
                    text: 'Income and expanses',
                },
                colors: {
                    forceOverride: true,
                },
            },
        };

        setComparisonComp(<Line data={data} options={options} />);
    }, [incomeInTime, expenseInTime, dataLabels]);

    useEffect(() => {
        const data = {
            labels: dataLabels,
            datasets: [
                {
                    label: 'Balance',
                    data: Array.from(balanceInTime.values()),
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
                    text: 'Balance',
                },
                colors: {
                    forceOverride: true,
                },
            },
        };

        setBalanceComp(<Line data={data} options={options} />);
    }, [balanceInTime, dataLabels]);

    useEffect(() => {
        const data = {
            labels: Array.from(incomeSources.keys()),
            datasets: [
                {
                    label: 'Sources',
                    data: Array.from(incomeSources.values()),
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
                    text: 'Income sources',
                },
                colors: {
                    forceOverride: true,
                },
            },
        };

        setIncomeSourceComp(<Bar data={data} options={options} />);
    }, [incomeSources, dataLabels]);

    useEffect(() => {
        const data = {
            labels: Array.from(goalsProgress.keys()),
            datasets: [
                {
                    label: 'Goals',
                    data: Array.from(goalsProgress.values()),
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
                    text: 'Progress of goals',
                },
                colors: {
                    forceOverride: true,
                },
            },
        };

        setGoalsProgressComp(<Bar data={data} options={options} />);
    }, [goalsProgress, dataLabels]);

    if (isUserLoading || isGoalsLoading || isTransactionsLoading) {
        return (
            <p>
                Loading... User: {isUserLoading ? 'Loading' : 'Loaded'}, Goals:
                {isGoalsLoading ? 'Loading' : 'Loaded'}, Transactions:
                {isTransactionsLoading ? 'Loading' : 'Loaded'}, Notes:
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
    if (!goals) return <ErrorData dataType="Goals" />;
    if (!transactions) return <ErrorData dataType="Transactions" />;

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
            <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 max-h-screen gap-4 *:m-auto *:w-full *:h-full *:flex *:justify-center *:p-4 max-lg:overflow-auto">
                {/* TODO: Update charts to represent data */}
                <div>
                    {comparisonComp}
                </div>
                <div>
                    {goalsProgressComp}
                </div>
                <div>
                    {balanceComp}
                </div>
                <div>
                    {incomeSourceComp}
                </div>
            </div>
        </div>
    );
}
