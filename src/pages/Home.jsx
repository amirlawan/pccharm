import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';

const Home = () => {
    useEffect(() => {
        // Re-initialize AOS on mount
        AOS.refresh();

        // Typing animation
        const typedTextElement = document.querySelector('.typed-text');
        if (typedTextElement) {
            const phrases = ["Future.", "Innovation.", "Career.", "Success."];
            let currentPhraseIndex = 0;
            let currentLetterIndex = 0;
            let isDeleting = false;
            let typingSpeed = 100;

            const type = () => {
                const currentText = phrases[currentPhraseIndex];
                let displayedText = '';

                if (isDeleting) {
                    displayedText = currentText.substring(0, currentLetterIndex - 1);
                    currentLetterIndex--;
                    typingSpeed = 50;
                } else {
                    displayedText = currentText.substring(0, currentLetterIndex + 1);
                    currentLetterIndex++;
                    typingSpeed = 100;
                }

                if (typedTextElement) typedTextElement.textContent = displayedText;

                if (!isDeleting && currentLetterIndex === currentText.length) {
                    isDeleting = true;
                    typingSpeed = 1800;
                } else if (isDeleting && currentLetterIndex === 0) {
                    isDeleting = false;
                    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                    typingSpeed = 500;
                }
                setTimeout(type, typingSpeed);
            };
            setTimeout(type, 1000);
        }
    }, []);

    return (
        <main>
            {/* Hero Section */}
            <section id="home" className="hero">
                <div className="container">
                    <div className="hero-content" data-aos="fade-up">
                        <h1 className="mb-3">
                            Engineer the <span className="typed-text"></span><span className="cursor">&nbsp;</span><br />
                            With <img src="/icon.png" alt="PcCharm" style={{ width: '50px', height: '50px', verticalAlign: 'middle', marginRight: '10px' }} />PcCharm™
                        </h1>
                        <p className="lead mb-4">
                            The integrated platform transforming potential into proven tech innovators through
                            AI-powered learning, real-world projects, and a global ecosystem.
                        </p>
                        <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-md-start">
                            <Link to="/signup" className="btn btn-gradient">Start Your Journey</Link>
                            <a href="#solutions" className="btn btn-outline-light">Explore Solutions</a>
                        </div>
                        <div className="brand-pillars mt-5">
                            <div className="pillar" data-aos="fade-up" data-aos-delay="300">
                                <i className="fas fa-brain"></i>
                                <span>AI-Driven Personalization</span>
                            </div>
                            <div className="pillar" data-aos="fade-up" data-aos-delay="400">
                                <i className="fas fa-shield-alt"></i>
                                <span>Cybersecurity Excellence</span>
                            </div>
                            <div className="pillar" data-aos="fade-up" data-aos-delay="500">
                                <i className="fas fa-globe"></i>
                                <span>Global Tech Ecosystem</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why PcCharm Section */}
            <section id="why-pccharm" className="bg-darker">
                <div className="container">
                    <div className="text-center section-title" data-aos="fade-up">
                        <span className="section-subtitle">Why PcCharm</span>
                        <h2>The Competitive Edge You Need</h2>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-4" data-aos="fade-up">
                            <div className="why-item">
                                <div className="icon-circle">
                                    <i className="fas fa-project-diagram"></i>
                                </div>
                                <h5>Real-World Projects</h5>
                                <p>Move beyond theory. Build scalable applications that solve actual industry problems.</p>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
                            <div className="why-item">
                                <div className="icon-circle">
                                    <i className="fas fa-chalkboard-teacher"></i>
                                </div>
                                <h5>Expert Mentorship</h5>
                                <p>Learn directly from senior engineers and tech leaders who have built the systems you use daily.</p>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
                            <div className="why-item">
                                <div className="icon-circle">
                                    <i className="fas fa-users"></i>
                                </div>
                                <h5>Vibrant Community</h5>
                                <p>Join thousands of learners, innovators, and alumni helping each other succeed.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="cta" className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="mb-4" data-aos="fade-up">Ready to Launch Your Tech Career?</h2>
                        <p className="mb-4 lead" data-aos="fade-up" data-aos-delay="100">
                            Join the next generation of tech leaders. Start learning today.
                        </p>
                        <Link to="/signup" className="btn btn-gradient cta-btn" data-aos="fade-up" data-aos-delay="200">
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
