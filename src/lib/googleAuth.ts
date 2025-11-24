// src/lib/googleAuth.ts
/* ------------------------------------------------------------------
   Google Identity Services (GIS) helper
   ---------------------------------------------------------------*/

export const GOOGLE_CLIENT_ID =
    '432873761264-8camv1a97cpeiq1gglih2j2klq2p97m1.apps.googleusercontent.com';

/**
 * Initialise the GIS button and attach a callback.
 * Call this once (e.g. in a useEffect) where you want the button to appear.
 *
 * @param containerId – the DOM element id where the button will be rendered
 * @param onSuccess   – receives the decoded JWT payload (user info)
 * @param onError     – receives an Error object if something goes wrong
 */
export const initGoogleSignIn = (
    containerId: string,
    onSuccess: (payload: any) => void,
    onError?: (err: any) => void
) => {
    // Check if script is loaded, if not, load it dynamically
    // @ts-ignore
    if (!window.google?.accounts?.id) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            initializeGis(containerId, onSuccess, onError);
        };
        script.onerror = (e) => {
            const err = new Error('Failed to load Google Identity Services script');
            console.error(err, e);
            onError?.(err);
        };
        document.head.appendChild(script);
        return;
    }

    initializeGis(containerId, onSuccess, onError);
};

const initializeGis = (
    containerId: string,
    onSuccess: (payload: any) => void,
    onError?: (err: any) => void
) => {
    // @ts-ignore
    if (!window.google?.accounts?.id) return;

    // Initialise the GIS client
    // @ts-ignore
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
            try {
                // The response contains a JWT (id_token) – decode it
                const token = response.credential;
                const payload = JSON.parse(atob(token.split('.')[1])); // simple decode, no verification
                onSuccess(payload);
            } catch (e) {
                console.error('Failed to decode Google ID token', e);
                onError?.(e);
            }
        },
    });

    // Render the button (you can customize size/theme here)
    // @ts-ignore
    google.accounts.id.renderButton(
        document.getElementById(containerId)!,
        { theme: 'outline', size: 'large' }
    );

    // Optional: auto‑prompt the user if they have a session
    // @ts-ignore
    google.accounts.id.prompt();
};

/**
 * Sign‑out helper – simply revokes the local session.
 * GIS does not provide a server‑side revocation; you just clear your app state.
 */
export const signOutGoogle = () => {
    // @ts-ignore
    if (window.google?.accounts?.id) {
        // @ts-ignore
        google.accounts.id.disableAutoSelect();
    }
};
