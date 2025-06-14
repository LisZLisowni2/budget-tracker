import { useState, createContext, useContext, useEffect, ReactNode } from "react";
import api from "../api";

interface IChildren {
    children?: ReactNode
}

interface IUser {
    username: string,
    email: string,
    password?: string,
    scope?: string
}

interface IUserContext {
	user: IUser | null,
	loading: boolean,
	handleUserLogin: () => Promise<void>,
	handleUserLogout: () => Promise<void>
}

const UserContext = createContext<IUserContext | null>(null);

export function UserProvide({ children }: IChildren) {
    const [user, setUser] = useState<IUser | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const handleUserLogin = async () => {
        const res = await api.get('/users/me')
        const user: IUser = { username: res.data.username, email: res.data.email, password: res.data.password, scope: res.data.scope }
        setUser(user)
    }

    const handleUserLogout = async () => {
        await api.get('/users/me')
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
        <UserContext.Provider value={{ user, handleUserLogin, handleUserLogout, loading }}>
            { children }
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (!context) {
    	throw new Error("useUser must be used within an UserProvide")
    }
    return context
}
