import { createContext, useContext, ReactNode } from 'react';
import api from '../api';
import { useQueryClient, useMutation } from '@tanstack/react-query';

interface IChildren {
    children?: ReactNode;
}

interface ITransactionContext {
    add: (body: object) => void;
    change: (_id: string, body: object) => void;
    delete: (_id: string) => void;
}

const TransactionContext = createContext<ITransactionContext | null>(null);

type ChangeMutationArgs = {
    _id: string;
    body: object;
};

export function TransactionProvide({ children }: IChildren) {
    const queryClient = useQueryClient();
    const queryKey = ['transactions'];

    const onSuccess = () => queryClient.invalidateQueries({ queryKey });

    const handleAddMutation = useMutation({
        mutationFn: (body: object) => api.post('/transactions/new', body),
        onSuccess,
    });

    const handleChangeMutation = useMutation({
        mutationFn: ({ _id, body }: ChangeMutationArgs) =>
            api.put(`/transactions/edit/${_id}`, body),
        onSuccess,
    });

    const handleDeleteMutation = useMutation({
        mutationFn: (_id: string) => api.delete(`/transactions/delete/${_id}`),
        onSuccess,
    });

    return (
        <TransactionContext.Provider
            value={{
                add: (body: object) => handleAddMutation.mutate(body),
                change: (_id: string, body: object) =>
                    handleChangeMutation.mutate({ _id, body }),
                delete: (_id: string) => handleDeleteMutation.mutate(_id),
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransactions() {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useNotes must be used within an NoteProvide');
    }
    return context;
}
