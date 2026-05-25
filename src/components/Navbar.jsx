import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
                        <li className="nav-item"><NavLink className="nav-link" to="/" end>Home</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link" to="/academy">Academy</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link" to="/connect">Connect</NavLink></li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="upcomingDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: 'pointer' }}>
                                Upcoming
                            </a>
                            <ul className="dropdown-menu dropdown-menu-dark" aria-label="Upcoming products" style={{ backgroundColor: 'rgba(10, 17, 40, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <li><Link className="dropdown-item text-muted" to="/aiforge">PcCharm AI Forge</Link></li>
                                <li><Link className="dropdown-item text-muted" to="/seclab">PcCharm SecLab</Link></li>
                                <li><Link className="dropdown-item text-muted" to="/proservices">PcCharm Pro Services</Link></li>
                            </ul>
                        </li>
                        <li className="nav-item"><NavLink className="nav-link" to="/blog">Blog</NavLink></li>

                        {!user ? (
                            <>
                                <li className="nav-item"><NavLink className="nav-link" to="/login">Login</NavLink></li>
                                <li className="nav-item d-flex align-items-center ms-lg-3 mt-3 mt-lg-0">
                                    <Link className="btn btn-gradient text-white px-4 py-2 rounded-pill shadow-sm" to="/signup" style={{ fontWeight: '600' }}>Get Started</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item"><NavLink className="nav-link" to="/dashboard">Dashboard</NavLink></li>
                                <li className="nav-item d-flex align-items-center ms-lg-3 mt-3 mt-lg-0">
                                    <button className="btn btn-outline-light px-4 py-2 rounded-pill" onClick={handleLogout}>Logout</button>
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
