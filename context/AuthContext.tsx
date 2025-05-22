import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../api/auth';

interface User {
    id?: number;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const isAuthenticated = await authAPI.isAuthenticated();
            if (isAuthenticated) {
                // Fetch user data if authenticated
                const userData = await authAPI.getUserData();
                setUser(userData as User);
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const response = await authAPI.login({ email, password });
            if (response.status === 'success' && response.data?.user) {
                setUser(response.data.user as User);
            }
        } catch (error) {
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await authAPI.logout();
            setUser(null);
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 