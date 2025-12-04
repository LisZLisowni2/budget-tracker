import api from '@/api';
import { useQuery } from '@tanstack/react-query';
import { IGoal } from '@/types/goal';

const fetchGoals = async (): Promise<IGoal[]> => {
    const result = await api.get('/goals/all');
    return result.data;
};

export default function useGoalsQuery() {
    return useQuery({
        queryKey: ['goals'],
        queryFn: fetchGoals,
        staleTime: 1000 * 60 * 5,
    });
}
