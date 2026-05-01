import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

/* 
 * Supabase SQL Migration (run in SQL editor):
 * ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
 */

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            
            if (user && requireAdmin) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();
                
                setIsAdmin(profile?.is_admin === true);
            }

            setLoading(false);
        };
        checkUser();
    }, [requireAdmin]);

    if (loading) {
        return <div id="preloader"><img src="/icon.png" alt="PcCharm Logo" className="preloader-logo" /><div className="loader"></div></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
