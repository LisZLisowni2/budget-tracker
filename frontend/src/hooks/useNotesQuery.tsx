import api from "@/api";
import { useQuery } from "@tanstack/react-query";
import { INote } from "@/types/note";

const fetchNotes = async (): Promise<INote[]> => {
    const result = await api.get('/notes/all')
    return result.data;
}

export default function useNotesQuery() {
    return useQuery({
        queryKey: ["notes"],
        queryFn: fetchNotes,
        staleTime: 1000 * 60 * 5
    })
} 

// TODO: Add rest of TanStack for rest contextes 