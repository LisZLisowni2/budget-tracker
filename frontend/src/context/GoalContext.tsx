import {
    createContext,
    useContext,
    ReactNode,
} from 'react';
import api from '../api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface IChildren {
    children?: ReactNode;
}

interface IGoalContext {
    addMutation: (body: object) => void;
    changeMutation: (_id: string, body: object) => void;
    deleteMutation: (_id: string) => void;
    finishMutation: (_id: string) => void;
}

const GoalContext = createContext<IGoalContext | null>(null);

type ChangeMutationArgs = {
    _id: string,
    body: object
}

export function GoalProvide({ children }: IChildren) {
    const queryClient = useQueryClient();
    const queryKey = ["goals"]

    const onSuccess = () => queryClient.invalidateQueries({ queryKey })

    const handleAddMutation = useMutation({
        mutationKey: queryKey,
        mutationFn: async (body: object) => await api.post('/goals/new', body),
        onSuccess
    })

    const handleDeleteMutation = useMutation({
        mutationKey: queryKey,
        mutationFn: async (_id: string) => await api.delete(`/goals/delete/${_id}`),
        onSuccess
    });

    const handleChangeMutation = useMutation({
        mutationKey: queryKey,
        mutationFn: async ({_id, body} : ChangeMutationArgs) => {
            await api.put(`/goals/edit/${_id}`, body)
        },
        onSuccess
    });

    const handleFinishMutation = useMutation({
        mutationKey: queryKey,
        mutationFn: async (_id:string) => await api.put(`/goals/edit/${_id}`, { completed: true }),
        onSuccess
    });

    return (
        <GoalContext.Provider
            value={{
                addMutation: (body: object) => handleAddMutation.mutate(body),
                deleteMutation: (_id: string) => handleDeleteMutation.mutate(_id),
                changeMutation: (_id: string, body: object) => handleChangeMutation.mutate({ _id, body }),
                finishMutation: (_id: string) => handleFinishMutation.mutate(_id),
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
