import React, {
    ChangeEvent,
    ReactNode,
    useMemo,
    useState,
    useEffect,
} from 'react';
import { Pie } from 'react-chartjs-2';
import useTransactionsQuery from '@/hooks/useTransactionsQuery';
import useUserQuery from '@/hooks/useUserQuery';
import useNotesQuery from '@/hooks/useNotesQuery';
import useGoalsQuery from '@/hooks/useGoalsQuery';
import ErrorData from './ErrorData';
import { DataRanges } from '@/types/dataRanges';
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
    Filler,
} from 'chart.js';
import { INote } from '@/types/note';
import { IGoal } from '@/types/goal';

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
    Filler
);
// import { DataRanges } from '@/types/dataRanges';

interface IStatsItem {
    title: string;
    value: number;
    currency: string;
    type: 'other' | 'expense' | 'income';
}

interface INotes {
    title: string;
    data: INote[] | IGoal[];
}

interface IGridItem {
    children: ReactNode;
    className?: string;
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
            className={`rounded-xl shadow-md hover:scale-105 transition-all flex flex-col justify-center items-center ${bgColor}`}
        >
            <h3>{title}</h3>
            <h1 className="text-3xl">
                {value}
                {currency}
            </h1>
        </div>
    );
}

function List({ title, data }: INotes) {
    return (
        <div className="overflow-hidden mx-2 h-80">
            <h2 className="text-xl lg:text-2xl">{title}</h2>
            <hr />
            <ul className="*:p-2 text-md">
                {data.map((item) => (
                    <li
                        key={item._id}
                        className="shadow-md p-1 m-2 hover:scale-105 transition-all"
                    >
                        {'title' in item ? item.title : item.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function GridItem({ children, className }: IGridItem) {
    return (
        <div
            className={`${className} text-lg lg:text-xl p-8 m-2 w-full h-full shadow-lg rounded-3xl overflow-hidden`}
        >
            {children}
        </div>
    );
}

export default function Overall() {
    sessionStorage.setItem('selectedDashboard', '0');

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

    const latestNotes = 5;
    const sortedNotes = useMemo(
        () =>
            (notes || [])
                .sort((noteA, noteB) => {
                    const dateA = new Date(noteA.updatedAt);
                    const dateB = new Date(noteB.updatedAt);
                    return dateA.getTime() - dateB.getTime();
                })
                .slice(0, latestNotes),
        [notes]
    );
    const latestGoals = 5;
    const sortedGoals = useMemo(
        () =>
            (goals || [])
                .sort((goalA, goalB) => {
                    const dateA = new Date(goalA.updatedAt);
                    const dateB = new Date(goalB.updatedAt);
                    return dateA.getTime() - dateB.getTime();
                })
                .slice(0, latestGoals),
        [goals]
    );
    const income = useMemo(() => {
        let result = 0;
        (transactions || []).map((transaction) => {
            if (
                transaction.receiver &&
                new Date(transaction.updatedAt).getTime() > calculateTime
            )
                result += transaction.value;
        });

        return result;
    }, [transactions, calculateTime]);
    const expensive = useMemo(() => {
        let result = 0;
        (transactions || []).map((transaction) => {
            if (
                !transaction.receiver &&
                new Date(transaction.updatedAt).getTime() > calculateTime
            )
                result += transaction.value;
        });

        return result;
    }, [transactions, calculateTime]);
    const incomeNoLimit = useMemo(() => {
        let result = 0;
        (transactions || []).map((transaction) => {
            if (
                transaction.receiver &&
                new Date(transaction.updatedAt).getTime() > calculateTime
            )
                result += transaction.value;
        });

        return result;
    }, [transactions]);
    const expensiveNoLimit = useMemo(() => {
        let result = 0;
        (transactions || []).map((transaction) => {
            if (!transaction.receiver) result += transaction.value;
        });

        return result;
    }, [transactions]);
    const categories = useMemo(() => {
        let categories = new Set<string>();
        (transactions || []).map((transaction) => {
            if (
                !transaction.receiver &&
                new Date(transaction.updatedAt).getTime() > calculateTime
            )
                categories.add(transaction.category);
        });

        return Array.from(categories);
    }, [transactions, calculateTime]);
    const valuesByCategories = useMemo(() => {
        let dictionary = new Map<string, number>();
        (categories || []).map((category) => {
            let res = 0;
            (transactions || []).map((transaction) => {
                res +=
                    transaction.category === category &&
                    !transaction.receiver &&
                    new Date(transaction.updatedAt).getTime() > calculateTime
                        ? transaction.value
                        : 0;
            });
            dictionary.set(category, res);
        });
        return Array.from(dictionary.values());
    }, [transactions, calculateTime]);

    let [pieComponent, setPieComponent] = useState<ReactNode>(null);
    useEffect(() => {
        const data = {
            labels: categories,
            datasets: [
                {
                    label: 'Expenses',
                    data: valuesByCategories,
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
                    forceOverride: true,
                },
            },
        };

        setPieComponent(<Pie data={data} options={options} />);
    }, [categories, valuesByCategories]);

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

    return (
        <div className="grid grid-rows-4 grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 *:justify-self-center *:self-center p-10 max-h-screen">
            <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full">
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
                <StatsItem
                    title="Total profit"
                    value={income - expensive}
                    currency="zł"
                    type="other"
                />
                <StatsItem
                    title="Total balance"
                    value={incomeNoLimit - expensiveNoLimit}
                    currency="zł"
                    type="other"
                />
            </div>
            <GridItem>
                <h3 className="text-4xl">Goals</h3>
                <List title="Latest (last 5)" data={sortedGoals} />
            </GridItem>
            <GridItem className="flex flex-col justify-center items-center">
                <select
                    className="text-center"
                    onChange={(e) => handleRangeChange(e)}
                    defaultValue={getDataRange()}
                >
                    <option value="1W">Week</option>
                    <option value="1M">Month</option>
                    <option value="3M">3 Months</option>
                    <option value="6M">6 Months</option>
                    <option value="1Y">Year</option>
                    <option value="ALL">All time</option>
                </select>
                {pieComponent}
            </GridItem>
            <GridItem>
                <h3 className="text-3xl">Notes</h3>
                <List title="Latest (last 5)" data={sortedNotes} />
            </GridItem>
        </div>
    );
}
