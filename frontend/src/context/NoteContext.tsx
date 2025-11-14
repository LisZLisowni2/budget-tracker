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

interface INote {
    _id: string;
    title: string;
    content: string;
    dateUpdate: Date;
    dataCreation: Date;
}

interface INoteContext {
    notes: INote[] | null;
    loading: boolean;
    handleNotes: () => Promise<void>;
    handleAddNote: () => Promise<void>;
    handleChangeNote: (_id: string, body: object) => Promise<void>;
    handleDeleteNote: (_id: string) => Promise<void>;
    handleCopyNote: (_id: string) => Promise<void>;
}

const NoteContext = createContext<INoteContext | null>(null);

export function NoteProvide({ children }: IChildren) {
    const [notes, setNotes] = useState<INote[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const handleNotes = async () => {
        await api.get('/notes/all').then((res) => {
            setNotes(res.data);
        });
    };

    const handleAddNote = async () => {
        await api
            .post('/notes/new', { title: '', content: '' })
            .then(() => handleNotes());
    };

    const handleDeleteNote = async (_id: string) => {
        await api.delete(`/notes/delete/${_id}`).then(() => handleNotes());
    };

    const handleCopyNote = async (_id: string) => {
        const res = await api.get(`/notes/${_id}`);
        const note: INote = res.data;
        await api
            .post(`/notes/new/`, { title: note.title, content: note.content })
            .then(() => handleNotes());
    };

    const handleChangeNote = async (_id: string, body: object) => {
        await api.put(`/notes/edit/${_id}`, body).then(() => handleNotes());
    };

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                await handleNotes();
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    return (
        <NoteContext.Provider
            value={{
                notes,
                handleNotes,
                handleAddNote,
                handleChangeNote,
                handleCopyNote,
                handleDeleteNote,
                loading,
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
