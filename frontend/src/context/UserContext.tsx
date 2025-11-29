import { createContext, useContext, ReactNode } from 'react';
import {
    useMutation,
    UseMutationResult,
    useQueryClient,
} from '@tanstack/react-query';
import api from '@/api';
import { AxiosError, AxiosResponse } from 'axios';

interface IChildren {
    children?: ReactNode;
}

interface IUserContext {
    loginMutate: UseMutationResult<
        AxiosResponse<any, any, {}>,
        AxiosError<any, any>,
        object | undefined,
        unknown
    >;
    logoutMutation: () => void;
}

const UserContext = createContext<IUserContext | null>(null);

export function UserProvide({ children }: IChildren) {
    const queryClient = useQueryClient();
    const queryKey = ['user'];

    const onSuccess = () => queryClient.invalidateQueries({ queryKey });

    const handleLogin = useMutation<
        AxiosResponse<any, any>,
        AxiosError<any, any>,
        object | undefined,
        unknown
    >({
        mutationFn: (credentials?: object) =>
            api.post('/users/login', credentials),
        onSuccess: (res) => {
            localStorage.setItem('token', res.data.token);
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error) => {
            console.log('Login failed: ', error);
        },
    });

    const handleLogout = useMutation({
        mutationFn: () => api.get('/users/logout'),
        onSuccess,
    });

    return (
        <UserContext.Provider
            value={{
                loginMutate: handleLogin,
                logoutMutation: () => handleLogout.mutate(),
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within an UserProvide');
    }
    return context;
}
