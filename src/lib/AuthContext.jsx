import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext({ user: null, isAdmin: false, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [state, setState] = useState({ user: null, isAdmin: false, loading: true });
    const initialized = useRef(false);

    useEffect(() => {
        const init = async () => {
            let currentUser = null;
            let currentIsAdmin = false;

            const validateSession = async () => {
                try {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    if (error || !session) {
                        Object.keys(localStorage)
                            .filter(key => key.startsWith('sb-'))
                            .forEach(key => localStorage.removeItem(key));
                    }
                } catch {
                    Object.keys(localStorage)
                        .filter(key => key.startsWith('sb-'))
                        .forEach(key => localStorage.removeItem(key));
                }
            };

            await validateSession();
            
            try {
                const authCheckWithTimeout = Promise.race([
                    supabase.auth.getSession(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Auth timeout')), 5000)
                    )
                ]);

                const { data: { session } } = await authCheckWithTimeout;
                if (session?.user) {
                    currentUser = session.user;
                    try {
                        const { data } = await supabase
                            .from('profiles')
                            .select('is_admin')
                            .eq('id', currentUser.id)
                            .single();
                        currentIsAdmin = data?.is_admin === true;
                    } catch { /* default false */ }
                }
            } catch (err) {
                console.warn('Auth check failed or timed out:', err.message);
                // Clear state immediately and trigger background signout to clear keys safely
                try {
                    supabase.auth.signOut().catch(e => console.warn('Background signOut failed:', e.message));
                } catch (e) {
                    console.warn('SignOut call failed:', e.message);
                }
                currentUser = null;
                currentIsAdmin = false;
            } finally {
                setState({ user: currentUser, isAdmin: currentIsAdmin, loading: false });
            }
        };

        if (!initialized.current) {
            initialized.current = true;
            init();
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if ((event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') && session?.user) {
                    let admin = false;
                    try {
                        const { data } = await supabase
                            .from('profiles')
                            .select('is_admin')
                            .eq('id', session.user.id)
                            .single();
                        admin = data?.is_admin === true;
                    } catch { /* default false */ }
                    setState({ user: session.user, isAdmin: admin, loading: false });

                    if (event === 'PASSWORD_RECOVERY') {
                        sessionStorage.setItem('isPasswordRecovery', 'true');
                    }
                } else if (event === 'SIGNED_OUT') {
                    setState({ user: null, isAdmin: false, loading: false });
                    sessionStorage.removeItem('isPasswordRecovery');
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={state}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
