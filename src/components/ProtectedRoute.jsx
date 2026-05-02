import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

/* 
 * Supabase SQL Migration (run in SQL editor):
 * ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
 */

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, isAdmin, loading } = useAuth();

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
