import {
    createContext,
    useContext,
    ReactNode,
} from 'react';
import { useLoginMutation, useLogoutMutation } from '@/hooks/useAuthMutations';

interface IChildren {
    children?: ReactNode;
}

interface IUserContext {
    loginMutation: (credentials?: object) => void;
    logoutMutation: () => void;
}

const UserContext = createContext<IUserContext | null>(null);

export function UserProvide({ children }: IChildren) {
    const handleLogin = useLoginMutation();
    const handleLogout = useLogoutMutation();

    return (
        <UserContext.Provider
            value={{ 
                loginMutation: (credentials?: object) => handleLogin.mutate(credentials),
                logoutMutation: () => handleLogout.mutate()
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
