import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext({ user: null, isAdmin: false, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [state, setState] = useState({ user: null, isAdmin: false, loading: true });
    const initialized = useRef(false);

    useEffect(() => {
        // Prevent double-init in StrictMode
        if (initialized.current) return;
        initialized.current = true;

        const init = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
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
                } else {
                    setState({ user: null, isAdmin: false, loading: false });
                }
            } catch {
                setState({ user: null, isAdmin: false, loading: false });
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
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
                } else if (event === 'SIGNED_OUT') {
                    setState({ user: null, isAdmin: false, loading: false });
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
