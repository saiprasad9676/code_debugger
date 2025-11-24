import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import { User } from 'firebase/auth';
import { auth, handleRedirectResult } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    initGoogleSignIn,
    signOutGoogle,
} from '@/lib/googleAuth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isNewUser: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        handleRedirectResult().catch((e) => console.error('Redirect error', e));

        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        return new Promise<void>((resolve, reject) => {
            const containerId = 'gsi-button-container';
            let container = document.getElementById(containerId);
            if (!container) {
                container = document.createElement('div');
                container.id = containerId;
                container.style.display = 'none';
                document.body.appendChild(container);
            }

            initGoogleSignIn(
                containerId,
                async (payload) => {
                    try {
                        const response = await fetch(`${API_URL}/api/auth/google`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                uid: payload.sub,
                                email: payload.email,
                                displayName: payload.name,
                                photoURL: payload.picture
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to sync user with database');
                        }

                        const userData = await response.json();

                        setIsNewUser(userData.isNewUser);

                        const userObj: User = {
                            uid: userData.uid,
                            displayName: userData.displayName,
                            email: userData.email,
                            photoURL: userData.photoURL,
                            emailVerified: true,
                            isAnonymous: false,
                            providerId: 'google.com',
                            getIdToken: async () => userData.uid,
                        } as unknown as User;

                        setUser(userObj);
                        resolve();
                    } catch (error) {
                        console.error("Error syncing user:", error);
                        reject(error);
                    }
                },
                (err) => {
                    console.error('Google Sign‑In error', err);
                    reject(err);
                }
            );
        });
    };

    const updateProfile = async (data: any) => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/api/user/${user.uid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            setIsNewUser(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await signOutGoogle();
            await auth.signOut();
            setUser(null);
            setIsNewUser(false);
        } catch (e) {
            console.error('Sign out error', e);
            throw e;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isNewUser, signInWithGoogle, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
