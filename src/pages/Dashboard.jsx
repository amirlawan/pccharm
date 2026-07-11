import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CourseCard from '../components/CourseCard';
import { coursesData } from '../data/courses';
import { unenrollUser } from '../lib/enrollmentService';
import confetti from 'canvas-confetti';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const AVATAR_OPTIONS = [
    { name: 'Cyberpunk Coder', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyberpunk' },
    { name: 'Code Wizard', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=programmer' },
    { name: 'Pixel Hacker', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=wizard' },
    { name: 'Terminal Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=hacker' },
    { name: 'System Architect', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=architect' },
    { name: 'AI Explorer', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai' }
];

const Dashboard = () => {
    const { user, isAdmin } = useAuth();
    const [profile, setProfile] = useState({ full_name: '', avatar_url: '' });
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
    
    // Avatar picker states
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);
    const [updatingAvatar, setUpdatingAvatar] = useState(false);
    
    // Password reset modal states
    const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    
    // Dashboard sub-tab switcher state
    const [activeSubTab, setActiveSubTab] = useState('learning'); // 'learning', 'analytics', 'milestones'

    // Interactive Quests
    const [quests, setQuests] = useState(() => {
        try {
            const saved = localStorage.getItem('dailyQuests');
            if (saved) {
                const parsed = JSON.parse(saved);
                const today = new Date().toDateString();
                if (parsed.date === today) {
                    return parsed.quests;
                }
            }
        } catch {}
        return [
            { id: 'quest_check', title: 'Daily Check-in Complete', completed: true },
            { id: 'quest_lesson', title: 'Complete a Lesson modules', completed: false },
            { id: 'quest_catalog', title: 'Explore Academy Library', completed: false }
        ];
    });

    const navigate = useNavigate();
    const location = useLocation();

    // Sync quests to localStorage
    useEffect(() => {
        const today = new Date().toDateString();
        localStorage.setItem('dailyQuests', JSON.stringify({ date: today, quests }));
    }, [quests]);

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
            const [annResult, enrollResult, notifResult, readsResult, profileResult] = await Promise.allSettled([
                supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }),
                supabase.from('enrollments').select(`course_id, progress, completed_lessons, enrolled_at, courses (id, title, description, icon, category, category_label)`).eq('user_id', user.id),
                supabase.from('notifications').select('*').order('created_at', { ascending: false }),
                supabase.from('notification_reads').select('notification_id').eq('user_id', user.id),
                supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single()
            ]);

            if (annResult.status === 'fulfilled' && !annResult.value.error) {
                setAnnouncements(annResult.value.data || []);
            }

            if (profileResult.status === 'fulfilled' && !profileResult.value.error && profileResult.value.data) {
                setProfile({
                    full_name: profileResult.value.data.full_name || user.user_metadata?.full_name || 'Developer',
                    avatar_url: profileResult.value.data.avatar_url || user.user_metadata?.avatar_url || ''
                });
            } else {
                setProfile({
                    full_name: user.user_metadata?.full_name || 'Developer',
                    avatar_url: user.user_metadata?.avatar_url || ''
                });
            }

            if (enrollResult.status === 'fulfilled' && !enrollResult.value.error) {
                const data = enrollResult.value.data || [];
                const formattedDetails = data.map(item => ({
                    ...item.courses,
                    progress: item.progress || 0,
                    completed_lessons: item.completed_lessons || [],
                    enrolled_at: item.enrolled_at
                }));

                const total = data.reduce((acc, item) => acc + (item.completed_lessons?.length || 0), 0);
                setTotalLessonsCompleted(total);

                // Fetch lessons of enrolled courses to determine what is the next up lesson title
                const courseIds = formattedDetails.map(c => c.id);
                let lessonsMap = {};
                if (courseIds.length > 0) {
                    const { data: allLessons } = await supabase
                        .from('lessons')
                        .select('id, title, course_id, order')
                        .in('course_id', courseIds)
                        .order('order', { ascending: true });
                    
                    if (allLessons) {
                        allLessons.forEach(l => {
                            if (!lessonsMap[l.course_id]) lessonsMap[l.course_id] = [];
                            lessonsMap[l.course_id].push(l);
                        });
                    }
                }

                const updatedCourses = formattedDetails.map(course => {
                    const courseLessons = lessonsMap[course.id] || [];
                    const nextLesson = courseLessons.find(l => !course.completed_lessons.includes(l.id));
                    return {
                        ...course,
                        nextLessonTitle: nextLesson ? nextLesson.title : (course.progress >= 100 ? 'Course Completed! 🎉' : 'No lessons available'),
                        nextLessonId: nextLesson ? nextLesson.id : null
                    };
                });

                setEnrolledCourses(updatedCourses);
            }

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

    useEffect(() => {
        if (!user) return;
        const channel = supabase.channel('user-notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                const newNotif = payload.new;
                if (newNotif.target_type === 'all' || newNotif.target_type === 'specific' && newNotif.target_value === user.id) {
                    setNotifications(prev => [newNotif, ...prev]);
                    setNotifToast(newNotif.title);
                    setTimeout(() => setNotifToast(null), 4000);
                } else {
                    fetchNotifications();
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user]);

    useEffect(() => {
        if (user && sessionStorage.getItem('isPasswordRecovery') === 'true') {
            setRecoveryModalOpen(true);
        }
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

    const handleToggleQuest = (questId) => {
        setQuests(prev => prev.map(q => {
            if (q.id === questId) {
                const nextState = !q.completed;
                if (nextState) {
                    confetti({
                        particleCount: 80,
                        spread: 60,
                        origin: { y: 0.8 },
                        colors: ['#ff7e5f', '#feb47b', '#ffda63']
                    });
                }
                return { ...q, completed: nextState };
            }
            return q;
        }));
    };

    const handleSelectAvatar = async (avatarUrl) => {
        if (!user) return;
        setUpdatingAvatar(true);
        try {
            const { error: authError } = await supabase.auth.updateUser({
                data: { avatar_url: avatarUrl }
            });
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ avatar_url: avatarUrl })
                .eq('id', user.id);

            if (!authError && !profileError) {
                setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
                setAvatarModalOpen(false);
                confetti({
                    particleCount: 50,
                    spread: 50,
                    origin: { y: 0.6 }
                });
            } else {
                alert('Failed to update avatar: ' + (authError?.message || profileError?.message));
            }
        } catch (err) {
            console.error('Avatar update error:', err);
        } finally {
            setUpdatingAvatar(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }
        setUpdatingPassword(true);
        setPasswordError('');
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            sessionStorage.removeItem('isPasswordRecovery');
            setRecoveryModalOpen(false);
            setNewPassword('');
            setConfirmPassword('');
            alert('Password updated successfully!');
        } catch (err) {
            setPasswordError(err.message);
        } finally {
            setUpdatingPassword(false);
        }
    };

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') setNotifDrawerOpen(false); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    if (!user) return null;

    const completedCourses = enrolledCourses.filter(c => c.progress >= 100).length;
    const starterCourses = coursesData.filter(c => ['html', 'python', 'linux'].includes(c.id));
    const unreadCount = notifications.filter(n => !notifReads.includes(n.id)).length;

    // Gamification state
    const xpPerLesson = 10;
    const xpPerCourse = 100;
    const currentXP = (totalLessonsCompleted * xpPerLesson) + (completedCourses * xpPerCourse);
    const level = Math.floor(currentXP / 100) + 1;
    const xpInCurrentLevel = currentXP % 100;
    const xpPercent = Math.min((xpInCurrentLevel / 100) * 100, 100);

    const getUserRank = (lvl) => {
        if (lvl >= 10) return 'Arch-Wizard Developer';
        if (lvl >= 7) return 'Senior Code Master';
        if (lvl >= 5) return 'Fullstack Explorer';
        if (lvl >= 3) return 'Advanced Script Squire';
        return 'Code Initiate';
    };

    // Category progress calculations for Doughnut Chart
    const categoryGroup = {};
    enrolledCourses.forEach(c => {
        const cat = c.category_label || c.category || 'Other';
        if (!categoryGroup[cat]) {
            categoryGroup[cat] = { count: 0, total: 0 };
        }
        categoryGroup[cat].count += 1;
        categoryGroup[cat].total += c.progress || 0;
    });

    const hasEnrolled = enrolledCourses.length > 0;
    const chartLabels = hasEnrolled ? Object.keys(categoryGroup) : ['Web Development', 'Cybersecurity', 'OS & Networking', 'AI & Data Science'];
    const chartDataValues = hasEnrolled 
        ? chartLabels.map(label => Math.round(categoryGroup[label].total / categoryGroup[label].count))
        : [25, 25, 25, 25];

    const doughnutData = {
        labels: chartLabels,
        datasets: [
            {
                data: chartDataValues,
                backgroundColor: [
                    'rgba(255, 126, 95, 0.8)',
                    'rgba(254, 180, 123, 0.8)',
                    'rgba(255, 218, 99, 0.8)',
                    'rgba(13, 202, 240, 0.8)',
                    'rgba(111, 66, 193, 0.8)'
                ],
                borderColor: '#12121f',
                borderWidth: 2,
                hoverOffset: 6
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#a8b2d1',
                    font: { family: 'Poppins', size: 10 },
                    padding: 12
                }
            },
            tooltip: {
                enabled: hasEnrolled,
                callbacks: {
                    label: (context) => ` ${context.label}: ${context.raw}% Avg Progress`
                }
            }
        },
        cutout: '65%'
    };

    // Achievements & Badges List
    const achievements = [
        { id: 'badge_welcome', title: 'First Code Step', desc: 'Enrolled in your first course at PcCharm Academy.', icon: 'fas fa-door-open', unlocked: enrolledCourses.length >= 1 },
        { id: 'badge_lessons', title: 'Fast Learner', desc: 'Completed 3 or more lessons successfully.', icon: 'fas fa-bolt', unlocked: totalLessonsCompleted >= 3 },
        { id: 'badge_polymath', title: 'Polymath Squire', desc: 'Enrolled across at least 2 distinct categories.', icon: 'fas fa-brain', unlocked: new Set(enrolledCourses.map(c => c.category)).size >= 2 },
        { id: 'badge_complete', title: 'Deep Diver', desc: 'Graduated from your first PcCharm course with 100% progress.', icon: 'fas fa-award', unlocked: completedCourses >= 1 },
        { id: 'badge_expert', title: 'Code Specialist', desc: 'Completed 10 or more lessons.', icon: 'fas fa-graduation-cap', unlocked: totalLessonsCompleted >= 10 },
        { id: 'badge_admin', title: 'The Overseer', desc: 'Granted administrative keys to the realm.', icon: 'fas fa-key', unlocked: isAdmin }
    ];

    // Activity Timeline Event Generator
    const timelineEvents = [];
    enrolledCourses.forEach(c => {
        if (c.enrolled_at) {
            timelineEvents.push({
                type: 'enroll',
                title: `Started learning ${c.title}`,
                desc: `Enrolled in course under ${c.category_label || c.category}`,
                date: new Date(c.enrolled_at),
                icon: c.icon || 'fas fa-book'
            });
        }
        if (c.completed_lessons && c.completed_lessons.length > 0) {
            timelineEvents.push({
                type: 'progress',
                title: `Progressed in ${c.title}`,
                desc: `Completed ${c.completed_lessons.length} lessons. Currently at ${c.progress}% progress.`,
                date: new Date(c.enrolled_at),
                icon: 'fas fa-tasks'
            });
        }
        if (c.progress >= 100) {
            timelineEvents.push({
                type: 'complete',
                title: `Graduated from ${c.title}! 🎉`,
                desc: `Completed all modules and successfully earned a certificate.`,
                date: new Date(c.enrolled_at),
                icon: 'fas fa-award'
            });
        }
    });
    const sortedEvents = timelineEvents.sort((a, b) => b.date - a.date).slice(0, 4);

    if (loading) {
        return (
            <section className="dashboard-section" style={{ minHeight: '100vh' }}>
                <Helmet>
                    <title>My Dashboard | PcCharm™</title>
                </Helmet>
                <div className="container">
                    {/* Bell and header placeholder */}
                    <div className="d-flex justify-content-end mb-4">
                        <div className="skeleton-card p-0" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
                            <div className="skeleton-shimmer"></div>
                        </div>
                    </div>

                    {/* Gamified Profile Header Skeleton */}
                    <div className="glass-panel p-4 mb-4 skeleton-card">
                        <div className="skeleton-shimmer"></div>
                        <div className="row align-items-center g-4">
                            <div className="col-md-auto text-center text-md-start">
                                <div className="skeleton-avatar"></div>
                            </div>
                            <div className="col-md">
                                <div className="d-flex flex-column align-items-center align-items-md-start">
                                    <div className="skeleton-item title" style={{ width: '200px' }}></div>
                                    <div className="skeleton-item short" style={{ width: '150px' }}></div>
                                    <div className="skeleton-item" style={{ width: '300px', height: '10px', marginTop: '10px' }}></div>
                                </div>
                            </div>
                            <div className="col-md-auto">
                                <div className="d-flex gap-3">
                                    <div className="skeleton-item" style={{ width: '90px', height: '35px', borderRadius: '30px' }}></div>
                                    <div className="skeleton-item" style={{ width: '90px', height: '35px', borderRadius: '30px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary Panel Skeleton */}
                    <div className="row g-4 mb-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="col-md-4">
                                <div className="glass-card p-4 skeleton-card text-center d-flex flex-column justify-content-center align-items-center" style={{ height: '116px' }}>
                                    <div className="skeleton-shimmer"></div>
                                    <div className="skeleton-item" style={{ width: '30px', height: '24px', marginBottom: '8px' }}></div>
                                    <div className="skeleton-item short" style={{ width: '80px', height: '10px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tab Navigation Switches Skeleton */}
                    <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton-item" style={{ width: '160px', height: '40px', borderRadius: '30px' }}></div>
                        ))}
                    </div>

                    {/* Content Skeleton */}
                    <div className="row g-4">
                        <div className="col-xl-8 col-lg-7">
                            <div className="glass-card p-4 skeleton-card" style={{ minHeight: '340px' }}>
                                <div className="skeleton-shimmer"></div>
                                <div className="skeleton-item title" style={{ width: '180px' }}></div>
                                <div className="row g-3 mt-2">
                                    {[1, 2].map(i => (
                                        <div key={i} className="col-md-6">
                                            <div className="p-4 border border-secondary border-opacity-10 rounded-4" style={{ background: '#12121f', height: '160px' }}>
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="rounded-circle bg-secondary bg-opacity-10 me-3" style={{ width: '48px', height: '48px' }}></div>
                                                    <div className="flex-grow-1">
                                                        <div className="skeleton-item" style={{ width: '100px', height: '12px' }}></div>
                                                        <div className="skeleton-item" style={{ width: '60px', height: '8px' }}></div>
                                                    </div>
                                                </div>
                                                <div className="skeleton-item" style={{ width: '130px', height: '10px' }}></div>
                                                <div className="skeleton-item short" style={{ width: '80px', height: '8px' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-5">
                            <div className="glass-card p-4 skeleton-card" style={{ minHeight: '340px' }}>
                                <div className="skeleton-shimmer"></div>
                                <div className="skeleton-item title" style={{ width: '120px' }}></div>
                                <div className="d-flex flex-column gap-2 mt-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="d-flex align-items-center gap-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}></div>
                                            <div className="skeleton-item mb-0" style={{ width: '140px', height: '10px' }}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="dashboard-section" style={{ minHeight: '100vh' }}>
            <Helmet>
                <title>My Dashboard | PcCharm™</title>
                <link rel="canonical" href="https://pccharm.vercel.app/dashboard" />
            </Helmet>
            
            <div className="container">
                {/* Dashboard Controls (Notifications Bell) */}
                <div className="d-flex justify-content-end mb-4">
                    <button
                        className="btn btn-outline-light border-0 position-relative p-2"
                        onClick={() => setNotifDrawerOpen(true)}
                        style={{ fontSize: '1.4rem' }}
                    >
                        <i className="fas fa-bell"></i>
                        {unreadCount > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Active Announcements */}
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
                                <div key={ann.id} className="position-relative rounded-4 p-4 shadow-lg" style={{
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

                {/* Gamified Profile Header Section */}
                <div className="glass-panel p-4 mb-4 dashboard-float-effect">
                    <div className="row align-items-center g-4">
                        <div className="col-md-auto text-center text-md-start">
                            <div className="avatar-badge-wrapper" onClick={() => setAvatarModalOpen(true)} title="Change Custom Avatar">
                                {profile.avatar_url ? (
                                    <img 
                                        src={profile.avatar_url} 
                                        alt="User Avatar" 
                                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ff7e5f' }} 
                                    />
                                ) : (
                                    <div style={{
                                        width: '100px', height: '100px', background: 'var(--gradient-1)',
                                        borderRadius: '50%', margin: '0 auto', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white'
                                    }}>
                                        <i className="fas fa-user"></i>
                                    </div>
                                )}
                                <div className="avatar-edit-overlay">
                                    <i className="fas fa-camera"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-md">
                            <div className="text-center text-md-start">
                                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
                                    <h3 className="m-0 fw-bold">{profile.full_name}</h3>
                                    <span className="badge bg-warning text-dark px-3 py-1.5 rounded-pill fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        LEVEL {level}
                                    </span>
                                </div>
                                <p className="text-info fw-bold mb-3" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>{getUserRank(level).toUpperCase()}</p>
                                
                                {/* XP Progress Bar */}
                                <div className="d-flex align-items-center gap-3">
                                    <div className="xp-container flex-grow-1" style={{ maxWidth: '400px' }}>
                                        <div className="xp-bar-gradient" style={{ width: `${xpPercent}%` }}></div>
                                    </div>
                                    <span className="text-muted small fw-bold">{xpInCurrentLevel}/100 XP</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-auto">
                            <div className="d-flex flex-wrap justify-content-center gap-3">
                                <Link to="/academy" className="btn btn-sm btn-gradient px-3">
                                    <i className="fas fa-book-open me-2"></i> Catalog
                                </Link>
                                <Link to="/certificates" className="btn btn-sm btn-outline-light px-3">
                                    <i className="fas fa-certificate me-2"></i> Certificates
                                </Link>
                                {isAdmin && (
                                    <Link to="/admin" className="btn btn-sm btn-outline-warning px-3">
                                        <i className="fas fa-tools me-2"></i> Admin Panel
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="btn btn-sm btn-outline-danger px-3">
                                    <i className="fas fa-sign-out-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Summary Panel */}
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
                            <i className="fas fa-bolt mb-2 text-warning fs-3"></i>
                            <h3 className="text-warning m-0">{currentXP}</h3>
                            <p className="small text-muted mb-0">Total XP Earned</p>
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

                {/* Tab Navigation Switches */}
                <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                    <button 
                        className={`dashboard-tab-btn ${activeSubTab === 'learning' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('learning')}
                    >
                        <i className="fas fa-book-reader me-2"></i>Learning & Quests
                    </button>
                    <button 
                        className={`dashboard-tab-btn ${activeSubTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('analytics')}
                    >
                        <i className="fas fa-chart-line me-2"></i>Analytics & Activity
                    </button>
                    <button 
                        className={`dashboard-tab-btn ${activeSubTab === 'milestones' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('milestones')}
                    >
                        <i className="fas fa-trophy me-2"></i>Achievements
                    </button>
                </div>

                {/* Tab Content Rendering */}
                {activeSubTab === 'learning' && (
                    <div className="row g-4">
                        {/* Enrolled Courses */}
                        <div className="col-xl-8 col-lg-7">
                            <div className="glass-card no-hover p-4 h-100">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="mb-0 fw-bold">My Learning Progress</h4>
                                    <Link to="/academy" className="btn btn-sm btn-outline-light">
                                        Browse All
                                    </Link>
                                </div>

                                {loading ? (
                                    <div className="text-center py-4"><div className="loader"></div></div>
                                ) : enrolledCourses.length > 0 ? (
                                    <div className="scrollable-panel">
                                        <div className="row g-3">
                                            {enrolledCourses.map(course => (
                                                <div key={course.id} className="col-md-6">
                                                    <div className="p-4 border border-secondary border-opacity-10 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between" style={{ background: '#12121f' }}>
                                                        <div>
                                                            <div className="d-flex align-items-center mb-3">
                                                                <div className="d-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10 text-info me-3" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                                                                    <i className={`${course.icon || 'fas fa-book'} fs-5`}></i>
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-0 fw-bold text-white text-truncate" style={{ maxWidth: '180px' }}>{course.title}</h6>
                                                                    <small className="text-muted d-block text-truncate" style={{ maxWidth: '180px', fontSize: '0.75rem' }}>{course.category_label || course.category}</small>
                                                                </div>
                                                                {course.progress >= 100 && (
                                                                    <span className="badge bg-success flex-shrink-0">
                                                                        <i className="fas fa-check"></i>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Next Up Lesson Text */}
                                                            <div className="mb-3 text-light" style={{ opacity: 0.8, fontSize: '0.85rem' }}>
                                                                <i className="fas fa-play-circle text-info me-2"></i>
                                                                <strong>Next up:</strong> <span className="text-muted text-truncate d-inline-block align-middle" style={{ maxWidth: '150px' }}>{course.nextLessonTitle}</span>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div className="flex-grow-1 me-3">
                                                                    <div className="progress mb-1" style={{ height: '8px' }}>
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
                                                                        className="btn btn-sm btn-outline-danger px-2 py-1" 
                                                                        onClick={() => setCourseToUnenroll(course)}
                                                                        title="Unenroll (Warning: Lose Progress)"
                                                                    >
                                                                        <i className="fas fa-trash-alt"></i>
                                                                    </button>
                                                                    <Link to={`/learn/${course.id}`} className="btn btn-sm btn-gradient px-3 py-1">
                                                                        {course.progress >= 100 ? 'Review' : 'Resume'}
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted mb-3">You haven't enrolled in any courses yet.</p>
                                        <Link to="/academy" className="btn btn-gradient mb-4">
                                            Explore Courses
                                        </Link>

                                        <div className="text-start mt-4 border-top border-secondary border-opacity-25 pt-4">
                                            <h5 className="mb-4 text-warning">Recommended to start with:</h5>
                                            <div className="row g-3">
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
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Daily Quests Checklist */}
                        <div className="col-xl-4 col-lg-5">
                            <div className="glass-card no-hover p-4 h-100">
                                <h5 className="text-white mb-3 fw-bold"><i className="fas fa-tasks text-warning me-2"></i>Daily Quests</h5>
                                <p className="small text-muted mb-3">Complete challenges today to boost your learning path!</p>
                                <div className="d-flex flex-column gap-2">
                                    {quests.map(quest => (
                                        <div 
                                            key={quest.id} 
                                            className={`quest-checkbox-wrapper ${quest.completed ? 'completed' : ''}`}
                                            onClick={() => handleToggleQuest(quest.id)}
                                        >
                                            <div className="quest-checkbox">
                                                <i className="fas fa-check"></i>
                                            </div>
                                            <span className="quest-title text-white flex-grow-1" style={{ fontSize: '0.92rem' }}>{quest.title}</span>
                                            {quest.completed && <span className="badge bg-success-subtle text-success small">Done</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSubTab === 'analytics' && (
                    <div className="row g-4">
                        {/* Analytics Doughnut Chart */}
                        <div className="col-lg-6">
                            <div className="glass-card no-hover p-4 h-100">
                                <h5 className="text-white mb-3 fw-bold"><i className="fas fa-chart-pie text-info me-2"></i>Learning Analytics</h5>
                                <p className="small text-muted mb-4">Summary of average progress across subject areas.</p>
                                <div className="position-relative" style={{ height: '240px' }}>
                                    <Doughnut data={doughnutData} options={chartOptions} />
                                    {!hasEnrolled && (
                                        <div className="position-absolute inset-0 d-flex flex-column align-items-center justify-content-center text-center p-3" style={{ background: 'rgba(10,17,40,0.85)', borderRadius: '16px' }}>
                                            <i className="fas fa-lock fs-4 text-muted mb-2"></i>
                                            <span className="small text-muted">Chart will populate upon enrollment in active courses.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Timeline */}
                        <div className="col-lg-6">
                            <div className="glass-card no-hover p-4 h-100">
                                <h5 className="text-white mb-3 fw-bold"><i className="fas fa-history text-info me-2"></i>Recent Activity</h5>
                                <p className="small text-muted mb-4">Latest history of actions logged in the system.</p>
                                <div className="scrollable-panel">
                                    {sortedEvents.length > 0 ? (
                                        <div className="study-timeline">
                                            {sortedEvents.map((evt, idx) => (
                                                <div key={idx} className="study-timeline-item">
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <i className={`${evt.icon} text-muted`} style={{ fontSize: '0.9rem' }}></i>
                                                        <h6 className="text-white m-0 fw-bold" style={{ fontSize: '0.95rem', textTransform: 'none', letterSpacing: '0' }}>{evt.title}</h6>
                                                    </div>
                                                    <p className="text-muted small mb-1">{evt.desc}</p>
                                                    <small className="text-secondary" style={{ fontSize: '0.75rem' }}>{timeAgo(evt.date)}</small>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted mb-0 small">Enroll in courses or complete lessons to log your activity timeline.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSubTab === 'milestones' && (
                    <div className="glass-card no-hover p-4">
                        <h5 className="text-white mb-3 fw-bold"><i className="fas fa-trophy text-warning me-2"></i>Milestones & Achievements</h5>
                        <p className="small text-muted mb-4">Unlock milestone badges as you complete courses and modules.</p>
                        <div className="row g-3">
                            {achievements.map(badge => (
                                <div key={badge.id} className="col-xl-4 col-md-6">
                                    <div className={`achievement-badge-card p-4 text-center h-100 d-flex flex-column justify-content-center ${badge.unlocked ? 'unlocked' : ''}`} title={badge.desc}>
                                        <div className="achievement-icon-circle mb-3" style={{ width: '70px', height: '70px', fontSize: '1.8rem' }}>
                                            <i className={badge.icon}></i>
                                        </div>
                                        <h6 className="m-0 text-white fw-bold mb-1" style={{ fontSize: '0.95rem', textTransform: 'none', letterSpacing: '0' }}>{badge.title}</h6>
                                        <p className="text-muted small mb-2" style={{ fontSize: '0.8rem', opacity: 0.85 }}>{badge.desc}</p>
                                        <span className="badge bg-secondary-subtle text-secondary small align-self-center">{badge.unlocked ? 'Unlocked' : 'Locked'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Unenroll Confirmation Modal */}
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

            {/* Custom Avatar Selector Modal */}
            {avatarModalOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 2100 }}>
                    <div className="glass-card no-hover p-4 m-3 text-center animate-fade-in" style={{ maxWidth: '550px', border: '1px solid rgba(255, 126, 95, 0.25)' }}>
                        <h4 className="mb-2 text-white fw-bold">Select Custom Avatar</h4>
                        <p className="text-muted small mb-4">Choose a developer persona to represent you in the realm.</p>
                        
                        <div className="row g-3 mb-4">
                            {AVATAR_OPTIONS.map((av, index) => {
                                const isActive = profile.avatar_url === av.url;
                                return (
                                    <div key={index} className="col-4">
                                        <div 
                                            className={`avatar-picker-option p-2 ${isActive ? 'active' : ''}`}
                                            onClick={() => handleSelectAvatar(av.url)}
                                        >
                                            <img src={av.url} alt={av.name} className="w-100 rounded-circle" style={{ background: 'rgba(255,255,255,0.05)', aspectRatio: '1/1' }} />
                                            <span className="small text-muted d-block mt-2 text-truncate" style={{ fontSize: '0.75rem' }}>{av.name}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="d-flex justify-content-end">
                            <button 
                                className="btn btn-outline-light px-4 py-2" 
                                onClick={() => setAvatarModalOpen(false)}
                                disabled={updatingAvatar}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Recovery / Reset Modal */}
            {recoveryModalOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 2200 }}>
                    <div className="glass-card no-hover p-4 p-md-5 m-3 text-center animate-fade-in" style={{ maxWidth: '500px', border: '1px solid rgba(255, 126, 95, 0.25)', borderRadius: '16px' }}>
                        <div className="icon-circle mx-auto mb-4 bg-warning bg-opacity-25 text-warning animate-pulse" style={{ width: '80px', height: '80px', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                            <i className="fas fa-key"></i>
                        </div>
                        <h3 className="mb-2 text-white fw-bold">Reset Your Password</h3>
                        <p className="text-muted small mb-4">Please enter your new password below to update your account credentials.</p>
                        
                        {passwordError && <div className="alert alert-danger mb-3 py-2 text-start small">{passwordError}</div>}
                        
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-3 text-start">
                                <label className="form-label text-light small fw-semibold">New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    required
                                    placeholder="Min. 8 characters"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="mb-4 text-start">
                                <label className="form-label text-light small fw-semibold">Confirm Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    required
                                    placeholder="Re-enter new password"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <div className="d-flex justify-content-end gap-3">
                                <button 
                                    type="button"
                                    className="btn btn-outline-light px-4 py-2" 
                                    onClick={() => {
                                        sessionStorage.removeItem('isPasswordRecovery');
                                        setRecoveryModalOpen(false);
                                    }}
                                    disabled={updatingPassword}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="btn btn-gradient px-4 py-2"
                                    disabled={updatingPassword}
                                >
                                    {updatingPassword ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span> Updating...</>
                                    ) : (
                                        'Save Password'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notification Drawer Overlay */}
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
