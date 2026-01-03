import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { enrollUser, getUserEnrollments } from '../lib/enrollmentService';
import AOS from 'aos';
import CourseCard from '../components/CourseCard';
// import { coursesData } from '../data/courses'; // Using DB data now ideally, but keeping import if fallback needed

const Academy = () => {
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('asc');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        AOS.refresh();

        const initData = async () => {
            // 1. Get Current User
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // 2. Fetch Courses
            let fetchedCourses = [];
            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('*');

            if (!coursesError && coursesData) {
                fetchedCourses = coursesData;
            } else {
                // Fallback to static if DB empty or error (optional)
                console.log("Using static data fallback");
                fetchedCourses = (await import('../data/courses')).coursesData;
            }
            setCourses(fetchedCourses);

            // 3. Fetch Enrollments if user logged in
            if (user) {
                const { data: enrollmentIds } = await getUserEnrollments(user.id);
                setEnrolledCourseIds(enrollmentIds);
            }

            setLoading(false);
        };

        initData();
    }, []);

    const handleEnroll = async (courseId) => {
        if (!user) {
            // Redirect to login if not authenticated
            navigate('/login');
            return;
        }

        const { error } = await enrollUser(courseId, user.id);
        if (error) {
            console.error('Enrollment failed:', error.message);
            alert('Failed to enroll. Please try again.');
        } else {
            // Update local state to reflect enrollment immediately
            setEnrolledCourseIds(prev => [...prev, courseId]);
            // Optional: Redirect to dashboard or show success message
            // navigate('/dashboard');
        }
    };

    // Filter and Sort Logic
    const filteredCourses = useMemo(() => {
        let result = courses;

        if (categoryFilter !== 'all') {
            result = result.filter(course => course.category === categoryFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(course =>
                course.title.toLowerCase().includes(query) ||
                (course.description && course.description.toLowerCase().includes(query))
            );
        }

        result = [...result].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });

        return result;
    }, [courses, searchQuery, categoryFilter, sortOrder]);

    // Grouping Helpers (if we want to keep grouped view)
    const isGroupedView = categoryFilter === 'all' && !searchQuery;
    const categories = [...new Set(courses.map(c => c.category))];

    // Helper to map category codes to labels (can be moved to a util)
    const getCategoryLabel = (catCode) => {
        const found = courses.find(c => c.category === catCode);
        return found ? found.category_label || found.categoryLabel : catCode;
    };

    const categoryIcons = {
        'web-development': 'fas fa-code',
        'data-management': 'fas fa-database',
        'os-networking': 'fas fa-server',
        'cybersecurity': 'fas fa-shield-alt',
        'emerging-specialized': 'fas fa-rocket',
        'other-upcoming': 'fas fa-book-open'
    };

    return (
        <main>
            {/* Hero Section */}
            <section id="home" className="hero">
                <div className="container">
                    <div className="hero-content" data-aos="fade-up">
                        <h1>
                            PcCharm™ <span style={{ opacity: 0.7, fontWeight: 400 }}>Academy</span>
                        </h1>
                        <p>Master in-demand tech skills through hands-on projects, expert mentorship, and a vibrant community.</p>
                        <div className="d-flex flex-wrap gap-3">
                            <a href="#course-catalog" className="btn btn-gradient">Browse Courses</a>
                            <Link to="#cta" className="btn btn-outline-light">Request Information</Link>
                        </div>
                        <div className="brand-pillars">
                            <div className="pillar" data-aos="fade-up" data-aos-delay="300">
                                <i className="fas fa-laptop-code"></i>
                                <span>Project-Based Learning</span>
                            </div>
                            <div className="pillar" data-aos="fade-up" data-aos-delay="400">
                                <i className="fas fa-user-tie"></i>
                                <span>Career-Focused Curriculum</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course Catalog */}
            <section id="course-catalog">
                <div className="container">
                    <h2 className="text-center mb-4" data-aos="fade-up">Course Catalog</h2>

                    {loading ? (
                        <div className="text-center"><div className="loader"></div></div>
                    ) : (
                        <>
                            {/* Catalog Controls */}
                            <div id="course-catalog-controls" className="row g-3 align-items-center mb-5" data-aos="fade-up" data-aos-delay="100">
                                <div className="col-lg-5 col-md-12">
                                    <input
                                        type="search"
                                        className="form-control form-control-sm"
                                        placeholder="Search courses..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="col-lg-3 col-md-5">
                                    <select
                                        className="form-select form-select-sm"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-lg-4 col-md-7 text-md-end sort-buttons">
                                    <span className="me-2 d-none d-md-inline-block"><small>Sort by:</small></span>
                                    <button
                                        className={`btn btn-sm btn-outline-light ${sortOrder === 'asc' ? 'active' : ''}`}
                                        onClick={() => setSortOrder('asc')}
                                    >
                                        A-Z
                                    </button>
                                    <button
                                        className={`btn btn-sm btn-outline-light ${sortOrder === 'desc' ? 'active' : ''}`}
                                        onClick={() => setSortOrder('desc')}
                                    >
                                        Z-A
                                    </button>
                                </div>
                            </div>

                            {/* No Results Message */}
                            {filteredCourses.length === 0 && (
                                <div className="text-center py-5" data-aos="fade-up">
                                    <p className="lead" style={{ color: 'var(--yellow-accent)' }}>No courses match your current search or filter criteria.</p>
                                </div>
                            )}

                            {/* Course Card Grid */}
                            <div id="courseCardContainer">
                                {isGroupedView ? (
                                    categories.map(category => {
                                        const categoryCourses = filteredCourses.filter(c => c.category === category);
                                        if (categoryCourses.length === 0) return null;

                                        return (
                                            <div key={category} className="category-group mb-5">
                                                <h3 className="mb-4 category-title" data-aos="fade-up">
                                                    <i className={`${categoryIcons[category] || 'fas fa-folder'} fa-fw`}></i> {getCategoryLabel(category)}
                                                </h3>
                                                <div className="row g-4">
                                                    {categoryCourses.map((course, index) => (
                                                        <CourseCard
                                                            key={course.id}
                                                            course={course}
                                                            index={index}
                                                            isEnrolled={enrolledCourseIds.includes(course.id)}
                                                            onEnroll={handleEnroll}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="row g-4">
                                        {filteredCourses.map((course, index) => (
                                            <CourseCard
                                                key={course.id}
                                                course={course}
                                                index={index}
                                                isEnrolled={enrolledCourseIds.includes(course.id)}
                                                onEnroll={handleEnroll}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </section>


            {/* Academy Stats Section */}
            <section id="academy-stats" className="stats-section">
                <div className="container text-center py-4">
                    <h2 className="mb-4" data-aos="fade-up">Learn, Build, Succeed</h2>
                    <p className="mb-5 lead" data-aos="fade-up" data-aos-delay="100">Our immersive programs are designed to transform beginners into job-ready tech professionals. See our impact.</p>
                    <div className="d-flex flex-wrap justify-content-center align-items-stretch">
                        <div className="glass-card stat-glass" data-aos="fade-up">
                            <div className="h2 fw-bold counter">20+</div>
                            <div className="small">Courses Offered</div>
                        </div>
                        <div className="glass-card stat-glass" data-aos="fade-up" data-aos-delay="100">
                            <div className="h2 fw-bold counter-k">5K+</div>
                            <div className="small">Students Enrolled</div>
                        </div>
                        <div className="glass-card stat-glass" data-aos="fade-up" data-aos-delay="200">
                            <div className="h2 fw-bold counter">500+</div>
                            <div className="small">Projects Completed</div>
                        </div>
                        <div className="glass-card stat-glass" data-aos="fade-up" data-aos-delay="300">
                            <div className="h2 fw-bold counter">85%</div>
                            <div className="small">Placement Rate*</div>
                        </div>
                    </div>
                    <p className="text-muted mt-4 small" data-aos="fade-up" data-aos-delay="400">*Based on eligible graduates seeking employment within 6 months.</p>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="bg-opacity-10 py-5" style={{ backgroundColor: 'rgba(10, 17, 40, 0.3)' }}>
                <div className="container">
                    <h2 className="text-center mb-5" data-aos="fade-up">The PcCharm Academy Method</h2>
                    <div className="row g-4 justify-content-center">
                        <div className="col-md-6 col-lg-3" data-aos="fade-up">
                            <div className="feature-item">
                                <i className="fas fa-chalkboard-teacher feature-icon"></i>
                                <h5>Expert Mentorship</h5>
                                <p>Learn from industry veterans with real-world experience and get personalized guidance.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
                            <div className="feature-item">
                                <i className="fas fa-laptop-code feature-icon"></i>
                                <h5>Hands-On Projects</h5>
                                <p>Build a portfolio of impressive projects that showcase your skills to potential employers.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
                            <div className="feature-item">
                                <i className="fas fa-users feature-icon"></i>
                                <h5>Supportive Community</h5>
                                <p>Collaborate with peers, participate in coding challenges, and network with fellow learners.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
                            <div className="feature-item">
                                <i className="fas fa-briefcase feature-icon"></i>
                                <h5>Career Services</h5>
                                <p>Get help with resume building, interview preparation, and job placement assistance.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials">
                <div className="container">
                    <h2 className="text-center mb-5" data-aos="fade-up">What Our Students Say</h2>
                    <div className="row g-4">
                        <div className="col-lg-4 col-md-6 d-flex" data-aos="fade-up">
                            <div className="glass-card testimonial-card w-100">
                                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100&q=80" alt="Michael R." className="testimonial-avatar" />
                                <div className="testimonial-text">
                                    <p>"The project-based approach was key. I didn't just learn theory; I built real apps. PcCharm Academy gave me the confidence and skills to land my first developer job."</p>
                                </div>
                                <div className="testimonial-author">Michael R.</div>
                                <div className="testimonial-role">Web Developer Graduate</div>
                                <div className="testimonial-rating">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 d-flex" data-aos="fade-up" data-aos-delay="100">
                            <div className="glass-card testimonial-card w-100">
                                <img src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=100&h=100&q=80" alt="Sarah K." className="testimonial-avatar" />
                                <div className="testimonial-text">
                                    <p>"The mentors are incredibly knowledgeable and supportive. Anytime I got stuck, help was readily available. The community aspect also made learning fun."</p>
                                </div>
                                <div className="testimonial-author">Sarah K.</div>
                                <div className="testimonial-role">AI Student</div>
                                <div className="testimonial-rating">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 d-flex" data-aos="fade-up" data-aos-delay="200">
                            <div className="glass-card testimonial-card w-100">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" alt="David L." className="testimonial-avatar" />
                                <div className="testimonial-text">
                                    <p>"Coming from a non-tech background, I was nervous, but the curriculum was well-structured. The SecLab simulations were invaluable. Highly recommended!"</p>
                                </div>
                                <div className="testimonial-author">David L.</div>
                                <div className="testimonial-role">Cybersecurity Graduate</div>
                                <div className="testimonial-rating">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Section */}
            <section id="community" className="py-5">
                <div className="container text-center">
                    <h2 className="mb-4" data-aos="fade-up">Join Our Vibrant Student Community</h2>
                    <p className="mb-4 lead" data-aos="fade-up" data-aos-delay="100">Learn together, build together. Connect with peers, mentors, and alumni from around the world.</p>
                    <div className="community-count" data-aos="fade-up" data-aos-delay="200">5K+</div>
                    <p className="mb-5" data-aos="fade-up" data-aos-delay="300">Active learners & alumni!</p>
                    <div className="avatar-grid" data-aos="fade-up" data-aos-delay="400">
                        <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 1" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 2" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 3" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 4" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 5" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 6" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c7da?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 7" className="community-avatar" />
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 8" className="community-avatar" />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="cta" className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="mb-4" data-aos="fade-up">Ready to Launch Your Tech Career?</h2>
                        <p className="mb-4 lead" data-aos="fade-up" data-aos-delay="100">Don't wait to build the future you want. Explore our programs and take the first step towards becoming a tech professional.</p>
                        <a href="#course-catalog" className="btn btn-gradient cta-btn" data-aos="fade-up" data-aos-delay="200">Explore Courses & Enroll</a>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Academy;
