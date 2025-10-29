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

interface IGoal {
    _id: string;
    dateCreation: Date;
    dateUpdate: Date;
    goalname: string;
    requiredmoney: number;
    completed: boolean;
}

interface IGoalContext {
    goals: IGoal[] | null;
    loading: boolean;
    handleGoals: () => Promise<void>;
    handleAddGoal: () => Promise<void>;
    handleChangeGoal: (_id: string, body: object) => Promise<void>;
    handleDeleteGoal: (_id: string) => Promise<void>;
    handleFinishGoal: (_id: string) => Promise<void>;
}

const GoalContext = createContext<IGoalContext | null>(null);

export function GoalProvide({ children }: IChildren) {
    const [goals, setGoals] = useState<IGoal[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const handleGoals = async () => {
        await api.get('/goals/all').then((res) => {
            setGoals(res.data);
        });
    };

    const handleAddGoal = async () => {
        await api
            .post('/goals/new', { title: 'TEST', content: '' })
            .then(() => handleGoals());
    };

    const handleDeleteGoal = async (_id: string) => {
        await api.delete(`/goals/delete/${_id}`).then(() => handleGoals());
    };

    const handleChangeGoal = async (_id: string, body: object) => {
        await api.put(`/goals/edit/${_id}`, body).then(() => handleGoals());
    };

    const handleFinishGoal = async (_id: string) => {
        await api
            .put(`/goals/edit/${_id}`, { completed: true })
            .then(() => handleGoals());
    };

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                await handleGoals();
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGoals();
    }, []);

    return (
        <GoalContext.Provider
            value={{
                goals,
                handleGoals,
                handleAddGoal,
                handleFinishGoal,
                handleChangeGoal,
                handleDeleteGoal,
                loading,
            }}
        >
            {children}
        </GoalContext.Provider>
    );
}

export function useGoals() {
    const context = useContext(GoalContext);
    if (!context) {
        throw new Error('useGoals must be used within an GoalProvide');
    }
    return context;
}
