import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';

const SecLab = () => {
    useEffect(() => {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true, offset: 100 });
    }, []);

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
                            <div className="input-group mx-auto" style={{ maxWidth: '400px' }}>
                                <input type="email" className="form-control" placeholder="Enter your email" aria-label="Email for waitlist" />
                                <button className="btn btn-gradient text-white" type="button" style={{ borderRadius: '0 50px 50px 0' }}>Join Waitlist</button>
                            </div>
                            <p className="text-muted mt-3 small">Be the first to know when SecLab launches in 2026.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default SecLab;
