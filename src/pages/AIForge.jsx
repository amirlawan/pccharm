import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import { supabase } from '../lib/supabaseClient';

const AIForge = () => {
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
                .insert([{ email: email.trim(), course_id: 'aiforge' }]);

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
                <title>PcCharm AI Forge | Crafting Intelligence</title>
                <meta name="description" content="PcCharm AI Forge - Crafting Intelligence. Forging Innovators." />
            </Helmet>
            <section className="text-center py-5">
                <div className="container" data-aos="fade-up">
                    <span className="section-subtitle mb-3" style={{ letterSpacing: '3px' }}>PcCharm AI Forge</span>
                    <h1 className="mb-4">Crafting Intelligence. Forging Innovators.</h1>
                    <p className="lead mx-auto mb-5" style={{ maxWidth: '750px' }}>
                        An evolving AI hub focused on education, experimentation, and innovation in artificial intelligence.
                        Get hands-on with the latest AI tools and workflows.
                    </p>
                    <div className="glass-card p-5 mt-5">
                        <i className="fas fa-brain" style={{ fontSize: '4rem', color: 'var(--teal-accent)', marginBottom: '1.5rem' }}></i>
                        <h3>The Forge is Heating Up</h3>
                        <p>We are currently building guides, tutorials, and practical projects using GPT-4, Claude, and more.</p>
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
                            <p className="text-muted mt-3 small">Be the first to know when AI Forge launches in 2026.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AIForge;
