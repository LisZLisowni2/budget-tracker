import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";

const queryKey = ['user']

export function useLoginMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (credentials?: object) => api.post('/users/login', credentials),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
        }
    })
}

export function useLogoutMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => api.get('/users/logout'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
        }
    })
}