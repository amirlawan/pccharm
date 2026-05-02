import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

const Navbar = () => {
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Scroll listener
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${scrolled ? 'scrolled' : ''}`}>
            <div className="container">
                <Link className="navbar-brand" to="/">
                    {/* Note: Ensure icon.png is in public folder */}
                    <img src="/icon.png" alt="PcCharm Logo" />
                    PcCharm™
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/academy">Academy</Link></li>
                        <li className="nav-item">
                            <span className="nav-link text-muted" style={{ cursor: "default" }}>
                                Blog <span className="badge bg-secondary ms-1" style={{ fontSize: "0.6rem" }}>Soon</span>
                            </span>
                        </li>
                        <li className="nav-item">
                            {location.pathname === '/' ? (
                                <a className="nav-link" href="#community">Community</a>
                            ) : (
                                <Link className="nav-link" to="/#community">Community</Link>
                            )}
                        </li>

                        {!user ? (
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                                <li className="nav-item"><Link className="nav-link btn btn-gradient btn-sm px-3 ms-lg-3" to="/signup">Get Started</Link></li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item"><Link className="nav-link active" to="/dashboard">Dashboard</Link></li>
                                <li className="nav-item">
                                    <button className="nav-link btn btn-outline-light btn-sm px-3 ms-lg-3" onClick={handleLogout}>Logout</button>
                                </li>
                            </>
                        )}

                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
