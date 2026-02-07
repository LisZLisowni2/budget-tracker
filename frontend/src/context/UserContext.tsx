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
    updatePassword: UseMutationResult<
        AxiosResponse<any, any, {}>,
        AxiosError<any, any>,
        string | undefined,
        unknown
    >;
    updateAccountDetails: UseMutationResult<
        AxiosResponse<any, any, {}>,
        AxiosError<any, any>,
        object | undefined,
        unknown
    >;
    deleteAccount: UseMutationResult<
        AxiosResponse<any, any, {}>,
        AxiosError<any, any>,
        null,
        unknown
    >;
    logoutMutation: UseMutationResult<
        AxiosResponse<any, any, {}>,
        AxiosError<any, any>,
        null,
        unknown
    >;
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

    const handlePasswordUpdate = useMutation<
        AxiosResponse<any, any>,
        AxiosError<any, any>,
        string | undefined,
        unknown
    >({
        mutationFn: (password?: string) =>
            api.put('/users/updatePassword', { password: password }),
        onSuccess,
    });

    const handleAccountDeletion = useMutation<
        AxiosResponse<any, any>,
        AxiosError<any, any>,
        null,
        unknown
    >({
        mutationFn: () => api.delete('/users/delete'),
        onSuccess,
    });

    const handleAccountUpdate = useMutation<
        AxiosResponse<any, any>,
        AxiosError<any, any>,
        object | undefined,
        unknown>({
            mutationFn: (body?: object) => api.put('/users/update', body),
            onSuccess,
        })

    const handleLogout = useMutation<
        AxiosResponse<any, any>,
        AxiosError<any, any>,
        null,
        unknown>({
        mutationFn: () => api.get('/users/logout'),
        onSuccess,
    });

    return (
        <UserContext.Provider
            value={{
                loginMutate: handleLogin,
                deleteAccount: handleAccountDeletion,
                updatePassword: handlePasswordUpdate,
                updateAccountDetails: handleAccountUpdate,
                logoutMutation: handleLogout,
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
