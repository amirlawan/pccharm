import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../lib/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [forgotMode, setForgotMode] = useState(false);
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    // Automatically redirect to dashboard once the auth state updates globally
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/dashboard');
        }
    }, [user, authLoading, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/dashboard');
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setErrorMsg('Please enter your email address first.');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/dashboard`
            });
            if (error) throw error;
            setSuccessMsg('Password reset link sent! Please check your email inbox.');
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || user) {
        return (
            <div id="preloader">
                <img src="/icon.png" alt="PcCharm Logo" className="preloader-logo" />
                <div className="loader" />
            </div>
        );
    }

    return (
        <section className="hero d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '40px' }}>
            <Helmet>
                <title>{forgotMode ? 'Reset Password' : 'Sign In'} | PcCharm™</title>
                <link rel="canonical" href="https://pccharm.vercel.app/login" />
            </Helmet>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="glass-card p-5">
                            {forgotMode ? (
                                <>
                                    <h2 className="text-center mb-4">Reset Password</h2>
                                    {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                                    {successMsg && <div className="alert alert-success">{successMsg}</div>}
                                    <form onSubmit={handleForgotPassword}>
                                        <div className="mb-4">
                                            <label htmlFor="login-email" className="form-label text-light">Email address</label>
                                            <input
                                                id="login-email"
                                                type="email"
                                                className="form-control"
                                                required
                                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@example.com"
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-gradient w-100 mb-3" disabled={loading}>
                                            {loading ? 'Sending link...' : 'Send Reset Link'}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-light w-100" 
                                            onClick={() => { setForgotMode(false); setErrorMsg(''); setSuccessMsg(''); }}
                                        >
                                            Back to Login
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-center mb-4">Welcome Back</h2>
                                    {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                                    <form onSubmit={handleLogin}>
                                        <div className="mb-3">
                                            <label htmlFor="login-email" className="form-label text-light">Email address</label>
                                            <input
                                                id="login-email"
                                                type="email"
                                                className="form-control"
                                                required
                                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@example.com"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="login-password" className="form-label text-light">Password</label>
                                            <input
                                                id="login-password"
                                                type="password"
                                                className="form-control"
                                                required
                                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="text-end mb-4">
                                            <button 
                                                type="button" 
                                                className="btn btn-link p-0 text-decoration-none text-muted small hover-text-white"
                                                onClick={() => { setForgotMode(true); setErrorMsg(''); setSuccessMsg(''); }}
                                                style={{ fontSize: '0.85rem' }}
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                        <button type="submit" className="btn btn-gradient w-100" disabled={loading}>
                                            {loading ? 'Logging in...' : 'Login'}
                                        </button>
                                    </form>
                                    <p className="mt-4 text-center mb-0">
                                        Don't have an account? <Link to="/signup" style={{ color: 'var(--teal-accent)' }}>Sign Up</Link>
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
