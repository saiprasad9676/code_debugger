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
    // The `google` global is injected by the GIS script (see index.html)
    // @ts-ignore – we know the script will provide this object
    if (!window.google?.accounts?.id) {
        const err = new Error('Google Identity Services script not loaded');
        console.error(err);
        onError?.(err);
        return;
    }

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
