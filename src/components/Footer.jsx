import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

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
                                <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                                <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
                                <a href="#" className="social-link"><i className="fab fa-github"></i></a>
                                <a href="#" className="social-link"><i className="fab fa-discord"></i></a>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-2">
                        <div className="footer-links">
                            <h5>Platform</h5>
                            <ul>
                                <li><a href="#why-pccharm">Why Us</a></li>
                                <li><a href="#ecosystem">Ecosystem</a></li>
                                <li><a href="#solutions">Solutions</a></li>
                                <li><a href="#impact">Impact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-2">
                        <div className="footer-links">
                            <h5>Resources</h5>
                            <ul>
                                <li><Link to="/academy">Academy</Link></li>
                                <li><a href="#community">Community</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Careers</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-4">
                        <div className="footer-links">
                            <h5>Stay Updated</h5>
                            <p className="opacity-70">Join our newsletter for the latest AI & tech insights.</p>
                            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                                <input type="email" className="newsletter-input" placeholder="Enter your email" />
                                <button type="submit" className="newsletter-btn">Join</button>
                            </form>
                        </div>
                    </div>
                </div>
                <hr className="footer-divider" />
                <div className="copyright">
                    © {currentYear} PcCharm™. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
