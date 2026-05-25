import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    const [nlEmail, setNlEmail] = useState('');
    const [nlLoading, setNlLoading] = useState(false);
    const [nlSubmitted, setNlSubmitted] = useState(false);
    const [nlError, setNlError] = useState('');

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!nlEmail.trim()) return;
        setNlLoading(true);
        setNlError('');

        try {
            const { error } = await supabase
                .from('course_waitlist')
                .insert([{ email: nlEmail.trim(), course_id: 'newsletter' }]);

            if (error) throw error;
            setNlSubmitted(true);
            setNlEmail('');
        } catch (err) {
            setNlError(err.message || 'Something went wrong. Try again.');
        } finally {
            setNlLoading(false);
        }
    };

    // Handler for hash links that need to navigate to Home first
    const handleHashClick = (e, hash) => {
        e.preventDefault();
        if (isHome) {
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/' + hash);
        }
    };

    return (
        <footer>
            <div className="container">
                <div className="row gy-4">
                    <div className="col-lg-4 mb-lg-0">
                        <div className="footer-about">
                            <Link to="/" className="footer-logo d-inline-flex align-items-center">
                                <img src="/icon.png" alt="PcCharm Logo" />
                                PcCharm™
                            </Link>
                            <p>The integrated platform transforming potential into proven tech innovators through AI-powered learning, real-world projects, and a global ecosystem.</p>
                            <div className="social-links mt-4">
                                <a href="https://twitter.com/pccharm" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                                <a href="https://linkedin.com/company/pccharm" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                                <a href="https://github.com/pccharm" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub"><i className="fab fa-github"></i></a>
                                <a href="https://discord.gg/pccharm" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Discord"><i className="fab fa-discord"></i></a>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-2">
                        <div className="footer-links">
                            <h5>Platform</h5>
                            <ul>
                                <li><a href="#why-pccharm" onClick={(e) => handleHashClick(e, '#why-pccharm')}>Why Us</a></li>
                                <li><a href="#ecosystem" onClick={(e) => handleHashClick(e, '#ecosystem')}>Ecosystem</a></li>
                                <li><a href="#solutions" onClick={(e) => handleHashClick(e, '#solutions')}>Solutions</a></li>
                                <li><a href="#impact" onClick={(e) => handleHashClick(e, '#impact')}>Impact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-2">
                        <div className="footer-links">
                            <h5>Resources</h5>
                            <ul>
                                <li><Link to="/academy">Academy</Link></li>
                                <li><Link to="/community">Community</Link></li>
                                <li><Link to="/blog">Blog</Link></li>
                                <li><Link to="/connect">Careers</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-4">
                        <div className="footer-links">
                            <h5>Stay Updated</h5>
                            <p className="opacity-70">Join our newsletter for the latest AI & tech insights.</p>
                            {nlSubmitted ? (
                                <div className="d-flex align-items-center gap-2 mt-3" style={{ color: '#4ade80' }}>
                                    <i className="fas fa-check-circle"></i>
                                    <span className="small">You're subscribed! Stay tuned for updates.</span>
                                </div>
                            ) : (
                                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                                    <input 
                                        type="email" 
                                        className="newsletter-input" 
                                        placeholder="Enter your email" 
                                        value={nlEmail}
                                        onChange={(e) => setNlEmail(e.target.value)}
                                        required
                                        disabled={nlLoading}
                                    />
                                    <button type="submit" className="newsletter-btn" disabled={nlLoading}>
                                        {nlLoading ? '...' : 'Join'}
                                    </button>
                                    {nlError && <p className="text-danger mt-2 small" style={{ position: 'relative' }}>{nlError}</p>}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
                <hr className="footer-divider" />
                <div className="copyright">
                    © {currentYear} PcCharm™. All rights reserved. | <Link to="/blog">Privacy Policy</Link> | <Link to="/blog">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
