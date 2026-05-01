import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
    return (
        <section className="hero d-flex align-items-center justify-content-center text-center" style={{ minHeight: '100vh', paddingTop: '80px' }}>
            <Helmet>
                <title>Page Not Found | PcCharm™</title>
                <link rel="canonical" href="https://pccharm.vercel.app/404" />
            </Helmet>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="glass-card text-center p-5 w-100">
                            <div className="icon-circle mx-auto mb-4" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <h1 className="display-1 fw-bold text-teal mb-2">404</h1>
                            <h2 className="mb-4">This page doesn't exist</h2>
                            <p className="lead mb-5">
                                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                            </p>
                            <Link to="/" className="btn btn-gradient text-white px-5 py-2">
                                <i className="fas fa-home me-2"></i> Return Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NotFound;
