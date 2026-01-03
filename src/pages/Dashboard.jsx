import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const getUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }
            setUser(user);

            // Check if admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            setIsAdmin(profile?.is_admin || false);

            // Fetch Enrollments with Course Details
            try {
                const { data, error } = await supabase
                    .from('enrollments')
                    .select(`
                        course_id,
                        progress,
                        completed_lessons,
                        courses (
                            id,
                            title,
                            description,
                            icon,
                            category
                        )
                    `)
                    .eq('user_id', user.id);

                if (error) {
                    console.error("Error fetching enrollments:", error);
                } else {
                    // Flatten structure
                    const formattedDetails = data.map(item => ({
                        ...item.courses,
                        progress: item.progress || 0,
                        completed_lessons: item.completed_lessons || [],
                        enrolled_at: item.enrolled_at
                    }));
                    setEnrolledCourses(formattedDetails);

                    // Count total lessons completed
                    const total = data.reduce((acc, item) => acc + (item.completed_lessons?.length || 0), 0);
                    setTotalLessonsCompleted(total);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        };

        getUserData();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const getProgressColor = (progress) => {
        if (progress >= 100) return 'bg-success';
        if (progress >= 50) return 'bg-info';
        if (progress >= 25) return 'bg-warning';
        return 'bg-secondary';
    };

    if (!user) return null;

    const completedCourses = enrolledCourses.filter(c => c.progress >= 100).length;

    return (
        <section className="hero" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px' }}>
            <div className="container">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-lg-3 mb-4">
                        <div className="glass-card p-4 h-100">
                            <div className="text-center mb-4">
                                <div style={{
                                    width: '100px', height: '100px', background: 'var(--gradient-1)',
                                    borderRadius: '50%', margin: '0 auto', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white'
                                }}>
                                    <i className="fas fa-user"></i>
                                </div>
                                <h4 className="mt-3">{user.user_metadata?.full_name || 'User'}</h4>
                                <p className="text-muted small">{user.email}</p>
                            </div>
                            <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                            <ul className="list-unstyled">
                                <li className="mb-3">
                                    <Link to="/dashboard" className="text-white text-decoration-none d-flex align-items-center">
                                        <i className="fas fa-columns me-3 text-info" style={{ width: '20px' }}></i> Dashboard
                                    </Link>
                                </li>
                                <li className="mb-3">
                                    <Link to="/academy" className="text-muted text-decoration-none d-flex align-items-center hover-text-white">
                                        <i className="fas fa-book me-3" style={{ width: '20px' }}></i> Course Catalog
                                    </Link>
                                </li>
                                <li className="mb-3">
                                    <button onClick={() => alert("Certificates feature coming soon!")} className="btn btn-link text-muted text-decoration-none d-flex align-items-center hover-text-white p-0 text-start">
                                        <i className="fas fa-certificate me-3" style={{ width: '20px' }}></i> Certificates
                                    </button>
                                </li>
                                {isAdmin && (
                                    <li className="mb-3">
                                        <Link to="/admin" className="text-warning text-decoration-none d-flex align-items-center">
                                            <i className="fas fa-tools me-3" style={{ width: '20px' }}></i> Admin Panel
                                        </Link>
                                    </li>
                                )}
                                <li className="mb-3">
                                    <button onClick={handleLogout} className="btn btn-link text-muted text-decoration-none d-flex align-items-center hover-text-white p-0">
                                        <i className="fas fa-sign-out-alt me-3" style={{ width: '20px' }}></i> Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-lg-9">
                        {/* Stats Row */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-4">
                                <div className="glass-card p-4 text-center d-flex flex-column justify-content-center align-items-center">
                                    <i className="fas fa-graduation-cap mb-2 text-info fs-3"></i>
                                    <h3 className="text-info m-0">{enrolledCourses.length}</h3>
                                    <p className="small text-muted mb-0">Active Courses</p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="glass-card p-4 text-center d-flex flex-column justify-content-center align-items-center">
                                    <i className="fas fa-check-circle mb-2 text-warning fs-3"></i>
                                    <h3 className="text-warning m-0">{totalLessonsCompleted}</h3>
                                    <p className="small text-muted mb-0">Lessons Completed</p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="glass-card p-4 text-center d-flex flex-column justify-content-center align-items-center">
                                    <i className="fas fa-award mb-2 text-success fs-3"></i>
                                    <h3 className="text-success m-0">{completedCourses}</h3>
                                    <p className="small text-muted mb-0">Courses Completed</p>
                                </div>
                            </div>
                        </div>

                        {/* My Progress / Active Courses */}
                        <div className="glass-card p-4 mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="mb-0">My Learning Progress</h4>
                                <Link to="/academy" className="btn btn-sm btn-outline-light">
                                    Browse All
                                </Link>
                            </div>

                            {loading ? (
                                <div className="text-center py-4"><div className="loader"></div></div>
                            ) : enrolledCourses.length > 0 ? (
                                <div className="row g-3">
                                    {enrolledCourses.map(course => (
                                        <div key={course.id} className="col-md-6">
                                            <div className="p-3 border border-secondary border-opacity-25 rounded bg-dark bg-opacity-25">
                                                <div className="d-flex align-items-center mb-3">
                                                    <i className={`${course.icon || 'fas fa-book'} fs-4 text-info me-3`}></i>
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-0">{course.title}</h6>
                                                        <small className="text-muted">{course.category}</small>
                                                    </div>
                                                    {course.progress >= 100 && (
                                                        <span className="badge bg-success">
                                                            <i className="fas fa-check"></i>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="flex-grow-1 me-3">
                                                        <div className="progress" style={{ height: '8px' }}>
                                                            <div
                                                                className={`progress-bar ${getProgressColor(course.progress)}`}
                                                                role="progressbar"
                                                                style={{ width: `${course.progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <small className="text-muted">{course.progress}% complete</small>
                                                    </div>
                                                    <Link to={`/learn/${course.id}`} className="btn btn-sm btn-gradient">
                                                        {course.progress >= 100 ? 'Review' : 'Resume'}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted mb-3">You haven't enrolled in any courses yet.</p>
                                    <Link to="/academy" className="btn btn-gradient">
                                        Explore Courses
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
