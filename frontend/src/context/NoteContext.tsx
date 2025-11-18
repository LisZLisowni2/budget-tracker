import { createContext, useContext, ReactNode } from 'react';
import api from '../api';
import { useQueryClient, useMutation } from '@tanstack/react-query';

interface IChildren {
    children?: ReactNode;
}

interface INote {
    _id: string;
    title: string;
    content: string;
    dateUpdate: Date;
    dataCreation: Date;
}

interface INoteContext {
    addMutation: () => void;
    changeMutation: (_id: string, body: object) => void;
    deleteMutation: (_id: string) => void;
    copyMutation: (_id: string) => void;
}

const NoteContext = createContext<INoteContext | null>(null);

type ChangeMutationArgs = {
    _id: string;
    body: object;
};

export function NoteProvide({ children }: IChildren) {
    const queryClient = useQueryClient();
    const queryKey = ['notes'];

    const onSuccess = () => queryClient.invalidateQueries({ queryKey });

    const handleAddNote = useMutation({
        mutationFn: async () =>
            await api.post('/notes/new', { title: '', content: '' }),
        mutationKey: queryKey,
        onSuccess,
    });

    const handleChangeNote = useMutation({
        mutationFn: async ({ _id, body }: ChangeMutationArgs) => {
            await api.put(`/notes/edit/${_id}`, body);
        },
        mutationKey: queryKey,
        onSuccess,
    });

    const handleDeleteNote = useMutation({
        mutationFn: async (_id: string) =>
            await api.delete(`/notes/delete/${_id}`),
        mutationKey: queryKey,
        onSuccess,
    });

    const handleCopyNote = useMutation({
        mutationFn: async (_id: string) => {
            const res = await api.get(`/notes/${_id}`);
            const note: INote = res.data;
            await api.post(`/notes/new/`, {
                title: note.title,
                content: note.content,
            });
        },
        mutationKey: queryKey,
        onSuccess,
    });

    return (
        <NoteContext.Provider
            value={{
                addMutation: () => handleAddNote,
                changeMutation: (_id: string, body: object) => handleChangeNote.mutate({ _id, body }),
                copyMutation: (_id: string) => handleCopyNote.mutate(_id),
                deleteMutation: (_id: string) => handleDeleteNote.mutate(_id),
            }}
        >
            {children}
        </NoteContext.Provider>
    );
}

export function useNotes() {
    const context = useContext(NoteContext);
    if (!context) {
        throw new Error('useNotes must be used within an NoteProvide');
    }
    return context;
}
