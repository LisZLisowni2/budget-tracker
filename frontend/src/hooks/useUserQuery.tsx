import api from '@/api';
import { useQuery } from '@tanstack/react-query';
import { IUser } from '@/types/user';

const fetchUser = async (): Promise<IUser | null> => {
    try {
        const result = await api.get('/users/me');
        return result.data;
    } catch (err) {
        return null;
    }
};

export default function useUserQuery() {
    return useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
        staleTime: 1000 * 60 * 5,
    });
}
