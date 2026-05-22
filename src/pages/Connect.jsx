import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';

const Connect = () => {
    useEffect(() => {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true, offset: 100 });
    }, []);

    return (
        <main style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--primary-dark)' }}>
            <Helmet>
                <title>PcCharm Connect | Where Tech Minds Unite</title>
                <meta name="description" content="PcCharm Connect - A global network of like-minded creators, developers, and innovators." />
            </Helmet>
            <section className="text-center py-5">
                <div className="container" data-aos="fade-up">
                    <span className="section-subtitle mb-3" style={{ letterSpacing: '3px' }}>PcCharm Connect</span>
                    <h1 className="mb-4">Where Tech Minds Unite.</h1>
                    <p className="lead mx-auto mb-5" style={{ maxWidth: '750px' }}>
                        A global network of like-minded creators, developers, and innovators. Join us to collaborate, learn, and grow together.
                    </p>
                    <div className="glass-card p-5 mt-5">
                        <i className="fas fa-users" style={{ fontSize: '4rem', color: 'var(--teal-accent)', marginBottom: '1.5rem' }}></i>
                        <h3>The Network is Growing</h3>
                        <p>Mentor-matching, monthly meetups, and open-source opportunities are on the horizon.</p>
                        <p className="text-muted">Platform MVP launch: August 2026</p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Connect;
