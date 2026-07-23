import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';

const Home = () => {
    useEffect(() => {
        // Only refresh AOS, do not re-init (already initialized globally in main.jsx or index.html)
        AOS.refresh();

        // Hash scroll: when navigating from another page with hash (e.g. /#ecosystem)
        const hash = window.location.hash;
        if (hash) {
            setTimeout(() => {
                const el = document.querySelector(hash);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }

        let typingTimeoutId;
        let counterIntervals = [];

        // Typing animation
        const typedTextElement = document.querySelector('.typed-text');
        const cursorElement = document.querySelector('.cursor');

        if (typedTextElement && cursorElement) {
            const phrases = ["the Future.", "Innovation.", "Your Career.", "Success."];
            let currentPhraseIndex = 0;
            let currentLetterIndex = 0;
            let isDeleting = false;

            const type = () => {
                let typingSpeed = 120;
                const currentText = phrases[currentPhraseIndex];
                let displayedText = '';

                if (isDeleting) {
                    displayedText = currentText.substring(0, currentLetterIndex - 1);
                    currentLetterIndex--;
                    typingSpeed = 60;
                } else {
                    displayedText = currentText.substring(0, currentLetterIndex + 1);
                    currentLetterIndex++;
                    typingSpeed = 120;
                }

                if (typedTextElement) typedTextElement.textContent = displayedText;
                if (cursorElement) cursorElement.style.display = 'inline-block';

                if (!isDeleting && currentLetterIndex === currentText.length) {
                    isDeleting = true;
                    typingSpeed = 2000;
                } else if (isDeleting && currentLetterIndex === 0) {
                    isDeleting = false;
                    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                    typingSpeed = 500;
                }
                typingTimeoutId = setTimeout(type, typingSpeed);
            };
            typingTimeoutId = setTimeout(type, 1000);
        }

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
                    counterElement.textContent = start + (counterElement.dataset.suffixAfter === 'true' ? '+' : suffix);
                } else {
                    counterElement.textContent = start + suffix;
                }
            }, stepTime);
            counterIntervals.push(timer);
        };

        const animateCounterK = (counterElement, targetK, duration = 2000) => {
            let start = 0;
            const target = targetK * 1000;
            const frameDuration = 16;
            const totalFrames = duration / frameDuration;
            const increment = Math.max(1, Math.floor(target / totalFrames));

            const timer = setInterval(() => {
                start += increment;
                if (start >= target) {
                    start = target;
                    clearInterval(timer);
                }
                const displayVal = Math.floor(start / 1000);
                counterElement.textContent = displayVal.toLocaleString() + 'K+';
            }, frameDuration);
            counterIntervals.push(timer);
        };

        const handleIntersection = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;

                    // Animate standard counters
                    const counters = element.querySelectorAll('.counter:not(.animated)');
                    counters.forEach(counter => {
                        const target = +counter.getAttribute('data-count');
                        const suffix = counter.getAttribute('data-suffix') || '';
                        animateCounter(counter, target, suffix);
                        counter.classList.add('animated');
                    });

                    // Animate 'K' counters
                    const countersK = element.querySelectorAll('.counter-k:not(.animated)');
                    countersK.forEach(counterK => {
                        const targetK = +counterK.getAttribute('data-count');
                        animateCounterK(counterK, targetK);
                        counterK.classList.add('animated');
                    });

                    // Animate community counter specifically if needed
                    const communityCount = element.querySelector('#communityCount:not(.animated)');
                    if (communityCount) {
                        const target = 10000;
                        let start = 0;
                        const duration = 2000;
                        const frameDuration = 16;
                        const totalFrames = duration / frameDuration;
                        const increment = Math.max(50, Math.floor(target / totalFrames));
                        const timer = setInterval(() => {
                            start += increment;
                            if (start >= target) {
                                start = target;
                                clearInterval(timer);
                            }
                            communityCount.textContent = start.toLocaleString() + '+';
                        }, frameDuration);
                        counterIntervals.push(timer);
                        communityCount.classList.add('animated');
                    }

                    observer.unobserve(element);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, { threshold: 0.3 });
        const sectionsToObserve = document.querySelectorAll('#impact, #community');
        sectionsToObserve.forEach(sec => observer.observe(sec));

        return () => {
            if (typingTimeoutId) clearTimeout(typingTimeoutId);
            counterIntervals.forEach(clearInterval);
            observer.disconnect();
        };
    }, []);

    return (
        <main>
            <Helmet>
                <title>PcCharm™ - Engineer the Future | AI & Tech Learning Platform</title>
                <meta name="description" content="Future-proof your skills with AI-powered courses in Cybersecurity, Web Development, Data Science, and more." />
                <link rel="canonical" href="https://pccharm.vercel.app/" />
            </Helmet>
            {/* Hero Section */}
            <section id="home" className="hero text-center">
                <div className="container">
                    <div className="hero-content mx-auto" data-aos="fade-up" style={{ maxWidth: '900px' }}>
                        <span className="section-subtitle mb-3" style={{ letterSpacing: '3px' }}>PcCharm Learning Platform</span>
                        <h1 className="mb-4">
                            Igniting Minds. Engineering <span className="typed-text"></span><span className="cursor">&nbsp;</span>
                        </h1>
                        <p className="lead mb-5 mx-auto" style={{ maxWidth: '750px', fontSize: '1.25rem' }}>
                            Transform your potential into proven expertise. Master AI, Cybersecurity, and Development through real-world projects on our integrated platform.
                        </p>
                        <div className="d-flex flex-wrap gap-4 justify-content-center mb-5">
                            <Link to="/signup" className="btn btn-gradient btn-lg text-white px-5 py-3 shadow-lg rounded-pill" style={{ fontSize: '1.1rem' }}>Start Your Journey</Link>
                            <a href="#solutions" className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill" style={{ fontSize: '1.1rem' }}>Explore Solutions</a>
                        </div>
                        <div className="brand-pillars justify-content-center mt-5 pt-4 border-top border-secondary opacity-75">
                            <div className="pillar" data-aos="fade-up" data-aos-delay="300">
                                <i className="fas fa-brain"></i>
                                <span>AI-Driven Personalization</span>
                            </div>
                            <div className="pillar mx-md-4" data-aos="fade-up" data-aos-delay="400">
                                <i className="fas fa-shield-alt"></i>
                                <span>Cybersecurity Excellence</span>
                            </div>
                            <div className="pillar" data-aos="fade-up" data-aos-delay="500">
                                <i className="fas fa-globe"></i>
                                <span>Global Network</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured In / Partners Section */}
            <section className="featured-section">
                <div className="container text-center">
                    <h5 data-aos="fade-up" className="text-center text-uppercase text-muted small tracking-wider mb-3" style={{ letterSpacing: '2px' }}>In Partnership With</h5>
                    <div className="partner-logos justify-content-center align-items-center gap-4" data-aos="fade-up" data-aos-delay="100">
                        <div className="partner-logo p-2 d-flex align-items-center gap-2">
                            <img src="/scda.png" alt="SCDA Partner" style={{ height: '45px', objectFit: 'contain' }} />
                        </div>
                    </div>
                    <p className="text-muted small mt-3 mb-0" data-aos="fade-up" data-aos-delay="200" style={{ fontSize: '0.85rem' }}>
                        Partnership inquiries: <a href="mailto:partners@pccharm.site" className="text-info text-decoration-none fw-semibold">partners@pccharm.site</a>
                    </p>
                </div>
            </section>

            {/* Why PcCharm Section */}
            <section id="why-pccharm" className="bg-primary-dark">
                <div className="container">
                    <div className="row justify-content-center text-center mb-5">
                        <div className="col-lg-8">
                            <span className="section-subtitle" data-aos="fade-up">The PcCharm Advantage</span>
                            <h2 className="section-title" data-aos="fade-up" data-aos-delay="100">Unlock Your Potential with Our Unique Approach</h2>
                            <p className="lead" data-aos="fade-up" data-aos-delay="200">We go beyond traditional learning by seamlessly integrating cutting-edge tools, expert guidance, and real-world application.</p>
                        </div>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3 d-flex" data-aos="fade-up" data-aos-delay="300">
                            <div className="why-item w-100">
                                <div className="icon-circle"><i className="fas fa-layer-group"></i></div>
                                <h5>Integrated Ecosystem</h5>
                                <p>One platform combining AI-powered learning, secure development labs, and a vibrant global community.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3 d-flex" data-aos="fade-up" data-aos-delay="400">
                            <div className="why-item w-100">
                                <div className="icon-circle"><i className="fas fa-rocket"></i></div>
                                <h5>Accelerated Learning Curve</h5>
                                <p>Master in-demand skills faster with personalized paths, AI tutors, and hands-on project sprints.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3 d-flex" data-aos="fade-up" data-aos-delay="500">
                            <div className="why-item w-100">
                                <div className="icon-circle"><i className="fas fa-briefcase"></i></div>
                                <h5>Industry-Ready Outcomes</h5>
                                <p>Build a portfolio of real-world projects, gain practical experience, and connect with hiring partners.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3 d-flex" data-aos="fade-up" data-aos-delay="600">
                            <div className="why-item w-100">
                                <div className="icon-circle"><i className="fas fa-infinity"></i></div>
                                <h5>Continuous Innovation</h5>
                                <p>Stay ahead with access to emerging technologies, research insights, and lifetime community support.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Approach Section */}
            <section className="approach-section bg-darker">
                <div className="container">
                    <div className="row justify-content-center text-center mb-5">
                        <div className="col-lg-8">
                            <span className="section-subtitle" data-aos="fade-up">Our Methodology</span>
                            <h2 className="section-title" data-aos="fade-up" data-aos-delay="100">How We Engineer Success</h2>
                            <p className="lead" data-aos="fade-up" data-aos-delay="200">Our structured, iterative process ensures you not only learn but also apply, collaborate, and innovate effectively.</p>
                        </div>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
                            <div className="approach-step h-100">
                                <i className="fas fa-chalkboard-teacher approach-icon"></i>
                                <h5>1. AI-Powered Learning</h5>
                                <p>Personalized curriculum, adaptive learning paths, and AI tutors provide foundational knowledge efficiently.</p>
                            </div>
                        </div>
                        <div className="col-lg-4" data-aos="fade-up" data-aos-delay="400">
                            <div className="approach-step h-100">
                                <i className="fas fa-flask approach-icon"></i>
                                <h5>2. Secure Lab Application</h5>
                                <p>Apply skills in realistic, secure sandbox environments (SecLab & AI Forge) with expert mentorship.</p>
                            </div>
                        </div>
                        <div className="col-lg-4" data-aos="fade-up" data-aos-delay="500">
                            <div className="approach-step h-100">
                                <i className="fas fa-project-diagram approach-icon"></i>
                                <h5>3. Collaborative Projects</h5>
                                <p>Work on real-world challenges individually or in teams, building portfolio pieces via PcCharm Connect.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ecosystem Section */}
            <section id="ecosystem" className="bg-primary-dark">
                <div className="container">
                    <div className="row justify-content-center text-center mb-5">
                        <div className="col-lg-8">
                            <span className="section-subtitle" data-aos="fade-up">The PcCharm Platform</span>
                            <h2 className="section-title" data-aos="fade-up" data-aos-delay="100">One Integrated Ecosystem for Growth</h2>
                            <p className="lead" data-aos="fade-up" data-aos-delay="200">Each component of PcCharm works synergistically to provide a comprehensive environment for learning, building, and connecting.</p>
                        </div>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {/* Active Pillars */}
                        <div className="col-md-6 col-lg-6 d-flex" data-aos="fade-up" data-aos-delay="300">
                            <div className="glass-card ecosystem-card w-100 border-teal">
                                <div className="icon-circle"><i className="fas fa-graduation-cap"></i></div>
                                <div>
                                    <h5>PcCharm Academy</h5>
                                    <p>Future-proof your skills with cutting-edge courses in AI, Cybersecurity, Development, and more.</p>
                                </div>
                                <Link to="/academy">Explore Courses <i className="fas fa-arrow-right" aria-hidden="true"></i></Link>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 d-flex" data-aos="fade-up" data-aos-delay="400">
                            <div className="glass-card ecosystem-card w-100 border-teal">
                                <div className="icon-circle"><i className="fas fa-users"></i></div>
                                <div>
                                    <h5>PcCharm Connect</h5>
                                    <p>Collaborate on projects, find mentors, join special interest groups, and network globally.</p>
                                </div>
                                <Link to="/connect">Join the Network <i className="fas fa-arrow-right" aria-hidden="true"></i></Link>
                            </div>
                        </div>

                        {/* Upcoming Pillars */}
                        <div className="col-md-6 col-lg-4 d-flex" data-aos="fade-up" data-aos-delay="500">
                            <div className="glass-card ecosystem-card w-100 position-relative">
                                <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3">Coming Soon</span>
                                <div className="icon-circle opacity-75"><i className="fas fa-brain"></i></div>
                                <div>
                                    <h5 className="opacity-75">PcCharm AI Forge</h5>
                                    <p className="opacity-75">Develop, train, and deploy AI models using our powerful tools, datasets, and cloud infrastructure.</p>
                                </div>
                                <Link to="/aiforge" className="text-muted">See the Vision <i className="fas fa-arrow-right" aria-hidden="true"></i></Link>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4 d-flex" data-aos="fade-up" data-aos-delay="600">
                            <div className="glass-card ecosystem-card w-100 position-relative">
                                <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3">Coming Soon</span>
                                <div className="icon-circle opacity-75"><i className="fas fa-shield-alt"></i></div>
                                <div>
                                    <h5 className="opacity-75">PcCharm SecLab</h5>
                                    <p className="opacity-75">Hone your cybersecurity skills in hyper-realistic simulated environments and capture-the-flag challenges.</p>
                                </div>
                                <Link to="/seclab" className="text-muted">See the Vision <i className="fas fa-arrow-right" aria-hidden="true"></i></Link>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4 d-flex" data-aos="fade-up" data-aos-delay="700">
                            <div className="glass-card ecosystem-card w-100 position-relative">
                                <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3">Coming Soon</span>
                                <div className="icon-circle opacity-75"><i className="fas fa-briefcase"></i></div>
                                <div>
                                    <h5 className="opacity-75">PcCharm Pro Services</h5>
                                    <p className="opacity-75">Leverage our expert talent and platform capabilities for your enterprise projects and solutions.</p>
                                </div>
                                <Link to="/proservices" className="text-muted">See the Vision <i className="fas fa-arrow-right" aria-hidden="true"></i></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solutions For Section */}
            <section id="solutions" className="solutions-section">
                <div className="container">
                    <div className="row justify-content-center text-center mb-5">
                        <div className="col-lg-8">
                            <span className="section-subtitle" data-aos="fade-up">Tailored Pathways</span>
                            <h2 className="section-title" data-aos="fade-up" data-aos-delay="100">Solutions Designed for Your Goals</h2>
                            <p className="lead" data-aos="fade-up" data-aos-delay="200">Whether you're an individual learner, an academic institution, or a growing enterprise, PcCharm has a solution to accelerate your success.</p>
                        </div>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-4 d-flex" data-aos="fade-up" data-aos-delay="300">
                            <div className="solution-card w-100">
                                <div className="icon-bg"><i className="fas fa-user-graduate"></i></div>
                                <h4>For Individuals</h4>
                                <p>Launch or advance your tech career with targeted skills, portfolio projects, and job placement support.</p>
                                <ul className="list-unstyled">
                                    <li><i className="fas fa-check text-teal me-2"></i>Personalized Learning Paths</li>
                                    <li><i className="fas fa-check text-teal me-2"></i>Real-World Project Portfolio</li>
                                    <li><i className="fas fa-check text-teal me-2"></i>Career Coaching & Network Access</li>
                                    <li><i className="fas fa-check text-teal me-2"></i>Certification Preparation</li>
                                </ul>
                                <Link to="/signup" className="learn-more">Start Learning <i className="fas fa-arrow-right ms-1"></i></Link>
                            </div>
                        </div>
                        <div className="col-lg-4 d-flex" data-aos="fade-up" data-aos-delay="400">
                            <div className="solution-card w-100">
                                <div className="icon-bg"><i className="fas fa-building"></i></div>
                                <h4>For Enterprises</h4>
                                <p>Upskill your workforce, source top talent, or leverage our Pro Services for custom tech solutions.</p>
                                <ul className="list-unstyled">
                                    <li><i className="fas fa-check text-teal me-2"></i>Customized Corporate Training</li>
                                    <li><i className="fas fa-check text-teal me-2"></i>Access to Vetted Talent Pool</li>
                                    <li><i className="fas fa-check text-teal me-2"></i>Project Outsourcing & Co-development</li>
                                    <li><i className="fas fa-check text-teal me-2"></i>Secure Platform for Internal R&D</li>
                                </ul>
                                <a href="#" className="learn-more">Business Solutions <i className="fas fa-arrow-right ms-1"></i></a>
                            </div>
                        </div>
                        <div className="col-lg-4 d-flex" data-aos="fade-up" data-aos-delay="500">
                            <div className="solution-card w-100">
                                <div className="icon-bg"><i className="fas fa-university"></i></div>
                                <h4>For Institutions</h4>
                                <p>Partner with PcCharm to integrate cutting-edge curriculum, labs, and career services into your programs.</p>
                                <ul className="list-unstyled">
                                    <li><i className="fas fa-check text-teal me-2"></i>Curriculum Licensing & Integration</li>
                                    <li><i className="fas fa-check text-teal me-2"></i>Virtual Lab Environments</li>
                                    <li><i className="fas fa-check text-teal me-2"></i>Faculty Training & Support</li>
                                    <li><i className="fas fa-check text-teal me-2"></i>Student Career Pathways</li>
                                </ul>
                                <a href="#" className="learn-more">Academic Partnerships <i className="fas fa-arrow-right ms-1"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact / Early Access Section */}
            <section id="impact" className="impact-section">
                <div className="container">
                    <div className="row justify-content-center text-center mb-5">
                        <div className="col-lg-8">
                            <span className="section-subtitle" data-aos="fade-up">Early Access</span>
                            <h2 className="section-title" data-aos="fade-up" data-aos-delay="100">Join Our Founding Cohort</h2>
                            <p className="lead" data-aos="fade-up" data-aos-delay="200">
                                Currently in early access — join the founding cohort shaping the future of practical tech education.
                            </p>
                        </div>
                    </div>
                    <div className="row text-center gy-4 justify-content-center">
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                            <div className="stat-item">
                                <span className="stat-number counter" data-count="25" data-suffix-after="true">0</span>
                                <span className="stat-label d-block">Interactive Courses & Tracks</span>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
                            <div className="stat-item">
                                <span className="stat-number counter" data-count="100" data-suffix="%">0%</span>
                                <span className="stat-label d-block">Hands-On Practical Learning</span>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="500">
                            <div className="stat-item">
                                <span className="stat-number text-teal">Early Access</span>
                                <span className="stat-label d-block">Founding Member Cohort</span>
                            </div>
                        </div>
                    </div>
                    <div className="case-study-highlight text-center mt-5" data-aos="fade-up" data-aos-delay="600">
                        <h5>Founding Vision</h5>
                        <p className="mt-3">We are actively refining our curriculum in Web Development, Cybersecurity, and AI with our initial cohort of early members.</p>
                        <Link to="/signup" className="btn btn-sm btn-gradient text-white mt-2">Join Founding Cohort</Link>
                    </div>
                </div>
            </section>

            {/* Technology & Innovation Section */}
            <section id="technology" className="bg-darker">
                <div className="container">
                    <div className="row justify-content-center text-center mb-5">
                        <div className="col-lg-8">
                            <span className="section-subtitle" data-aos="fade-up">Powered by Innovation</span>
                            <h2 className="section-title" data-aos="fade-up" data-aos-delay="100">Built on a Foundation of Cutting-Edge Tech</h2>
                            <p className="lead" data-aos="fade-up" data-aos-delay="200">Our platform leverages advanced technologies to deliver an unparalleled learning and development experience.</p>
                        </div>
                    </div>
                    <div className="row text-center gy-4">
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                            <div className="tech-item">
                                <i className="fas fa-robot tech-icon"></i>
                                <h5>Proprietary AI Engine</h5>
                                <p>Drives personalized learning, provides intelligent feedback, and powers our AI development tools.</p>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
                            <div className="tech-item">
                                <i className="fas fa-cloud tech-icon"></i>
                                <h5>Scalable Cloud Infrastructure</h5>
                                <p>Ensures seamless access to labs, resources, and collaborative tools from anywhere in the world.</p>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="500">
                            <div className="tech-item">
                                <i className="fas fa-lock tech-icon"></i>
                                <h5>Zero-Trust Security</h5>
                                <p>Protects user data and provides secure environments for sensitive cybersecurity training and R&D.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Section */}
            <section id="community" className="bg-primary-dark">
                <div className="container text-center">
                    <span className="section-subtitle" data-aos="fade-up">Global Network</span>
                    <h2 className="mb-4 section-title" data-aos="fade-up" data-aos-delay="100">Join the PcCharm Founding Cohort</h2>
                    <p className="mb-4 lead" data-aos="fade-up" data-aos-delay="200">Connect, collaborate, learn, and grow with early adopters, mentors, and fellow tech enthusiasts.</p>
                    <div className="community-count text-teal" data-aos="fade-up" data-aos-delay="300" style={{ fontSize: '2.5rem', fontWeight: 700 }}>Early Access</div>
                    <p className="mb-4" data-aos="fade-up" data-aos-delay="400">Be among the founding members shaping our upcoming AI Forge & SecLab features!</p>
                    <div className="mt-4" data-aos="fade-up" data-aos-delay="500">
                        <Link to="/connect" className="btn btn-gradient text-white">Join PcCharm Connect</Link>
                    </div>
                </div>
            </section>

            {/* Founder's Mission / Story Section */}
            <section id="mission" className="testimonials-section bg-darker">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="glass-card p-4 p-md-5 position-relative overflow-hidden" data-aos="fade-up" style={{ borderColor: 'rgba(0, 242, 254, 0.3)' }}>
                                <div className="position-absolute top-0 end-0 m-4 opacity-10 d-none d-md-block">
                                    <i className="fas fa-quote-right fa-7x text-info"></i>
                                </div>
                                <span className="section-subtitle text-uppercase text-info mb-2 d-block" style={{ letterSpacing: '2px' }}>Our Mission & Story</span>
                                <h2 className="section-title text-white mb-4">Why We Are Building PcCharm</h2>
                                
                                <div className="mission-content text-light lead fs-5 lh-lg mb-4">
                                    <p className="mb-3">
                                        "PcCharm was built because we saw the gap between theoretical education and real-world tech skills."
                                    </p>
                                    <p className="mb-3" style={{ fontSize: '1.05rem', color: '#a8b2d1' }}>
                                        We set out to create an integrated ecosystem where learners, developers, and cybersecurity enthusiasts don't just consume content — they build real projects, test skills in interactive sandboxes, and collaborate with a global network of peers.
                                    </p>
                                    <p className="mb-0" style={{ fontSize: '1.05rem', color: '#a8b2d1' }}>
                                        Currently in early access, we are working closely with our founding cohort to deliver a world-class tech learning experience.
                                    </p>
                                </div>

                                <div className="d-flex flex-wrap align-items-center justify-content-between pt-4 border-top border-secondary border-opacity-25 mt-4 gap-3">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-info bg-opacity-25 rounded-circle p-3 d-flex align-items-center justify-content-center me-3 border border-info border-opacity-50" style={{ width: '52px', height: '52px' }}>
                                            <i className="fas fa-user-shield fs-4 text-info"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold text-white fs-5">PcCharm Team</div>
                                            <div className="text-info small">Engineering & Platform Vision</div>
                                        </div>
                                    </div>
                                    <Link to="/signup" className="btn btn-outline-info rounded-pill px-4 py-2">
                                        Join Early Access <i className="fas fa-arrow-right ms-2"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="cta" className="cta-section">
                <div className="container">
                    <div className="cta-content text-center">
                        <h2 className="mb-4" data-aos="fade-up">Ready to Build the Future, Faster?</h2>
                        <p className="mb-4 lead" data-aos="fade-up" data-aos-delay="100">
                            Join the PcCharm ecosystem and gain the skills, tools, and network to drive innovation and accelerate your career or business.
                        </p>
                        <div className="d-flex flex-wrap gap-3 justify-content-center" data-aos="fade-up" data-aos-delay="200">
                            <Link to="/signup" className="btn btn-gradient text-white">Request Access</Link>
                            <a href="#solutions" className="btn btn-outline-light">View Solutions</a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
