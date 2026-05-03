import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useState, useEffect } from 'react';

/* 
 * Supabase SQL Migration (run in SQL editor):
 * ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
 */

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, isAdmin, loading } = useAuth();
    const [slowLoad, setSlowLoad] = useState(false);

    useEffect(() => {
        let slowTimer;
        if (loading) {
            slowTimer = setTimeout(() => setSlowLoad(true), 3000);
        } else {
            setSlowLoad(false);
        }
        return () => clearTimeout(slowTimer);
    }, [loading]);

    if (loading) {
        return (
            <div id="preloader">
                <img src="/icon.png" alt="PcCharm Logo" className="preloader-logo" />
                <div className="loader" />
                {slowLoad && (
                    <p style={{
                        color: '#888', 
                        fontSize: '13px', 
                        marginTop: '16px',
                        textAlign: 'center',
                        animation: 'fadeIn 0.5s ease'
                    }}>
                        Taking longer than usual...{' '}
                        <button 
                            onClick={() => {
                                Object.keys(localStorage)
                                    .filter(k => k.startsWith('sb-'))
                                    .forEach(k => localStorage.removeItem(k));
                                window.location.reload();
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#6c63ff',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '13px',
                                padding: 0
                            }}
                        >
                            Click here to reload
                        </button>
                    </p>
                )}
            </div>
        );
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
