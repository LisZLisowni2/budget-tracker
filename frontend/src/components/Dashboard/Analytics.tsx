import { useUser } from '../../context/UserContext';
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

import { Pie } from 'react-chartjs-2';

export default function Analytics() {
    sessionStorage.setItem('selectedDashboard', '4');
    const { user, loading } = useUser();

    if (loading) {
        return <p>Loading profile...</p>;
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
                enabled: true
            }
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
