import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        if (password.length < 8) {
            setErrorMsg('Password must be at least 8 characters long.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match. Please verify.');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;
            setSuccessMsg('Registration successful! Please check your email inbox for a confirmation link.');
            setTimeout(() => {
                navigate('/login');
            }, 4000);
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="hero d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '40px' }}>
            <Helmet>
                <title>Create Account | PcCharm™</title>
                <link rel="canonical" href="https://pccharm.vercel.app/signup" />
            </Helmet>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="glass-card p-5">
                            <h2 className="text-center mb-4">Create Account</h2>
                            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                            {successMsg && <div className="alert alert-success">{successMsg}</div>}
                            <form onSubmit={handleSignUp}>
                                <div className="mb-3">
                                    <label htmlFor="signup-fullname" className="form-label text-light">Full Name</label>
                                    <input
                                        id="signup-fullname"
                                        type="text"
                                        className="form-control"
                                        required
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="signup-email" className="form-label text-light">Email address</label>
                                    <input
                                        id="signup-email"
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
                                    <label htmlFor="signup-password" className="form-label text-light">Password</label>
                                    <input
                                        id="signup-password"
                                        type="password"
                                        className="form-control"
                                        required
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="signup-confirm-password" className="form-label text-light">Confirm Password</label>
                                    <input
                                        id="signup-confirm-password"
                                        type="password"
                                        className="form-control"
                                        required
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-gradient w-100" disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </form>
                            <p className="mt-4 text-center mb-0">
                                Already have an account? <Link to="/login" style={{ color: 'var(--teal-accent)' }}>Login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignUp;
