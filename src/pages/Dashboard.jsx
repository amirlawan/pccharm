import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CourseCard from '../components/CourseCard';
import { coursesData } from '../data/courses';
import { unenrollUser } from '../lib/enrollmentService';

const Dashboard = () => {
    const { user, isAdmin } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(0);
    const [courseCompletedBanner, setCourseCompletedBanner] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [dismissedAnnouncements, setDismissedAnnouncements] = useState(() => {
        try { return JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]'); } catch { return []; }
    });
    const [courseToUnenroll, setCourseToUnenroll] = useState(null);
    const [isUnenrolling, setIsUnenrolling] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifReads, setNotifReads] = useState([]);
    const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
    const [expandedNotif, setExpandedNotif] = useState(null);
    const [notifLoading, setNotifLoading] = useState(true);
    const [notifToast, setNotifToast] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const timeAgo = (date) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const fetchNotifications = async () => {
        if (!user) return;
        setNotifLoading(true);
        try {
            const { data: notifs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
            const { data: reads } = await supabase.from('notification_reads').select('notification_id').eq('user_id', user.id);
            setNotifications(notifs || []);
            setNotifReads((reads || []).map(r => r.notification_id));
        } catch { /* silently skip */ }
        setNotifLoading(false);
    };

    const markAsRead = async (notifId) => {
        if (notifReads.includes(notifId)) return;
        try {
            await supabase.from('notification_reads').upsert({ notification_id: notifId, user_id: user.id }, { onConflict: 'notification_id,user_id' });
            setNotifReads(prev => [...prev, notifId]);
        } catch { /* ignore */ }
    };

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !notifReads.includes(n.id));
        if (unread.length === 0) return;
        try {
            const upserts = unread.map(n => ({ notification_id: n.id, user_id: user.id }));
            await supabase.from('notification_reads').upsert(upserts, { onConflict: 'notification_id,user_id' });
            setNotifReads(notifications.map(n => n.id));
        } catch { /* ignore */ }
    };

    useEffect(() => {
        if (!user) return;

        if (sessionStorage.getItem('courseCompleted')) {
            setCourseCompletedBanner(true);
            sessionStorage.removeItem('courseCompleted');
        }

        const loadDashboard = async () => {
            // Run ALL queries in parallel instead of sequential
            const [annResult, enrollResult, notifResult, readsResult] = await Promise.allSettled([
                // 1. Announcements
                supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }),
                // 2. Enrollments (main data)
                supabase.from('enrollments').select(`course_id, progress, completed_lessons, courses (id, title, description, icon, category)`).eq('user_id', user.id),
                // 3. Notifications
                supabase.from('notifications').select('*').order('created_at', { ascending: false }),
                // 4. Notification reads
                supabase.from('notification_reads').select('notification_id').eq('user_id', user.id),
            ]);

            // Process announcements
            if (annResult.status === 'fulfilled' && !annResult.value.error) {
                setAnnouncements(annResult.value.data || []);
            }

            // Process enrollments
            if (enrollResult.status === 'fulfilled' && !enrollResult.value.error) {
                const data = enrollResult.value.data || [];
                const formattedDetails = data.map(item => ({
                    ...item.courses,
                    progress: item.progress || 0,
                    completed_lessons: item.completed_lessons || [],
                    enrolled_at: item.enrolled_at
                }));
                setEnrolledCourses(formattedDetails);
                const total = data.reduce((acc, item) => acc + (item.completed_lessons?.length || 0), 0);
                setTotalLessonsCompleted(total);
            }

            // Process notifications
            if (notifResult.status === 'fulfilled' && !notifResult.value.error) {
                setNotifications(notifResult.value.data || []);
            }
            if (readsResult.status === 'fulfilled' && !readsResult.value.error) {
                setNotifReads((readsResult.value.data || []).map(r => r.notification_id));
            }

            setLoading(false);
            setNotifLoading(false);
        };

        loadDashboard();
    }, [user]);

    // Realtime subscription for new notifications
    useEffect(() => {
        if (!user) return;
        const channel = supabase.channel('user-notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                const newNotif = payload.new;
                // Check if it targets this user
                if (newNotif.target_type === 'all' || newNotif.target_type === 'specific' && newNotif.target_value === user.id) {
                    setNotifications(prev => [newNotif, ...prev]);
                    setNotifToast(newNotif.title);
                    setTimeout(() => setNotifToast(null), 4000);
                } else {
                    // For category, just refetch to let RLS filter
                    fetchNotifications();
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const confirmUnenroll = async () => {
        if (!courseToUnenroll) return;
        setIsUnenrolling(true);
        const { error } = await unenrollUser(courseToUnenroll.id, user.id);
        if (error) {
            alert(`Failed to unenroll: ${error.message}`);
        } else {
            setEnrolledCourses(prev => prev.filter(c => c.id !== courseToUnenroll.id));
        }
        setIsUnenrolling(false);
        setCourseToUnenroll(null);
    };

    const getProgressColor = (progress) => {
        if (progress >= 100) return 'bg-success';
        if (progress >= 50) return 'bg-info';
        if (progress >= 25) return 'bg-warning';
        return 'bg-secondary';
    };

    // Close drawer on Escape
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') setNotifDrawerOpen(false); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    if (!user) return null;

    const completedCourses = enrolledCourses.filter(c => c.progress >= 100).length;
    const starterCourses = coursesData.filter(c => ['html', 'python', 'linux'].includes(c.id));
    const unreadCount = notifications.filter(n => !notifReads.includes(n.id)).length;

    return (
        <section className="hero" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px' }}>
            <Helmet>
                <title>My Dashboard | PcCharm™</title>
                <link rel="canonical" href="https://pccharm.vercel.app/dashboard" />
            </Helmet>
            <div className="container">
                {/* Notification Bell - Top Right */}
                <div className="d-flex justify-content-end mb-3">
                    <button
                        className="btn btn-outline-light border-0 position-relative"
                        onClick={() => setNotifDrawerOpen(true)}
                        style={{ fontSize: '1.3rem' }}
                    >
                        <i className="fas fa-bell"></i>
                        {unreadCount > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Active Announcements — Big Modal-Style Cards */}
                {announcements.filter(a => !dismissedAnnouncements.includes(a.id)).length > 0 && (
                    <div className="mb-4 d-flex flex-column gap-3">
                        {announcements.filter(a => !dismissedAnnouncements.includes(a.id)).map(ann => {
                            const typeMap = {
                                info: { bg: 'linear-gradient(135deg, rgba(13,110,253,0.15), rgba(13,110,253,0.05))', border: '#0d6efd', icon: 'fa-info-circle', badgeBg: '#0d6efd' },
                                warning: { bg: 'linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,193,7,0.05))', border: '#ffc107', icon: 'fa-exclamation-triangle', badgeBg: '#ffc107' },
                                success: { bg: 'linear-gradient(135deg, rgba(25,135,84,0.15), rgba(25,135,84,0.05))', border: '#198754', icon: 'fa-check-circle', badgeBg: '#198754' },
                                danger: { bg: 'linear-gradient(135deg, rgba(220,53,69,0.15), rgba(220,53,69,0.05))', border: '#dc3545', icon: 'fa-exclamation-circle', badgeBg: '#dc3545' },
                            };
                            const t = typeMap[ann.type] || typeMap.info;
                            return (
                                <div key={ann.id} className="position-relative rounded-3 p-4 shadow-lg" style={{
                                    background: t.bg,
                                    borderLeft: `5px solid ${t.border}`,
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${t.border}33`,
                                    borderLeftWidth: '5px',
                                    borderLeftStyle: 'solid',
                                    borderLeftColor: t.border,
                                }}>
                                    <button
                                        className="btn btn-sm btn-outline-light border-0 position-absolute top-0 end-0 m-2 opacity-75"
                                        onClick={() => {
                                            const updated = [...dismissedAnnouncements, ann.id];
                                            setDismissedAnnouncements(updated);
                                            localStorage.setItem('dismissedAnnouncements', JSON.stringify(updated));
                                        }}
                                        style={{ fontSize: '1.1rem' }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                    <div className="d-flex align-items-start gap-3">
                                        <div className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle" style={{
                                            width: '48px', height: '48px', background: `${t.border}25`, color: t.border, fontSize: '1.4rem'
                                        }}>
                                            <i className={`fas ${t.icon}`}></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className="badge rounded-pill text-white" style={{ background: t.badgeBg, fontSize: '0.7rem' }}>{(ann.type || 'info').toUpperCase()}</span>
                                                <small className="text-muted">{new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small>
                                            </div>
                                            <h5 className="text-white mb-1 fw-bold" style={{ fontSize: '1.15rem' }}>{ann.title}</h5>
                                            <p className="mb-0 text-light" style={{ opacity: 0.85, fontSize: '0.95rem', lineHeight: 1.5 }}>{ann.body}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {courseCompletedBanner && (
                    <div className="alert alert-success alert-dismissible fade show text-center border-0 shadow-lg" role="alert" style={{ background: 'var(--gradient-1)', color: 'white' }}>
                        <i className="fas fa-party-horn me-2"></i><strong>🎉 Congratulations!</strong> You have successfully completed the course!
                        <button type="button" className="btn-close btn-close-white" onClick={() => setCourseCompletedBanner(false)} aria-label="Close"></button>
                    </div>
                )}
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-lg-3 mb-4">
                        <div className="glass-card no-hover p-4 h-100">
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
                                    <Link to="/certificates" className="text-muted text-decoration-none d-flex align-items-center hover-text-white">
                                        <i className="fas fa-certificate me-3" style={{ width: '20px' }}></i> Certificates
                                    </Link>
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
                        <div className="glass-card no-hover p-4 mb-4">
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
                                            <div className="p-4 border border-secondary border-opacity-10 rounded-4 shadow-sm" style={{ background: '#12121f' }}>
                                                <div className="d-flex align-items-center mb-4">
                                                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10 text-info me-3" style={{ width: '48px', height: '48px' }}>
                                                        <i className={`${course.icon || 'fas fa-book'} fs-5`}></i>
                                                    </div>
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
                                                    <div className="d-flex gap-2">
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger px-2" 
                                                            onClick={() => setCourseToUnenroll(course)}
                                                            title="Unenroll (Warning: Lose Progress)"
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                        <Link to={`/learn/${course.id}`} className="btn btn-sm btn-gradient">
                                                            {course.progress >= 100 ? 'Review' : 'Resume'}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted mb-3">You haven't enrolled in any courses yet.</p>
                                    <Link to="/academy" className="btn btn-gradient mb-4">
                                        Explore Courses
                                    </Link>

                                    <div className="text-start mt-4 border-top border-secondary border-opacity-25 pt-5">
                                        <h5 className="mb-4 text-warning">Recommended to start with:</h5>
                                        <div className="row g-4 mb-4">
                                            {starterCourses.map((course, idx) => (
                                                <CourseCard 
                                                    key={course.id} 
                                                    course={course} 
                                                    index={idx} 
                                                    isEnrolled={false} 
                                                    onEnroll={() => navigate('/academy')} 
                                                />
                                            ))}
                                        </div>
                                        <div className="text-center mt-2">
                                            <Link to="/academy" className="text-info text-decoration-none hover-text-white fw-bold">
                                                Head to the Academy to enroll <i className="fas fa-arrow-right ms-1"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Unenroll Modal Overlay */}
            {courseToUnenroll && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 2000 }}>
                    <div className="glass-card no-hover p-4 p-md-5 m-3 text-center animate-fade-in" style={{ maxWidth: '500px', border: '1px solid rgba(220, 53, 69, 0.3)' }}>
                        <div className="icon-circle mx-auto mb-4 bg-danger bg-opacity-25 text-danger" style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}>
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 className="mb-3">Unenroll from Course?</h3>
                        <p className="text-muted mb-4">
                            Are you sure you want to unenroll from <strong className="text-white">{courseToUnenroll.title}</strong>?<br/><br/>
                            <span className="text-danger fw-bold"><i className="fas fa-radiation me-2"></i>This will permanently delete all your progress. This action cannot be undone.</span>
                        </p>
                        <div className="d-flex justify-content-center gap-3">
                            <button 
                                className="btn btn-outline-light px-4" 
                                onClick={() => setCourseToUnenroll(null)}
                                disabled={isUnenrolling}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-danger px-4 d-flex align-items-center gap-2" 
                                onClick={confirmUnenroll}
                                disabled={isUnenrolling}
                            >
                                {isUnenrolling ? (
                                    <><span className="spinner-border spinner-border-sm"></span> Processing...</>
                                ) : (
                                    <><i className="fas fa-trash-alt"></i> Yes, Unenroll</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Notification Drawer */}
            {notifDrawerOpen && (
                <>
                    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 2050 }} onClick={() => setNotifDrawerOpen(false)}></div>
                    <div className="position-fixed top-0 end-0 h-100 d-flex flex-column" style={{ width: '420px', maxWidth: '90vw', zIndex: 2060, background: 'linear-gradient(180deg, #1a1d23 0%, #12151a 100%)', borderLeft: '1px solid rgba(255,255,255,0.1)', animation: 'fadeInUp 0.25s ease-out' }}>
                        <div className="d-flex justify-content-between align-items-center p-4 border-bottom border-secondary border-opacity-25">
                            <h5 className="text-white mb-0"><i className="fas fa-bell me-2 text-info"></i>Notifications</h5>
                            <div className="d-flex gap-2">
                                {unreadCount > 0 && <button className="btn btn-sm btn-outline-info" onClick={markAllAsRead}><i className="fas fa-check-double me-1"></i>Mark all read</button>}
                                <button className="btn btn-sm btn-outline-secondary text-white border-0" onClick={() => setNotifDrawerOpen(false)}><i className="fas fa-times fs-5"></i></button>
                            </div>
                        </div>
                        <div className="flex-grow-1 overflow-auto p-3">
                            {notifLoading ? (
                                <div className="d-flex flex-column gap-3">
                                    {[1,2,3].map(i => <div key={i} className="rounded p-3" style={{ background: 'rgba(255,255,255,0.05)', height: '80px', animation: 'pulse 1.5s infinite' }}></div>)}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="fas fa-bell-slash fs-1 mb-3 d-block opacity-25"></i>
                                    <p>No notifications yet.</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {notifications.map(n => {
                                        const isRead = notifReads.includes(n.id);
                                        const isExpanded = expandedNotif === n.id;
                                        const colorMap = { info: '#0d6efd', warning: '#ffc107', success: '#198754', danger: '#dc3545' };
                                        const color = colorMap[n.type] || colorMap.info;
                                        return (
                                            <div
                                                key={n.id}
                                                className="rounded p-3 position-relative"
                                                style={{ borderLeft: `4px solid ${color}`, background: isRead ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'background 0.2s' }}
                                                onClick={() => { setExpandedNotif(isExpanded ? null : n.id); markAsRead(n.id); }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <span className={`badge bg-${n.type}`} style={{ fontSize: '0.6rem' }}>{n.type}</span>
                                                            <small className="text-muted">{timeAgo(n.created_at)}</small>
                                                        </div>
                                                        <h6 className={`mb-1 ${isRead ? 'text-muted fw-normal' : 'text-white fw-bold'}`} style={{ fontSize: '0.95rem' }}>{n.title}</h6>
                                                        <p className="text-light mb-0 small" style={{ opacity: 0.7, display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: isExpanded ? 'visible' : 'hidden' }}>{n.body}</p>
                                                    </div>
                                                    {!isRead && <span className="flex-shrink-0 ms-2 mt-1 rounded-circle bg-info" style={{ width: '10px', height: '10px' }}></span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Realtime Notification Toast */}
            {notifToast && (
                <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2100, animation: 'fadeInUp 0.3s ease-out' }}>
                    <div className="alert alert-info alert-dismissible shadow-lg mb-0 d-flex align-items-center" style={{ minWidth: '280px' }}>
                        <i className="fas fa-bell me-2 fs-5"></i>
                        <span>New notification: <strong>{notifToast}</strong></span>
                        <button type="button" className="btn-close" onClick={() => setNotifToast(null)}></button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Dashboard;
