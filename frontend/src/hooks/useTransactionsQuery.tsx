import api from '@/api';
import { useQuery } from '@tanstack/react-query';
import { ITransaction } from '@/types/transaction';

const fetchTransactions = async (): Promise<ITransaction[]> => {
    const result = await api.get('/transactions/all');
    return result.data;
};

export default function useTransactionsQuery() {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: fetchTransactions,
        staleTime: 1000 * 60 * 5,
    });
}
