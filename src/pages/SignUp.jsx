import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

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
            // Note: Supabase might require email confirmation by default.
            alert('Registration successful! Please check your email for confirmation link if enabled, or login.');
            navigate('/login');
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="hero d-flex align-items-center justify-content-center">
            <div className="container" style={{ paddingTop: '80px' }}>
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="glass-card p-5">
                            <h2 className="text-center mb-4">Create Account</h2>
                            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                            <form onSubmit={handleSignUp}>
                                <div className="mb-3">
                                    <label className="form-label text-light">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-light">Email address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        required
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-light">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        required
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-gradient w-100" disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </form>
                            <p className="mt-4 text-center">
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
