import { useState, createContext, useContext, useEffect, ReactNode } from "react";
import api from "../api";

interface IChildren {
    children?: ReactNode
}

const UserContext = createContext<any | null>(null);

export function UserProvide({ children }: IChildren) {
    const [user, setUser] = useState<any | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const handleUserLogin = async () => {
        const user = await api.get('/users/me', {
            withCredentials: true
        })
        setUser(user)
    }

    const handleUserLogout = async () => {
        await api.get('/users/me', {
            withCredentials: true
        })
        setUser(null)
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                await handleUserLogin()
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    return (
        <UserContext.Provider value={{user, handleUserLogin, handleUserLogout, loading}}>
            { children }
        </UserContext.Provider>
    )
}

export function useUser() {
    return useContext(UserContext)
}