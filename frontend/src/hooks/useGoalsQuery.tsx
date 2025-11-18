import api from "@/api";
import { useQuery } from "@tanstack/react-query";
import { IGoal } from "@/types/goal";

const fetchTransactions = async (): Promise<IGoal[]> => {
    const result = await api.get('/goals/all')
    return result.data;
}

export default function useGoalsQuery() {
    return useQuery({
        queryKey: ["goals"],
        queryFn: fetchTransactions,
        staleTime: 1000 * 60 * 5
    })
} 

// TODO: Add rest of TanStack for rest contextes 