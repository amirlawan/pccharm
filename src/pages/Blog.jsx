import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import { supabase } from '../lib/supabaseClient';

const Blog = () => {
    const [nlEmail, setNlEmail] = useState('');
    const [nlLoading, setNlLoading] = useState(false);
    const [nlSubmitted, setNlSubmitted] = useState(false);
    const [nlError, setNlError] = useState('');

    useEffect(() => {
        AOS.refresh();
        
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!nlEmail.trim()) return;
        setNlLoading(true);
        setNlError('');

        try {
            const { error } = await supabase
                .from('course_waitlist')
                .insert([{ email: nlEmail.trim(), course_id: 'blog_newsletter' }]);

            if (error) throw error;
            setNlSubmitted(true);
            setNlEmail('');
        } catch (err) {
            setNlError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setNlLoading(false);
        }
    };

    const blogPosts = [
        {
            id: 1,
            title: "The Future of AI in Cybersecurity",
            excerpt: "Explore how machine learning models are revolutionizing threat detection and zero-day vulnerability patching.",
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
            category: "Cybersecurity",
            date: "May 12, 2026",
            readTime: "5 min read"
        },
        {
            id: 2,
            title: "Mastering React Server Components",
            excerpt: "A deep dive into the paradigm shift of rendering React components on the server for ultimate performance.",
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80",
            category: "Development",
            date: "May 8, 2026",
            readTime: "8 min read"
        },
        {
            id: 3,
            title: "Building Scalable Cloud Architectures",
            excerpt: "Best practices for designing distributed systems that can handle millions of concurrent users.",
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
            category: "Cloud",
            date: "May 5, 2026",
            readTime: "6 min read"
        },
        {
            id: 4,
            title: "Ethical Hacking: A Beginner's Guide",
            excerpt: "Start your journey into penetration testing and offensive security with our comprehensive roadmap.",
            image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
            category: "Security",
            date: "May 1, 2026",
            readTime: "10 min read"
        },
        {
            id: 5,
            title: "Data Structures You Need to Know",
            excerpt: "Ace your technical interviews by mastering these 5 fundamental data structures.",
            image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80",
            category: "Algorithms",
            date: "Apr 28, 2026",
            readTime: "7 min read"
        },
        {
            id: 6,
            title: "UX/UI Design Principles for Developers",
            excerpt: "How to bridge the gap between code and design to build truly exceptional user interfaces.",
            image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80",
            category: "Design",
            date: "Apr 20, 2026",
            readTime: "6 min read"
        }
    ];

    return (
        <main>
            <Helmet>
                <title>Blog - PcCharm™ Insights</title>
                <meta name="description" content="Stay updated with the latest trends in AI, Cybersecurity, and Software Development." />
            </Helmet>

            {/* Hero Section */}
            <section className="hero" style={{ minHeight: '60vh', paddingBottom: '20px' }}>
                <div className="container">
                    <div className="hero-content text-center mx-auto" data-aos="fade-up" style={{ maxWidth: '800px' }}>
                        <span className="section-subtitle">Insights & Innovation</span>
                        <h1 className="mb-4">The PcCharm Blog</h1>
                        <p className="lead mb-5">
                            Deep dives, tutorials, and industry insights from our experts and community leaders.
                        </p>
                        <div className="search-bar-wrapper" style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
                            <input 
                                type="text" 
                                className="form-control form-control-lg bg-dark text-light border-secondary" 
                                placeholder="Search articles..." 
                                style={{ borderRadius: '50px', paddingLeft: '20px', paddingRight: '50px' }}
                            />
                            <i className="fas fa-search" style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--teal-accent)' }}></i>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Post */}
            <section className="bg-primary-dark" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12" data-aos="fade-up">
                            <div className="glass-card p-0 overflow-hidden" style={{ borderRadius: '24px' }}>
                                <div className="row g-0">
                                    <div className="col-lg-6">
                                        <div style={{ height: '100%', minHeight: '350px', background: 'url(https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80) center/cover' }}></div>
                                    </div>
                                    <div className="col-lg-6 d-flex align-items-center">
                                        <div className="p-4 p-md-5">
                                            <span className="badge bg-primary mb-3" style={{ fontSize: '0.8rem', padding: '0.5em 1em' }}>Featured</span>
                                            <h2 className="mb-3">The Rise of Generative AI in Code Automation</h2>
                                            <p className="mb-4 text-muted">
                                                Discover how generative models are not just writing boilerplates, but fundamentally changing how we architect and build software systems from the ground up.
                                            </p>
                                            <div className="d-flex align-items-center mb-4">
                                                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=50&h=50&q=80" alt="Author" className="rounded-circle me-3" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                                <div>
                                                    <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Alex Chen</div>
                                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>May 15, 2026 · 12 min read</div>
                                                </div>
                                            </div>
                                            <Link to="#" className="btn btn-gradient text-white btn-sm px-4">Read Article</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Posts Grid */}
            <section className="bg-primary-dark" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center mb-5" data-aos="fade-up">
                        <h3 className="mb-0">Latest Articles</h3>
                        <div className="dropdown">
                            <button className="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                Filter by Category
                            </button>
                            <ul className="dropdown-menu dropdown-menu-dark">
                                <li><a className="dropdown-item" href="#">All</a></li>
                                <li><a className="dropdown-item" href="#">Cybersecurity</a></li>
                                <li><a className="dropdown-item" href="#">Development</a></li>
                                <li><a className="dropdown-item" href="#">AI & Data</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="row g-4">
                        {blogPosts.map((post, index) => (
                            <div className="col-md-6 col-lg-4" key={post.id} data-aos="fade-up" data-aos-delay={index * 100}>
                                <div className="glass-card h-100 p-0 d-flex flex-column" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                    <div style={{ height: '200px', background: `url(${post.image}) center/cover` }}></div>
                                    <div className="p-4 d-flex flex-column flex-grow-1">
                                        <div className="mb-2">
                                            <span className="badge border border-secondary text-light mb-2">{post.category}</span>
                                        </div>
                                        <h5 className="mb-3">{post.title}</h5>
                                        <p className="text-muted flex-grow-1" style={{ fontSize: '0.95rem' }}>{post.excerpt}</p>
                                        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary">
                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{post.date}</span>
                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}><i className="far fa-clock me-1"></i>{post.readTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="text-center mt-5" data-aos="fade-up">
                        <button className="btn btn-outline-light px-5">Load More Articles</button>
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="cta-section py-5">
                <div className="container text-center">
                    <div className="glass-card p-5" data-aos="zoom-in" style={{ maxWidth: '800px', margin: '0 auto', borderRadius: '24px' }}>
                        <h3 className="mb-3">Never Miss an Update</h3>
                        <p className="text-muted mb-4">Get the latest articles, tutorials, and industry news delivered straight to your inbox.</p>
                        {nlSubmitted ? (
                            <div className="d-flex align-items-center justify-content-center gap-2" style={{ color: '#4ade80' }}>
                                <i className="fas fa-check-circle"></i>
                                <span>You're subscribed! Stay tuned for updates.</span>
                            </div>
                        ) : (
                            <form className="d-flex flex-column flex-md-row gap-3 justify-content-center" onSubmit={handleNewsletterSubmit}>
                                <input 
                                    type="email" 
                                    className="form-control bg-dark text-light border-secondary" 
                                    placeholder="Enter your email address" 
                                    style={{ maxWidth: '300px' }} 
                                    value={nlEmail}
                                    onChange={(e) => setNlEmail(e.target.value)}
                                    required 
                                    disabled={nlLoading}
                                />
                                <button type="submit" className="btn btn-gradient text-white px-4" disabled={nlLoading}>
                                    {nlLoading ? 'Subscribing...' : 'Subscribe Now'}
                                </button>
                                {nlError && <p className="text-danger small mt-2 w-100">{nlError}</p>}
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Blog;
