import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import { supabase } from '../lib/supabaseClient';

const ProServices = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        AOS.refresh();
    }, []);

    const handleWaitlistSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setErrorMsg('');

        try {
            const { error } = await supabase
                .from('course_waitlist')
                .insert([{ email: email.trim(), course_id: 'proservices' }]);

            if (error) throw error;
            setSubmitted(true);
            setEmail('');
        } catch (err) {
            setErrorMsg(err.message || 'Failed to join waitlist. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--primary-dark)' }}>
            <Helmet>
                <title>PcCharm Pro Services | Smart Solutions</title>
                <meta name="description" content="PcCharm Pro Services - Professional-grade consulting and tech service implementation." />
            </Helmet>
            <section className="text-center py-5">
                <div className="container" data-aos="fade-up">
                    <span className="section-subtitle mb-3" style={{ letterSpacing: '3px' }}>PcCharm Pro Services</span>
                    <h1 className="mb-4">Smart Solutions. Skilled People.</h1>
                    <p className="lead mx-auto mb-5" style={{ maxWidth: '750px' }}>
                        Professional-grade consulting and tech service implementation for Web & Mobile Development, AI Integration, and Cybersecurity Audits.
                    </p>
                    <div className="glass-card p-5 mt-5">
                        <i className="fas fa-briefcase" style={{ fontSize: '4rem', color: 'var(--teal-accent)', marginBottom: '1.5rem' }}></i>
                        <h3>Enterprise Ready</h3>
                        <p>We are prioritizing excellence, agility, and reliability—building trust through results.</p>
                        <div className="mt-4">
                            {submitted ? (
                                <div className="alert alert-success mx-auto" style={{ maxWidth: '400px' }}>
                                    <i className="fas fa-check-circle me-2"></i>You're on the list! We'll notify you when we open.
                                </div>
                            ) : (
                                <form onSubmit={handleWaitlistSubmit}>
                                    <div className="input-group mx-auto" style={{ maxWidth: '400px' }}>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            placeholder="Enter business email" 
                                            aria-label="Email for waitlist" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                        <button 
                                            className="btn btn-gradient text-white" 
                                            type="submit" 
                                            style={{ borderRadius: '0 50px 50px 0' }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Submitting...' : 'Notify Me'}
                                        </button>
                                    </div>
                                    {errorMsg && <p className="text-danger mt-2 small">{errorMsg}</p>}
                                </form>
                            )}
                            <p className="text-muted mt-3 small">Get notified when Pro Services opens for client onboarding.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ProServices;
