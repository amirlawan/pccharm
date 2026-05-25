import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import { supabase } from '../lib/supabaseClient';

const SecLab = () => {
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
                .insert([{ email: email.trim(), course_id: 'seclab' }]);

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
                <title>PcCharm SecLab | Defend. Disrupt. Dominate.</title>
                <meta name="description" content="PcCharm SecLab - A cybersecurity initiative providing in-depth resources." />
            </Helmet>
            <section className="text-center py-5">
                <div className="container" data-aos="fade-up">
                    <span className="section-subtitle mb-3" style={{ letterSpacing: '3px' }}>PcCharm SecLab</span>
                    <h1 className="mb-4">Defend. Disrupt. Dominate.</h1>
                    <p className="lead mx-auto mb-5" style={{ maxWidth: '750px' }}>
                        A cybersecurity initiative providing in-depth resources, training content, and community challenges.
                    </p>
                    <div className="glass-card p-5 mt-5">
                        <i className="fas fa-shield-alt" style={{ fontSize: '4rem', color: 'var(--teal-accent)', marginBottom: '1.5rem' }}></i>
                        <h3>Secure Your Future</h3>
                        <p>Red teaming guides, ethical hacking walkthroughs, and an open resource index are in development.</p>
                        <div className="mt-4">
                            {submitted ? (
                                <div className="alert alert-success mx-auto" style={{ maxWidth: '400px' }}>
                                    <i className="fas fa-check-circle me-2"></i>You're on the list! We'll keep you updated.
                                </div>
                            ) : (
                                <form onSubmit={handleWaitlistSubmit}>
                                    <div className="input-group mx-auto" style={{ maxWidth: '400px' }}>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            placeholder="Enter your email" 
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
                                            {loading ? 'Joining...' : 'Join Waitlist'}
                                        </button>
                                    </div>
                                    {errorMsg && <p className="text-danger mt-2 small">{errorMsg}</p>}
                                </form>
                            )}
                            <p className="text-muted mt-3 small">Be the first to know when SecLab launches in 2026.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default SecLab;
