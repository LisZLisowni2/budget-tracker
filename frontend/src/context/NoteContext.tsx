import { useState, createContext, useContext, useEffect, ReactNode } from "react";
import api from "../api";

interface IChildren {
    children?: ReactNode
}

interface INote {
    _id: string,
    title: string,
    content: string,
}

interface INoteContext {
	notes: INote[] | null,
	loading: boolean,
    handleNotes: () => Promise<void>,
	// handleAddNote: () => Promise<void>,
	// handleChangeNote: () => Promise<void>,
	// handleDeleteNote: () => Promise<void>,
	// handleCopyNote: () => Promise<void>,
}

const NoteContext = createContext<INoteContext | null>(null);

export function NoteProvide({ children }: IChildren) {
    const [notes, setNotes] = useState<INote[] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const handleNotes = async () => {
        await api.get('/notes/all')
        .then(res => {
            setNotes(res.data)
        })
    }

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                await handleNotes()
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchNotes()
    }, [])

    return (
        <NoteContext.Provider value={{ notes, handleNotes, loading }}>
            { children }
        </NoteContext.Provider>
    )
}

export function useNotes() {
    const context = useContext(NoteContext)
    if (!context) {
    	throw new Error("useNotes must be used within an NoteProvide")
    }
    return context
}
