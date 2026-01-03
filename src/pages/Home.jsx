import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';

const Home = () => {
    useEffect(() => {
        // Re-initialize AOS on mount
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true, offset: 100 });
        AOS.refresh();

        let typingTimeoutId;
        let counterIntervals = [];

        // Typing animation
        const typedTextElement = document.querySelector('.typed-text');
        const cursorElement = document.querySelector('.cursor');

        if (typedTextElement && cursorElement) {
            const phrases = ["Future.", "Innovation.", "Your Career.", "Success."];
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
                    counterElement.textContent = Math.floor(start / 1000).toLocaleString() + 'K+';
                } else {
                    counterElement.textContent = Math.floor(start / 1000).toLocaleString() + 'K';
                }
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
                            <Link to="/signup" className="btn btn-gradient text-white">Start Your Journey</Link>
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
                                <span>Global Collaboration Network</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured In / Partners Section */}
            <section className="featured-section">
                <div className="container">
                    <h5 data-aos="fade-up" className="text-center">Trusted By Leading Innovators & Educators</h5>
                    <div className="partner-logos" data-aos="fade-up" data-aos-delay="100">
                        <div className="partner-logo"><img src="/icon.png" alt="pccharm" style={{ height: '40px' }} /></div>
                        <div className="partner-logo"><img src="/scda.png" alt="SCDA" style={{ height: '40px' }} /></div>
                        <div className="partner-logo"><img src="https://via.placeholder.com/150x45/ffffff/a8b2d1?text=Partner+3" alt="Partner Logo 3" /></div>
                        <div className="partner-logo"><img src="https://via.placeholder.com/150x45/ffffff/a8b2d1?text=Partner+4" alt="Partner Logo 4" /></div>
                        <div className="partner-logo"><img src="https://via.placeholder.com/150x45/ffffff/a8b2d1?text=Partner+5" alt="Partner Logo 5" /></div>
                    </div>
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
                        <div className="col-md-6 col-lg-4 d-flex" data-aos="fade-up" data-aos-delay="300">
                            <div className="glass-card ecosystem-card w-100">
                                <div className="icon-circle"><i className="fas fa-graduation-cap"></i></div>
                                <div>
                                    <h5>PcCharm Academy</h5>
                                    <p>Future-proof your skills with cutting-edge courses in AI, Cybersecurity, Development, and more.</p>
                                </div>
                                <Link to="/academy">Explore Courses <i className="fas fa-arrow-right" aria-hidden="true"></i></Link>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4 d-flex" data-aos="fade-up" data-aos-delay="400">
                            <div className="glass-card ecosystem-card w-100">
                                <div className="icon-circle"><i className="fas fa-brain"></i></div>
                                <div>
                                    <h5>PcCharm AI Forge</h5>
                                    <p>Develop, train, and deploy AI models using our powerful tools, datasets, and cloud infrastructure.</p>
                                </div>
                                <a href="#">Enter the Forge <i className="fas fa-arrow-right" aria-hidden="true"></i></a>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4 d-flex" data-aos="fade-up" data-aos-delay="500">
                            <div className="glass-card ecosystem-card w-100">
                                <div className="icon-circle"><i className="fas fa-shield-alt"></i></div>
                                <div>
                                    <h5>PcCharm SecLab</h5>
                                    <p>Hone your cybersecurity skills in hyper-realistic simulated environments and capture-the-flag challenges.</p>
                                </div>
                                <a href="#">Access SecLab <i className="fas fa-arrow-right" aria-hidden="true"></i></a>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4 d-flex" data-aos="fade-up" data-aos-delay="600">
                            <div className="glass-card ecosystem-card w-100">
                                <div className="icon-circle"><i className="fas fa-users"></i></div>
                                <div>
                                    <h5>PcCharm Connect</h5>
                                    <p>Collaborate on projects, find mentors, join special interest groups, and network globally.</p>
                                </div>
                                <a href="#">Join the Network <i className="fas fa-arrow-right" aria-hidden="true"></i></a>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4 d-flex" data-aos="fade-up" data-aos-delay="700">
                            <div className="glass-card ecosystem-card w-100">
                                <div className="icon-circle"><i className="fas fa-briefcase"></i></div>
                                <div>
                                    <h5>PcCharm Pro Services</h5>
                                    <p>Leverage our expert talent and platform capabilities for your enterprise projects and solutions.</p>
                                </div>
                                <a href="#">Enterprise Solutions <i className="fas fa-arrow-right" aria-hidden="true"></i></a>
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

            {/* Impact / Results Section */}
            <section id="impact" className="impact-section">
                <div className="container">
                    <div className="row justify-content-center text-center mb-5">
                        <div className="col-lg-8">
                            <span className="section-subtitle" data-aos="fade-up">Measurable Outcomes</span>
                            <h2 className="section-title" data-aos="fade-up" data-aos-delay="100">Driving Tangible Results</h2>
                            <p className="lead" data-aos="fade-up" data-aos-delay="200">We're committed to the success of our members and partners, demonstrated by real-world achievements.</p>
                        </div>
                    </div>
                    <div className="row text-center gy-4">
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                            <div className="stat-item">
                                <span className="stat-number counter-k" data-count="10">0K+</span>
                                <span className="stat-label d-block">Successful Learners</span>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
                            <div className="stat-item">
                                <span className="stat-number counter" data-count="92" data-suffix="%">0%</span>
                                <span className="stat-label d-block">Job Placement Rate</span>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="500">
                            <div className="stat-item">
                                <span className="stat-number counter" data-count="500" data-suffix-after="true">0</span>
                                <span className="stat-label d-block">Projects Launched</span>
                            </div>
                        </div>
                    </div>
                    <div className="case-study-highlight text-center" data-aos="fade-up" data-aos-delay="600">
                        <h5>Featured Success: Project Phoenix</h5>
                        <p className="mt-3">PcCharm Academy graduates collaborated via Connect to build an AI-powered threat detection system, now being piloted by our industry partners.</p>
                        <a href="#" className="btn btn-sm btn-outline-light mt-2">Read Case Study</a>
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
                    <h2 className="mb-4 section-title" data-aos="fade-up" data-aos-delay="100">Join a Thriving Community of Innovators</h2>
                    <p className="mb-4 lead" data-aos="fade-up" data-aos-delay="200">Connect, collaborate, learn, and grow with thousands of peers, mentors, and industry experts worldwide.</p>
                    <div className="community-count" id="communityCount" data-aos="fade-up" data-aos-delay="300">0</div>
                    <p className="mb-5" data-aos="fade-up" data-aos-delay="400">Members Across 37+ Countries & Growing!</p>
                    <div className="avatar-grid" data-aos="fade-up" data-aos-delay="500">
                        <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 1" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 2" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 3" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 4" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 5" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 6" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c7da?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 7" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 8" className="community-avatar" />
                    </div>
                    <div className="mt-5" data-aos="fade-up" data-aos-delay="600">
                        <a href="#" className="btn btn-gradient text-white">Explore Community Hub</a>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials-section bg-darker">
                <div className="container">
                    <div className="row justify-content-center text-center mb-5">
                        <div className="col-lg-8">
                            <span className="section-subtitle" data-aos="fade-up">Success Stories</span>
                            <h2 className="section-title" data-aos="fade-up" data-aos-delay="100">Hear From Our Members</h2>
                        </div>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-4 col-md-6 d-flex" data-aos="fade-up" data-aos-delay="200">
                            <div className="glass-card testimonial-card w-100">
                                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100&q=80" alt="Jane Doe" className="testimonial-avatar" />
                                <div className="testimonial-text">
                                    <p>"PcCharm didn't just teach me code; it taught me how to think like an engineer. The integrated labs and community projects were invaluable."</p>
                                </div>
                                <div className="testimonial-author">Jane Doe</div>
                                <div className="testimonial-role">Software Engineer @ TechCorp</div>
                                <div className="testimonial-rating">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 d-flex" data-aos="fade-up" data-aos-delay="300">
                            <div className="glass-card testimonial-card w-100">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" alt="John Smith" className="testimonial-avatar" />
                                <div className="testimonial-text">
                                    <p>"The SecLab simulations are incredibly realistic. I landed my dream cybersecurity job thanks to the hands-on skills I gained here."</p>
                                </div>
                                <div className="testimonial-author">John Smith</div>
                                <div className="testimonial-role">Cybersecurity Analyst</div>
                                <div className="testimonial-rating">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 d-flex" data-aos="fade-up" data-aos-delay="400">
                            <div className="glass-card testimonial-card w-100">
                                <img src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=100&h=100&q=80" alt="Alex Lee" className="testimonial-avatar" />
                                <div className="testimonial-text">
                                    <p>"AI Forge provided the tools and structure I needed to take my AI concepts from idea to deployed model. The mentorship was outstanding."</p>
                                </div>
                                <div className="testimonial-author">Alex Lee</div>
                                <div className="testimonial-role">Founder, AI Startup</div>
                                <div className="testimonial-rating">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
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
