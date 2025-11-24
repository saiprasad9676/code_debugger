import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import { User } from 'firebase/auth'; // keep the type for consistency
import { auth, handleRedirectResult } from '@/lib/firebase'; // still keep Firebase auth for session persistence
import {
    initGoogleSignIn,
    signOutGoogle,
} from '@/lib/googleAuth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
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

    // -----------------------------------------------------------------
    // 1️⃣ Keep Firebase onAuthStateChanged for session persistence
    // -----------------------------------------------------------------
    useEffect(() => {
        // Handle redirect result (if you ever use redirect flow)
        handleRedirectResult().catch((e) => console.error('Redirect error', e));

        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // -----------------------------------------------------------------
    // 2️⃣ Google Sign‑In wrapper
    // -----------------------------------------------------------------
    const signInWithGoogle = async () => {
        return new Promise<void>((resolve, reject) => {
            // Create a temporary hidden container for the GIS button
            const containerId = 'gsi-button-container';
            let container = document.getElementById(containerId);
            if (!container) {
                container = document.createElement('div');
                container.id = containerId;
                // Keep it hidden – we only need the button for the pop‑up flow
                container.style.display = 'none';
                document.body.appendChild(container);
            }

            initGoogleSignIn(
                containerId,
                (payload) => {
                    // Payload contains fields like `sub`, `email`, `name`, `picture`
                    // Convert it into a Firebase‑compatible `User` shape (optional)
                    const fakeUser: User = {
                        uid: payload.sub,
                        displayName: payload.name,
                        email: payload.email,
                        photoURL: payload.picture,
                        // The following fields are not used in our UI, but we provide stubs
                        emailVerified: true,
                        isAnonymous: false,
                        providerId: 'google.com',
                        // @ts-ignore – these are part of the Firebase User interface
                        getIdToken: async () => payload.sub,
                        // ...other methods can be no‑ops
                    } as unknown as User;

                    setUser(fakeUser);
                    resolve();
                },
                (err) => {
                    console.error('Google Sign‑In error', err);
                    reject(err);
                }
            );
        });
    };

    // -----------------------------------------------------------------
    // 4️⃣ Sign‑out wrapper
    // -----------------------------------------------------------------
    const signOut = async () => {
        try {
            signOutGoogle(); // clears GIS auto‑select
            await auth.signOut(); // also clears any Firebase session you might have
            setUser(null);
        } catch (e) {
            console.error('Sign out error', e);
            throw e;
        }
    };

    const value = { user, loading, signInWithGoogle, signOut };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
