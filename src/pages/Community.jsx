import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';

const Community = () => {
    useEffect(() => {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true, offset: 100 });
        AOS.refresh();

        // Scroll to top on mount
        window.scrollTo(0, 0);

        // Counter Animations
        const animateCounter = (counterElement, target, suffix = '', duration = 2000) => {
            let start = 0;
            if (target === 0) {
                counterElement.textContent = "0" + suffix;
                return;
            }
            const stepTime = Math.max(1, Math.abs(Math.floor(duration / target)));
            const timer = setInterval(() => {
                start += 1;
                if (start >= target) {
                    start = target;
                    clearInterval(timer);
                    counterElement.textContent = start + suffix;
                } else {
                    counterElement.textContent = start + suffix;
                }
            }, stepTime);
            return timer;
        };

        const counters = document.querySelectorAll('.counter-stat:not(.animated)');
        const timers = [];
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-count');
            const suffix = counter.getAttribute('data-suffix') || '';
            timers.push(animateCounter(counter, target, suffix));
            counter.classList.add('animated');
        });

        return () => {
            timers.forEach(clearInterval);
        };
    }, []);

    const hubs = [
        {
            icon: "fa-laptop-code",
            title: "Development Hub",
            description: "Share code, get code reviews, and discuss web, mobile, and software engineering.",
            members: "2.4K",
            color: "var(--teal-accent)"
        },
        {
            icon: "fa-shield-alt",
            title: "Security & SecLab",
            description: "Discuss CTFs, vulnerabilities, and offensive/defensive cybersecurity strategies.",
            members: "1.8K",
            color: "var(--purple-accent)"
        },
        {
            icon: "fa-brain",
            title: "AI & Machine Learning",
            description: "Explore neural networks, LLMs, and data science projects with peers.",
            members: "3.1K",
            color: "var(--yellow-accent)"
        },
        {
            icon: "fa-briefcase",
            title: "Career & Networking",
            description: "Resume reviews, interview prep, and job postings from our hiring partners.",
            members: "4.5K",
            color: "#667eea"
        }
    ];

    const mentors = [
        { name: "Sarah Jenkins", role: "Sr. Security Engineer", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" },
        { name: "David Kim", role: "AI Researcher", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
        { name: "Elena Rodriguez", role: "Full Stack Lead", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80" },
        { name: "James Wilson", role: "Cloud Architect", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" }
    ];

    return (
        <main>
            <Helmet>
                <title>Community - PcCharm™ Network</title>
                <meta name="description" content="Join the global PcCharm community of developers, security experts, and AI enthusiasts." />
            </Helmet>

            {/* Hero Section */}
            <section className="hero" style={{ minHeight: '60vh', paddingBottom: '20px', backgroundPosition: 'center 20%' }}>
                <div className="container">
                    <div className="hero-content text-center mx-auto" data-aos="fade-up" style={{ maxWidth: '800px' }}>
                        <span className="section-subtitle">Global Network</span>
                        <h1 className="mb-4">Welcome to the PcCharm Community</h1>
                        <p className="lead mb-5">
                            Connect, collaborate, and grow with thousands of innovators shaping the future of technology.
                        </p>
                        <div className="d-flex flex-wrap gap-3 justify-content-center">
                            <a href="#" className="btn btn-gradient text-white d-flex align-items-center">
                                <i className="fab fa-discord me-2 fs-5"></i> Join our Discord
                            </a>
                            <Link to="/signup" className="btn btn-outline-light">Become a Member</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Stats */}
            <section className="bg-primary-dark border-bottom border-secondary" style={{ padding: '3rem 0' }}>
                <div className="container">
                    <div className="row text-center gy-4">
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
                            <h2 className="counter-stat mb-1 text-white" data-count="15" data-suffix="K+">0K+</h2>
                            <span className="text-muted text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.9rem' }}>Global Members</span>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
                            <h2 className="counter-stat mb-1 text-white" data-count="1200" data-suffix="+">0</h2>
                            <span className="text-muted text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.9rem' }}>Active Projects</span>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                            <h2 className="counter-stat mb-1 text-white" data-count="24" data-suffix="/7">0</h2>
                            <span className="text-muted text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.9rem' }}>Mentorship & Support</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Hubs */}
            <section className="bg-darker" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
                <div className="container">
                    <div className="text-center mb-5" data-aos="fade-up">
                        <span className="section-subtitle">Find Your Tribe</span>
                        <h2 className="section-title mb-0">Explore Our Hubs</h2>
                    </div>
                    
                    <div className="row g-4">
                        {hubs.map((hub, index) => (
                            <div className="col-md-6 col-lg-6" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                                <div className="glass-card p-4 d-flex align-items-start" style={{ borderRadius: '16px' }}>
                                    <div className="flex-shrink-0 me-4" style={{ 
                                        width: '60px', height: '60px', borderRadius: '12px', 
                                        background: `rgba(255,255,255,0.05)`, border: `1px solid ${hub.color}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: hub.color, fontSize: '1.5rem'
                                    }}>
                                        <i className={`fas ${hub.icon}`}></i>
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="mb-0">{hub.title}</h5>
                                            <span className="badge bg-secondary rounded-pill"><i className="fas fa-users me-1"></i> {hub.members}</span>
                                        </div>
                                        <p className="text-muted mb-3" style={{ fontSize: '0.95rem' }}>{hub.description}</p>
                                        <a href="#" className="text-decoration-none" style={{ color: hub.color, fontWeight: '600', fontSize: '0.9rem' }}>
                                            Join Discussion <i className="fas fa-arrow-right ms-1 fs-6 align-middle"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Mentors */}
            <section className="bg-primary-dark" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
                <div className="container">
                    <div className="row align-items-center mb-5">
                        <div className="col-lg-8" data-aos="fade-right">
                            <span className="section-subtitle">Expert Guidance</span>
                            <h2 className="section-title mb-3">Meet Our Top Mentors</h2>
                            <p className="lead text-muted">Get direct feedback and career advice from industry professionals who have been in your shoes.</p>
                        </div>
                        <div className="col-lg-4 text-lg-end mt-4 mt-lg-0" data-aos="fade-left">
                            <a href="#" className="btn btn-outline-light">View All Mentors</a>
                        </div>
                    </div>

                    <div className="row g-4 justify-content-center">
                        {mentors.map((mentor, index) => (
                            <div className="col-sm-6 col-lg-3 text-center" key={index} data-aos="zoom-in" data-aos-delay={index * 100}>
                                <div className="glass-card p-4 d-flex flex-column align-items-center" style={{ borderRadius: '20px' }}>
                                    <img src={mentor.image} alt={mentor.name} className="rounded-circle mb-3 border border-secondary" style={{ width: '100px', height: '100px', objectFit: 'cover', padding: '3px' }} />
                                    <h5 className="mb-1">{mentor.name}</h5>
                                    <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>{mentor.role}</p>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-outline-light rounded-circle" style={{ width: '35px', height: '35px', padding: 0 }}><i className="fab fa-linkedin-in"></i></button>
                                        <button className="btn btn-sm btn-outline-light rounded-circle" style={{ width: '35px', height: '35px', padding: 0 }}><i className="fab fa-github"></i></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="cta-section text-center py-5" style={{ background: 'linear-gradient(135deg, rgba(10, 17, 40, 0.95), rgba(0, 31, 84, 0.85))' }}>
                <div className="container py-4">
                    <h2 className="mb-4" data-aos="fade-up">Ready to level up your network?</h2>
                    <p className="lead text-muted mb-5 mx-auto" data-aos="fade-up" data-aos-delay="100" style={{ maxWidth: '600px' }}>
                        Don't build your career in isolation. Join thousands of developers who are learning, building, and succeeding together.
                    </p>
                    <div data-aos="fade-up" data-aos-delay="200">
                        <Link to="/signup" className="btn btn-gradient btn-lg text-white px-5 rounded-pill shadow-lg">Join the Community Free</Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Community;
