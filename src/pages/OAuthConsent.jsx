import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabaseClient';

const OAuthConsent = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [approving, setApproving] = useState(false);
    const [denying, setDenying] = useState(false);

    // Pull OAuth params from the URL
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const responseType = searchParams.get('response_type');
    const scope = searchParams.get('scope') || 'read';
    const state = searchParams.get('state');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (!s) {
                // Not logged in – redirect to login, then come back
                navigate(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            } else {
                setSession(s);
            }
            setLoading(false);
        });
    }, [navigate]);

    const handleApprove = async () => {
        if (!redirectUri) return;
        setApproving(true);
        try {
            // Build callback URL with Supabase access token
            const { data: { session: s } } = await supabase.auth.getSession();
            const params = new URLSearchParams();
            if (responseType === 'token') {
                params.set('access_token', s?.access_token || '');
                params.set('token_type', 'bearer');
            }
            if (state) params.set('state', state);
            window.location.href = `${redirectUri}?${params.toString()}`;
        } catch {
            setApproving(false);
        }
    };

    const handleDeny = () => {
        setDenying(true);
        if (redirectUri) {
            const params = new URLSearchParams({ error: 'access_denied', error_description: 'User denied the request.' });
            if (state) params.set('state', state);
            window.location.href = `${redirectUri}?${params.toString()}`;
        } else {
            navigate('/');
        }
    };

    if (loading) {
        return (
            <div id="preloader">
                <img src="/icon.png" alt="PcCharm Logo" className="preloader-logo" />
                <div className="loader" />
            </div>
        );
    }

    const displayScopes = scope
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(s => {
            const map = {
                read: 'Read your profile information',
                email: 'Access your email address',
                openid: 'Verify your identity',
                profile: 'View your public profile',
                offline_access: 'Stay signed in (refresh tokens)',
            };
            return map[s] || s;
        });

    return (
        <section
            className="hero d-flex align-items-center justify-content-center"
            style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '40px' }}
        >
            <Helmet>
                <title>Authorize Access | PcCharm™</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="glass-card p-5 animate-fade-in">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <img src="/icon.png" alt="PcCharm" style={{ width: 56, height: 56, marginBottom: '12px' }} />
                                <h2 className="fw-bold text-white mb-1" style={{ fontSize: '1.5rem' }}>
                                    Authorize Access
                                </h2>
                                <p className="text-muted small mb-0">
                                    An application is requesting access to your PcCharm account.
                                </p>
                            </div>

                            {/* App Info */}
                            {clientId && (
                                <div
                                    className="d-flex align-items-center gap-3 p-3 rounded-4 mb-4"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                        style={{ width: 44, height: 44, background: 'var(--gradient-1)', fontSize: '1.2rem', color: '#fff' }}
                                    >
                                        <i className="fas fa-cube"></i>
                                    </div>
                                    <div>
                                        <p className="text-white fw-bold mb-0" style={{ fontSize: '0.95rem' }}>
                                            {clientId}
                                        </p>
                                        <small className="text-muted">OAuth Application</small>
                                    </div>
                                </div>
                            )}

                            {/* Signed-in as */}
                            <div className="mb-4 text-center">
                                <small className="text-muted">
                                    Signed in as <span className="text-info fw-semibold">{session?.user?.email}</span>
                                </small>
                            </div>

                            {/* Requested permissions */}
                            <div className="mb-4">
                                <p className="text-white small fw-semibold mb-2">
                                    <i className="fas fa-shield-alt text-warning me-2"></i>
                                    This app will be able to:
                                </p>
                                <ul className="list-unstyled ps-2">
                                    {displayScopes.map((s, i) => (
                                        <li key={i} className="d-flex align-items-center gap-2 mb-2">
                                            <i className="fas fa-check-circle text-success" style={{ fontSize: '0.85rem', flexShrink: 0 }}></i>
                                            <span className="text-light small">{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex flex-column gap-3">
                                <button
                                    id="oauth-approve-btn"
                                    className="btn btn-gradient w-100 py-2 fw-semibold"
                                    onClick={handleApprove}
                                    disabled={approving || denying}
                                >
                                    {approving
                                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Authorizing...</>
                                        : <><i className="fas fa-check me-2"></i>Authorize</>
                                    }
                                </button>
                                <button
                                    id="oauth-deny-btn"
                                    className="btn btn-outline-danger w-100 py-2"
                                    onClick={handleDeny}
                                    disabled={approving || denying}
                                >
                                    {denying
                                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Cancelling...</>
                                        : <><i className="fas fa-times me-2"></i>Deny</>
                                    }
                                </button>
                            </div>

                            <p className="text-muted text-center mt-4 mb-0" style={{ fontSize: '0.75rem' }}>
                                By clicking Authorize, you allow this app to use your information in accordance with PcCharm's{' '}
                                <a href="/connect" className="text-info">Privacy Policy</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OAuthConsent;
