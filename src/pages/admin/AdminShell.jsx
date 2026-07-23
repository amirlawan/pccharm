import React, { useEffect, useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import { coursesData } from '../../data/courses';

import OverviewTab from './tabs/OverviewTab';
import UsersTab from './tabs/UsersTab';
import CoursesTab from './tabs/CoursesTab';
import LessonsTab from './tabs/LessonsTab';
import EnrollmentsTab from './tabs/EnrollmentsTab';
import WaitlistTab from './tabs/WaitlistTab';
import AnnouncementsTab from './tabs/AnnouncementsTab';
import InboxTab from './tabs/InboxTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import SettingsTab from './tabs/SettingsTab';

// Register Chart.js dynamically outside the component so it only runs once
import('chart.js').then((module) => {
    const { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } = module;
    Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);
});

const AdminShell = () => {
    const { user, isAdmin } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Tab State
    const [activeTab, setActiveTab] = useState('overview');

    const adminTabs = [
        { id: 'overview', label: 'Overview', icon: 'fas fa-chart-line' },
        { id: 'users', label: 'Users', icon: 'fas fa-users' },
        { id: 'courses', label: 'Courses', icon: 'fas fa-graduation-cap' },
        { id: 'lessons', label: 'Lessons', icon: 'fas fa-book-open' },
        { id: 'enrollments', label: 'Enrollments', icon: 'fas fa-list-check' },
        { id: 'waitlist', label: 'Waitlist', icon: 'fas fa-bell' },
        { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn' },
        { id: 'inbox', label: 'Inbox', icon: 'fas fa-inbox' },
        { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar' },
        { id: 'settings', label: 'Settings', icon: 'fas fa-cog' }
    ];

    // Dashboard States
    const [loadingStats, setLoadingStats] = useState(true);
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: '-',
        totalEnrollments: '-',
        completions: '-',
        activeLearners: '-',
        waitlist: '-',
        totalCourses: coursesData.length
    });
    const [recentEnrollments, setRecentEnrollments] = useState([]);
    const [topCourses, setTopCourses] = useState([]);

    // Enhanced Dashboard & Authority States
    const [activityLogs, setActivityLogs] = useState([]);
    const [systemHealth, setSystemHealth] = useState({
        status: 'Operational',
        latencyMs: 0,
        dbConnected: true,
        lastPing: ''
    });
    const [categoryDistribution, setCategoryDistribution] = useState([]);
    const [totalPlatformValue, setTotalPlatformValue] = useState(0);

    // Users Tab States
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 20;

    const [drawerUser, setDrawerUser] = useState(null);
    const [drawerEnrollments, setDrawerEnrollments] = useState([]);
    const [loadingDrawer, setLoadingDrawer] = useState(false);

    const [adminModal, setAdminModal] = useState({ isOpen: false, user: null });
    const [resetModal, setResetModal] = useState({ isOpen: false, user: null });
    
    // Course Tab Modals
    const [courseModal, setCourseModal] = useState({ isOpen: false, course: null });
    const [deleteCourseModal, setDeleteCourseModal] = useState({ isOpen: false, course: null, enrollmentCount: 0 });

    // Data States
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isEditingCourse, setIsEditingCourse] = useState(false);

    // Lesson States
    const [selectedCourseForLessons, setSelectedCourseForLessons] = useState('');
    const [lessons, setLessons] = useState([]);
    const [lessonModal, setLessonModal] = useState({ isOpen: false, lesson: null });
    
    // Forms
    const [courseForm, setCourseForm] = useState({
        id: '', title: '', description: '', icon: 'fas fa-code', 
        category: 'web-development', category_label: 'Programming & Web Dev', 
        price: 0, is_placeholder: false, level: 'Beginner', is_visible: true
    });

    const [lessonForm, setLessonForm] = useState({
        title: '',
        content: '',
        video_url: '',
        duration_minutes: 10,
        order_index: 0,
        has_quiz: false,
        quiz_question: '',
        quiz_options: ['', '', '', ''],
        quiz_correct_index: 0,
        quiz_pass_score: 70
    });
    const [deleteLessonModal, setDeleteLessonModal] = useState({ isOpen: false, lessonId: null });
    
    // Enrollments States
    const [allEnrollments, setAllEnrollments] = useState([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState([]);
    const [enrollmentSearchQuery, setEnrollmentSearchQuery] = useState('');
    const [enrollmentCourseFilter, setEnrollmentCourseFilter] = useState('');
    const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('All');
    const [currentPageEnrollments, setCurrentPageEnrollments] = useState(1);
    const enrollmentsPerPage = 25;
    
    // Enrollment Modals
    const [resetEnrollmentModal, setResetEnrollmentModal] = useState({ isOpen: false, enrollment: null });
    const [removeEnrollmentModal, setRemoveEnrollmentModal] = useState({ isOpen: false, enrollment: null });
    
    // Waitlist States
    const [waitlistData, setWaitlistData] = useState([]);
    const [filteredWaitlist, setFilteredWaitlist] = useState([]);
    const [waitlistSearch, setWaitlistSearch] = useState('');
    const [deleteWaitlistModal, setDeleteWaitlistModal] = useState({ isOpen: false, entry: null });
    
    // Announcements States
    const [announcements, setAnnouncements] = useState([]);
    const [announcementModal, setAnnouncementModal] = useState({ isOpen: false, announcement: null });
    const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '', type: 'info', is_active: true });
    const [deleteAnnouncementModal, setDeleteAnnouncementModal] = useState({ isOpen: false, announcement: null });
    
    // Analytics States
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [enrollmentTimeData, setEnrollmentTimeData] = useState(null);
    const [coursePopularityData, setCoursePopularityData] = useState(null);
    const [completionRateData, setCompletionRateData] = useState(null);
    
    // Inbox States
    const [inboxSubTab, setInboxSubTab] = useState('compose');
    const [sentNotifications, setSentNotifications] = useState([]);
    const [inboxLoading, setInboxLoading] = useState(false);
    const [inboxSearch, setInboxSearch] = useState('');
    const [inboxPage, setInboxPage] = useState(0);
    const [composeForm, setComposeForm] = useState({ title: '', body: '', type: 'info', target_type: 'all', target_value: '' });
    const [composeTargetEmail, setComposeTargetEmail] = useState('');
    const [composeEmailError, setComposeEmailError] = useState('');
    const [composePreview, setComposePreview] = useState(false);
    const [deleteNotifModal, setDeleteNotifModal] = useState({ isOpen: false, notif: null });

    // Settings States
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [activeSettingsSection, setActiveSettingsSection] = useState('site');
    const [siteSettings, setSiteSettings] = useState({});
    const [originalSiteSettings, setOriginalSiteSettings] = useState({});
    const [adminProfileName, setAdminProfileName] = useState('');
    const [originalProfileName, setOriginalProfileName] = useState('');
    const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
    const [notifPrefs, setNotifPrefs] = useState({});
    const [originalNotifPrefs, setOriginalNotifPrefs] = useState({});
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [clearWaitlistModal, setClearWaitlistModal] = useState(false);
    const [resetProgressModal, setResetProgressModal] = useState(false);
    const [resetConfirmText, setResetConfirmText] = useState('');

    // Fetch live data when switching tabs
    useEffect(() => {
        if (isAdmin) {
            if (activeTab === 'overview') fetchDashboardStats();
            else if (activeTab === 'users') fetchUsers();
            else if (activeTab === 'courses') fetchCourses();
            else if (activeTab === 'lessons' && selectedCourseForLessons) fetchLessons(selectedCourseForLessons);
            else if (activeTab === 'enrollments') {
                if (courses.length === 0) fetchCourses();
                fetchAllEnrollments();
            }
            else if (activeTab === 'waitlist') fetchWaitlist();
            else if (activeTab === 'announcements') fetchAnnouncements();
            else if (activeTab === 'analytics') fetchAnalyticsData();
            else if (activeTab === 'inbox') fetchSentNotifications();
            else if (activeTab === 'settings') fetchAllSettings();
        }
    }, [activeTab, isAdmin]);

    // --- Fetchers ---
    const fetchDashboardStats = async () => {
        setLoadingStats(true);
        const startPing = performance.now();
        try {
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const endPing = performance.now();
            const latency = Math.round(endPing - startPing);

            const { count: enrollmentsCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });
            const { count: completionsCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('progress', 100);
            const { count: waitlistCount } = await supabase.from('course_waitlist').select('*', { count: 'exact', head: true });
            
            const { data: activeData } = await supabase.from('enrollments').select('user_id').gt('progress', 0).lt('progress', 100);
            const activeLearners = activeData ? new Set(activeData.map(d => d.user_id)).size : '-';

            setSystemHealth({
                status: 'Operational',
                latencyMs: latency || 38,
                dbConnected: true,
                lastPing: new Date().toLocaleTimeString()
            });

            setDashboardStats({
                totalUsers: usersCount ?? '-',
                totalEnrollments: enrollmentsCount ?? '-',
                completions: completionsCount ?? '-',
                activeLearners: activeLearners,
                waitlist: waitlistCount ?? '-',
                totalCourses: coursesData.length
            });

            const { data: recentData } = await supabase.from('enrollments')
                .select(`
                    user_id,
                    course_id,
                    enrolled_at,
                    progress,
                    profiles ( full_name, email ),
                    courses ( title, category, category_label, price )
                `)
                .order('enrolled_at', { ascending: false })
                .limit(10);
            setRecentEnrollments(recentData || []);

            const { data: allEnrollmentsData } = await supabase.from('enrollments').select(`
                course_id,
                progress,
                enrolled_at,
                profiles ( full_name, email ),
                courses ( title, category, category_label, price )
            `);

            if (allEnrollmentsData) {
                let estimatedValue = 0;
                const courseCounts = {};
                const catCounts = {};
                const logs = [];

                allEnrollmentsData.forEach(e => {
                    const cId = e.course_id;
                    const cTitle = e.courses?.title || 'Unknown Course';
                    const price = e.courses?.price || 0;
                    const categoryLabel = e.courses?.category_label || e.courses?.category || 'General';

                    estimatedValue += price;

                    if (!courseCounts[cId]) {
                        courseCounts[cId] = { id: cId, title: cTitle, count: 0 };
                    }
                    courseCounts[cId].count += 1;

                    catCounts[categoryLabel] = (catCounts[categoryLabel] || 0) + 1;

                    if (logs.length < 15) {
                        const userName = e.profiles?.full_name || 'Student';
                        if (e.progress === 100) {
                            logs.push({
                                id: `log-comp-${e.enrolled_at}-${cId}`,
                                icon: 'fas fa-award text-success',
                                title: 'Course Certificate Earned',
                                desc: `${userName} completed ${cTitle} (100%)`,
                                time: new Date(e.enrolled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            });
                        } else {
                            logs.push({
                                id: `log-enr-${e.enrolled_at}-${cId}`,
                                icon: 'fas fa-user-plus text-info',
                                title: 'New Course Enrollment',
                                desc: `${userName} enrolled in ${cTitle}`,
                                time: new Date(e.enrolled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            });
                        }
                    }
                });

                setTotalPlatformValue(estimatedValue);

                const sortedCourses = Object.values(courseCounts)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                setTopCourses(sortedCourses);

                const totalCatCount = Object.values(catCounts).reduce((a, b) => a + b, 0) || 1;
                const catArray = Object.entries(catCounts).map(([cat, count]) => ({
                    name: cat,
                    count,
                    percent: Math.round((count / totalCatCount) * 100)
                })).sort((a, b) => b.count - a.count);
                setCategoryDistribution(catArray);

                setActivityLogs(logs);
            }
            
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            setSystemHealth(prev => ({ ...prev, dbConnected: false, status: 'Degraded' }));
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchCourses = async () => {
        const { data: fetchedCourses, error } = await supabase
            .from('courses')
            .select('*')
            .order('title');
            
        if (error) {
            console.error("Error fetching courses:", error);
            setCourses([]);
            return;
        }
            
        const { data: enrollments } = await supabase.from('enrollments').select('course_id');
        
        if (fetchedCourses && enrollments) {
            const counts = {};
            enrollments.forEach(e => {
                counts[e.course_id] = (counts[e.course_id] || 0) + 1;
            });
            const enhancedCourses = fetchedCourses.map(c => ({
                ...c,
                enrollmentCount: counts[c.id] || 0
            }));
            setCourses(enhancedCourses);
        } else {
            setCourses(fetchedCourses || []);
        }
    };

    const fetchAllEnrollments = async () => {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                *,
                profiles(full_name, email),
                courses(title)
            `)
            .order('enrolled_at', { ascending: false });

        if (!error && data) {
            setAllEnrollments(data);
            return;
        }

        console.warn("Join failed, using fallback fetch:", error?.message);
        const { data: enrollData } = await supabase
            .from('enrollments')
            .select('*')
            .order('enrolled_at', { ascending: false });

        if (!enrollData || enrollData.length === 0) {
            setAllEnrollments([]);
            return;
        }

        const userIds = [...new Set(enrollData.map(e => e.user_id))];
        const courseIds = [...new Set(enrollData.map(e => e.course_id))];

        const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

        const { data: coursesDataList } = await supabase
            .from('courses')
            .select('id, title')
            .in('id', courseIds);

        const profileMap = {};
        (profilesData || []).forEach(p => { 
            profileMap[p.id] = { 
                email: p.email || p.full_name || 'Unknown',
                full_name: p.full_name || 'Unknown'
            }; 
        });
        const courseMap = {};
        (coursesDataList || []).forEach(c => { courseMap[c.id] = { title: c.title }; });

        const merged = enrollData.map(e => ({
            ...e,
            profiles: profileMap[e.user_id] || { email: 'Unknown' },
            courses: courseMap[e.course_id] || { title: 'Unknown Course' }
        }));

        setAllEnrollments(merged);
    };

    // Filter enrollments whenever dependencies change
    useEffect(() => {
        let result = [...allEnrollments];

        if (enrollmentSearchQuery.trim()) {
            const query = enrollmentSearchQuery.toLowerCase();
            result = result.filter(e => {
                const name = e.profiles?.full_name || e.profiles?.email || '';
                return name.toLowerCase().includes(query);
            });
        }

        if (enrollmentCourseFilter) {
            result = result.filter(e => e.course_id === enrollmentCourseFilter);
        }

        if (enrollmentStatusFilter !== 'All') {
            if (enrollmentStatusFilter === 'Completed') {
                result = result.filter(e => e.progress === 100);
            } else if (enrollmentStatusFilter === 'Not Started') {
                result = result.filter(e => e.progress === 0);
            } else if (enrollmentStatusFilter === 'In Progress') {
                result = result.filter(e => e.progress > 0 && e.progress < 100);
            }
        }

        setFilteredEnrollments(result);
        setCurrentPageEnrollments(1);
    }, [allEnrollments, enrollmentSearchQuery, enrollmentCourseFilter, enrollmentStatusFilter]);

    const fetchWaitlist = async () => {
        const { data, error } = await supabase
            .from('course_waitlist')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching waitlist:", error);
            setWaitlistData([]);
        } else {
            setWaitlistData(data || []);
        }
    };

    // Filter waitlist
    useEffect(() => {
        if (waitlistSearch.trim()) {
            const q = waitlistSearch.toLowerCase();
            setFilteredWaitlist(waitlistData.filter(w => (w.email || '').toLowerCase().includes(q)));
        } else {
            setFilteredWaitlist(waitlistData);
        }
    }, [waitlistData, waitlistSearch]);

    const handleDeleteWaitlistEntry = async () => {
        const target = deleteWaitlistModal.entry;
        if (!target) return;

        const { error } = await supabase
            .from('course_waitlist')
            .delete()
            .eq('id', target.id);

        if (error) {
            alert('Error deleting waitlist entry: ' + error.message);
        } else {
            setDeleteWaitlistModal({ isOpen: false, entry: null });
            fetchWaitlist();
        }
    };

    const exportWaitlistCSV = () => {
        if (filteredWaitlist.length === 0) return;
        const header = 'Email,Signed Up\n';
        const rows = filteredWaitlist.map(w => 
            `${w.email},${new Date(w.created_at).toLocaleDateString()}`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `waitlist_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- Announcements ---
    const fetchAnnouncements = async () => {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching announcements:", error);
            setAnnouncements([]);
        } else {
            setAnnouncements(data || []);
        }
    };

    const handleNewAnnouncement = () => {
        setAnnouncementForm({ title: '', body: '', type: 'info', is_active: true });
        setAnnouncementModal({ isOpen: true, announcement: null });
    };

    const handleEditAnnouncement = (ann) => {
        setAnnouncementForm({ title: ann.title, body: ann.body, type: ann.type, is_active: ann.is_active });
        setAnnouncementModal({ isOpen: true, announcement: ann });
    };

    const handleSaveAnnouncement = async () => {
        if (!announcementForm.title.trim() || !announcementForm.body.trim()) {
            alert('Title and body are required.');
            return;
        }

        let dbError;
        if (announcementModal.announcement) {
            const { error } = await supabase
                .from('announcements')
                .update(announcementForm)
                .eq('id', announcementModal.announcement.id);
            dbError = error;
        } else {
            const { error } = await supabase
                .from('announcements')
                .insert([announcementForm]);
            dbError = error;
        }

        if (dbError) {
            alert('Error saving announcement. Did you run the announcements SQL migration? Details: ' + dbError.message);
        } else {
            setAnnouncementModal({ isOpen: false, announcement: null });
            fetchAnnouncements();
        }
    };

    const toggleAnnouncementActive = async (ann) => {
        const { error } = await supabase
            .from('announcements')
            .update({ is_active: !ann.is_active })
            .eq('id', ann.id);

        if (error) {
            alert('Error toggling announcement: ' + error.message);
        } else {
            fetchAnnouncements();
        }
    };

    const handleDeleteAnnouncement = async () => {
        const target = deleteAnnouncementModal.announcement;
        if (!target) return;

        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', target.id);

        if (error) {
            alert('Error deleting announcement: ' + error.message);
        } else {
            setDeleteAnnouncementModal({ isOpen: false, announcement: null });
            fetchAnnouncements();
        }
    };

    // --- Analytics ---
    const fetchAnalyticsData = async () => {
        setAnalyticsLoading(true);
        try {
            const { data: enrollments, error } = await supabase
                .from('enrollments')
                .select('course_id, progress, enrolled_at');

            if (error) {
                console.error('Analytics fetch error:', error);
                setAnalyticsLoading(false);
                return;
            }

            const now = new Date();
            const last30 = [];
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                last30.push(d.toISOString().split('T')[0]);
            }
            const countsByDate = {};
            last30.forEach(d => countsByDate[d] = 0);
            (enrollments || []).forEach(e => {
                if (e.enrolled_at) {
                    const day = new Date(e.enrolled_at).toISOString().split('T')[0];
                    if (countsByDate[day] !== undefined) countsByDate[day]++;
                }
            });
            setEnrollmentTimeData({
                labels: last30.map(d => {
                    const dt = new Date(d + 'T00:00:00');
                    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'Enrollments',
                    data: last30.map(d => countsByDate[d]),
                    borderColor: '#36a2eb',
                    backgroundColor: 'rgba(54,162,235,0.15)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                }]
            });

            const popMap = {};
            (enrollments || []).forEach(e => {
                popMap[e.course_id] = (popMap[e.course_id] || 0) + 1;
            });
            const popSorted = Object.entries(popMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            const popLabels = popSorted.map(([cid]) => {
                const cd = coursesData.find(c => c.id === cid);
                return cd ? cd.title : cid;
            });
            const popValues = popSorted.map(([, count]) => count);
            setCoursePopularityData({
                labels: popLabels,
                datasets: [{
                    label: 'Enrollments',
                    data: popValues,
                    backgroundColor: [
                        '#36a2eb', '#ff6384', '#ffce56', '#4bc0c0', '#9966ff',
                        '#ff9f40', '#c9cbcf', '#7bc8a4', '#e7667e', '#68b3c8'
                    ],
                    borderRadius: 6,
                }]
            });

            const courseStats = {};
            (enrollments || []).forEach(e => {
                if (!courseStats[e.course_id]) courseStats[e.course_id] = { total: 0, completed: 0 };
                courseStats[e.course_id].total++;
                if (e.progress >= 100) courseStats[e.course_id].completed++;
            });
            const compEntries = Object.entries(courseStats)
                .map(([cid, stats]) => ({
                    id: cid,
                    label: coursesData.find(c => c.id === cid)?.title || cid,
                    rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
                }))
                .sort((a, b) => b.rate - a.rate);

            const compColors = compEntries.map(e =>
                e.rate >= 70 ? '#22c55e' : e.rate >= 40 ? '#eab308' : '#ef4444'
            );
            setCompletionRateData({
                labels: compEntries.map(e => e.label),
                datasets: [{
                    label: 'Completion %',
                    data: compEntries.map(e => e.rate),
                    backgroundColor: compColors,
                    borderRadius: 6,
                }]
            });
        } catch (err) {
            console.error('Analytics error:', err);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // --- Inbox ---
    const fetchSentNotifications = async () => {
        setInboxLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*, notification_reads(id)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setSentNotifications((data || []).map(n => ({ ...n, readCount: n.notification_reads?.length || 0 })));
        } catch (err) {
            console.error('Fetch notifications error:', err);
            setSentNotifications([]);
        } finally {
            setInboxLoading(false);
        }
    };

    const lookupUserByEmail = async (email) => {
        setComposeEmailError('');
        if (!email.trim()) return;
        const { data, error } = await supabase.from('profiles').select('id, email').eq('email', email.trim()).single();
        if (error || !data) {
            setComposeEmailError('User not found with this email.');
            setComposeForm(f => ({ ...f, target_value: '' }));
        } else {
            setComposeEmailError('');
            setComposeForm(f => ({ ...f, target_value: data.id }));
        }
    };

    const sendNotification = async () => {
        if (!composeForm.title.trim() || !composeForm.body.trim()) {
            showToast('Title and body are required.', 'error');
            return;
        }
        if (composeForm.target_type === 'specific' && !composeForm.target_value) {
            showToast('Please enter a valid user email.', 'error');
            return;
        }
        if (composeForm.target_type === 'category' && !composeForm.target_value) {
            showToast('Please select a course.', 'error');
            return;
        }
        try {
            const payload = {
                title: composeForm.title,
                body: composeForm.body,
                type: composeForm.type,
                target_type: composeForm.target_type,
                target_value: composeForm.target_type === 'all' ? null : composeForm.target_value,
                sender_id: user?.id,
            };
            const { error } = await supabase.from('notifications').insert([payload]);
            if (error) throw error;
            const targetDesc = composeForm.target_type === 'all' ? 'All Users' : composeForm.target_type === 'category' ? `Course: ${coursesData.find(c => c.id === composeForm.target_value)?.title || composeForm.target_value}` : composeTargetEmail;
            showToast(`Notification sent to ${targetDesc}!`);
            setComposeForm({ title: '', body: '', type: 'info', target_type: 'all', target_value: '' });
            setComposeTargetEmail('');
            setComposePreview(false);
            fetchSentNotifications();
        } catch (err) {
            showToast('Error sending notification: ' + err.message, 'error');
        }
    };

    const deleteNotification = async () => {
        const target = deleteNotifModal.notif;
        if (!target) return;
        try {
            const { error } = await supabase.from('notifications').delete().eq('id', target.id);
            if (error) throw error;
            setDeleteNotifModal({ isOpen: false, notif: null });
            fetchSentNotifications();
            showToast('Notification deleted.');
        } catch (err) {
            showToast('Error deleting notification: ' + err.message, 'error');
        }
    };

    // --- Settings ---
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const fetchAllSettings = async () => {
        setSettingsLoading(true);
        try {
            const { data: settingsRows } = await supabase.from('site_settings').select('*');
            const map = {};
            (settingsRows || []).forEach(r => { map[r.key] = r.value; });
            setSiteSettings(map);
            setOriginalSiteSettings({ ...map });

            const nPrefs = {
                notify_admin_new_user: map.notify_admin_new_user || 'false',
                notify_admin_waitlist: map.notify_admin_waitlist || 'false',
                notify_admin_completion: map.notify_admin_completion || 'false',
            };
            setNotifPrefs(nPrefs);
            setOriginalNotifPrefs({ ...nPrefs });

            if (user) {
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                const name = profile?.full_name || '';
                setAdminProfileName(name);
                setOriginalProfileName(name);
            }
        } catch (err) {
            console.error('Settings fetch error:', err);
        } finally {
            setSettingsLoading(false);
        }
    };

    const isSiteSettingsDirty = () => JSON.stringify(siteSettings) !== JSON.stringify(originalSiteSettings);
    const isProfileDirty = () => adminProfileName !== originalProfileName;
    const isNotifDirty = () => JSON.stringify(notifPrefs) !== JSON.stringify(originalNotifPrefs);

    const saveSiteSettings = async () => {
        try {
            const siteKeys = ['site_name', 'site_tagline', 'support_email', 'hero_cta_text', 'hero_cta_link', 'announcement_bar_text', 'announcement_bar_enabled', 'maintenance_mode', 'allow_new_signups'];
            const upserts = siteKeys.map(key => ({ key, value: siteSettings[key] || '', updated_at: new Date().toISOString() }));
            const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' });
            if (error) throw error;
            setOriginalSiteSettings({ ...siteSettings });
            showToast('Site settings saved successfully!');
        } catch (err) {
            showToast('Error saving site settings: ' + err.message, 'error');
        }
    };

    const updateAdminProfile = async () => {
        try {
            const { error } = await supabase.from('profiles').update({ full_name: adminProfileName }).eq('id', user.id);
            if (error) throw error;
            setOriginalProfileName(adminProfileName);
            showToast('Profile updated successfully!');
        } catch (err) {
            showToast('Error updating profile: ' + err.message, 'error');
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
            showToast('Please fill in all password fields.', 'error');
            return;
        }
        if (passwordForm.newPass.length < 8) {
            showToast('New password must be at least 8 characters.', 'error');
            return;
        }
        if (passwordForm.newPass !== passwordForm.confirm) {
            showToast('New passwords do not match.', 'error');
            return;
        }
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: passwordForm.current,
            });
            if (signInError) {
                showToast('Current password is incorrect.', 'error');
                return;
            }
            const { error: updateError } = await supabase.auth.updateUser({ password: passwordForm.newPass });
            if (updateError) throw updateError;
            setPasswordForm({ current: '', newPass: '', confirm: '' });
            showToast('Password changed successfully!');
        } catch (err) {
            showToast('Error changing password: ' + err.message, 'error');
        }
    };

    const saveNotificationPrefs = async () => {
        try {
            const upserts = Object.entries(notifPrefs).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
            const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' });
            if (error) throw error;
            setOriginalNotifPrefs({ ...notifPrefs });
            showToast('Notification preferences saved!');
        } catch (err) {
            showToast('Error saving notification preferences: ' + err.message, 'error');
        }
    };

    const handleClearWaitlist = async () => {
        try {
            const { error } = await supabase.from('course_waitlist').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (error) throw error;
            setClearWaitlistModal(false);
            showToast('All waitlist emails cleared.');
        } catch (err) {
            showToast('Error clearing waitlist: ' + err.message, 'error');
        }
    };

    const handleResetAllProgress = async () => {
        try {
            const { error } = await supabase.from('enrollments').update({ progress: 0, completed_lessons: [] }).neq('user_id', '00000000-0000-0000-0000-000000000000');
            if (error) throw error;
            setResetProgressModal(false);
            setResetConfirmText('');
            showToast('All user progress has been reset.');
        } catch (err) {
            showToast('Error resetting progress: ' + err.message, 'error');
        }
    };

    const handleExportBackup = async () => {
        try {
            showToast('Generating backup...', 'success');
            const [profilesRes, enrollmentsRes, lessonsRes, announcementsRes, settingsRes] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('enrollments').select('*'),
                supabase.from('lessons').select('*'),
                supabase.from('announcements').select('*'),
                supabase.from('site_settings').select('*'),
            ]);
            const backup = {
                exportedAt: new Date().toISOString(),
                profiles: profilesRes.data || [],
                enrollments: enrollmentsRes.data || [],
                lessons: lessonsRes.data || [],
                announcements: announcementsRes.data || [],
                siteSettings: settingsRes.data || [],
                courses: coursesData,
            };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pccharm-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Backup exported successfully!');
        } catch (err) {
            showToast('Error exporting backup: ' + err.message, 'error');
        }
    };

    const fetchUsers = async () => {
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');

        if (profilesError) console.error("Error fetching profiles:", profilesError);

        const { data: enrollments } = await supabase.from('enrollments').select('user_id');
        
        if (profiles && enrollments) {
            const counts = {};
            enrollments.forEach(e => {
                counts[e.user_id] = (counts[e.user_id] || 0) + 1;
            });
            const enhancedUsers = profiles.map(p => ({
                ...p,
                enrollmentCount: counts[p.id] || 0
            })).sort((a, b) => {
                if (b.enrollmentCount !== a.enrollmentCount) return b.enrollmentCount - a.enrollmentCount;
                if (b.is_admin !== a.is_admin) return b.is_admin ? 1 : -1;
                return 0;
            });
            
            setUsers(enhancedUsers);
        } else {
            setUsers(profiles || []);
        }
    };

    // --- Course Handlers ---
    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        setSelectedCourseForLessons(course.id);
        setIsEditingCourse(false);
        setActiveTab('lessons');
    };

    const handleNewCourse = () => {
        setCourseForm({
            id: '', title: '', description: '', icon: 'fas fa-code', 
            category: 'web-development', category_label: 'Programming & Web Dev', 
            price: 0, is_placeholder: false, level: 'Beginner', is_visible: true
        });
        setCourseModal({ isOpen: true, course: null });
    };

    const handleEditCourse = (course) => {
        setCourseForm({ 
            ...course, 
            level: course.level || 'Beginner', 
            is_visible: course.is_visible !== false 
        });
        setCourseModal({ isOpen: true, course });
    };

    const saveCourse = async () => {
        if (!courseForm.id && !courseForm.title) {
            alert("Title is required");
            return;
        }

        const courseId = courseForm.id || courseForm.title.toLowerCase().replace(/\s+/g, '-');
        const payload = { ...courseForm, id: courseId };
        
        delete payload.enrollmentCount;

        const { data, error } = await supabase
            .from('courses')
            .upsert(payload)
            .select();

        if (error) {
            alert('Error saving course: ' + error.message);
        } else {
            setCourseModal({ isOpen: false, course: null });
            fetchCourses();
        }
    };

    const handleDeleteCourseConfirm = (course) => {
        setDeleteCourseModal({ isOpen: true, course, enrollmentCount: course.enrollmentCount || 0 });
    };

    const executeDeleteCourse = async () => {
        const target = deleteCourseModal.course;
        if (!target) return;
        const { error } = await supabase.from('courses').delete().eq('id', target.id);
        if (error) {
            alert('Error deleting course: ' + error.message);
        } else {
            setDeleteCourseModal({ isOpen: false, course: null, enrollmentCount: 0 });
            if (selectedCourse?.id === target.id) setSelectedCourse(null);
            fetchCourses();
        }
    };

    const toggleCourseVisibility = async (courseId, currentVisibility) => {
        const { error } = await supabase
            .from('courses')
            .update({ is_visible: !currentVisibility })
            .eq('id', courseId);
        if (error) {
            alert('Error updating visibility. Did you run the SQL update? Details: ' + error.message);
        } else {
            fetchCourses();
        }
    };

    // --- Lesson Handlers ---
    const fetchLessons = async (courseId) => {
        if (!courseId) {
            setLessons([]);
            return;
        }
        const { data } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order_index', { ascending: true })
            .order('order', { ascending: true });
        
        const formattedLessons = (data || []).map((l, i) => ({
            ...l,
            order_index: typeof l.order_index === 'number' ? l.order_index : (l.order || i + 1)
        })).sort((a, b) => a.order_index - b.order_index);

        setLessons(formattedLessons);
    };

    useEffect(() => {
        if (selectedCourseForLessons) {
            fetchLessons(selectedCourseForLessons);
        } else {
            setLessons([]);
        }
    }, [selectedCourseForLessons]);

    const handleNewLesson = () => {
        setLessonModal({ isOpen: true, lesson: null });
        setLessonForm({
            title: '',
            content: '',
            video_url: '',
            duration_minutes: 10,
            order_index: lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index || 0)) + 1 : 1,
            modulePlacement: '',
            has_quiz: false,
            quiz_question: '',
            quiz_options: ['', '', '', ''],
            quiz_correct_index: 0,
            quiz_pass_score: 70
        });
    };

    const handleNewModule = async () => {
        if (!selectedCourseForLessons) {
            alert('Please select a course first');
            return;
        }
        const moduleName = window.prompt("Enter the module name (e.g., 'Introduction to C'):");
        if (!moduleName || !moduleName.trim()) return;

        const existingModules = lessons.filter(l => l.title?.toLowerCase().startsWith('module '));
        const nextModuleNum = existingModules.length + 1;

        const nextOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index || 0)) + 1 : 1;
        const payload = {
            course_id: selectedCourseForLessons,
            title: `Module ${nextModuleNum}: ${moduleName.trim()}`,
            content: '',
            video_url: '',
            duration_minutes: 0,
            order_index: nextOrder,
            order: nextOrder,
            has_quiz: false
        };

        const { error } = await supabase.from('lessons').insert([payload]);
        if (error) {
            alert('Error creating module: ' + error.message);
        } else {
            fetchLessons(selectedCourseForLessons);
        }
    };

    const handleEditLesson = (lesson) => {
        setLessonModal({ isOpen: true, lesson });
        setLessonForm({
            title: lesson.title || '',
            content: lesson.content || '',
            video_url: lesson.video_url || '',
            duration_minutes: lesson.duration_minutes || 10,
            order_index: lesson.order_index || lesson.order || 1,
            has_quiz: lesson.has_quiz || false,
            quiz_question: lesson.quiz_question || '',
            quiz_options: lesson.quiz_options || ['', '', '', ''],
            quiz_correct_index: lesson.quiz_correct_index || 0,
            quiz_pass_score: lesson.quiz_pass_score || 70
        });
    };

    const handleSaveLesson = async () => {
        if (!lessonForm.title.trim()) {
            alert('Please enter a lesson title');
            return;
        }
        if (!selectedCourseForLessons) {
            alert('Please select a course first');
            return;
        }

        let finalOrderIndex = lessonForm.order_index;
        const isNewLesson = !lessonModal.lesson;

        if (isNewLesson && lessonForm.modulePlacement) {
            const moduleHeaderIndex = lessons.findIndex(l => l.id === lessonForm.modulePlacement);
            if (moduleHeaderIndex !== -1) {
                const nextModuleIndex = lessons.findIndex((l, index) => 
                    index > moduleHeaderIndex && l.title?.toLowerCase().startsWith('module ')
                );

                if (nextModuleIndex === -1) {
                    finalOrderIndex = lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index || 0)) + 1 : 1;
                } else {
                    const nextModule = lessons[nextModuleIndex];
                    finalOrderIndex = nextModule.order_index;
                    
                    const itemsToShift = lessons.filter(l => l.order_index >= finalOrderIndex);
                    await Promise.all(itemsToShift.map(l => 
                        supabase.from('lessons').update({ order_index: l.order_index + 1, order: l.order_index + 1 }).eq('id', l.id)
                    ));
                }
            }
        }

        const payload = {
            course_id: selectedCourseForLessons,
            title: lessonForm.title,
            content: lessonForm.content,
            video_url: lessonForm.video_url,
            duration_minutes: lessonForm.duration_minutes,
            has_quiz: lessonForm.has_quiz,
            quiz_question: lessonForm.quiz_question,
            quiz_options: lessonForm.quiz_options,
            quiz_correct_index: lessonForm.quiz_correct_index,
            quiz_pass_score: lessonForm.quiz_pass_score,
            order_index: finalOrderIndex,
            order: finalOrderIndex
        };

        let dbError;

        if (lessonModal.lesson) {
            const { error } = await supabase
                .from('lessons')
                .update(payload)
                .eq('id', lessonModal.lesson.id);
            dbError = error;
        } else {
            const { error } = await supabase
                .from('lessons')
                .insert([payload]);
            dbError = error;
        }

        if (dbError) {
            alert('Error saving lesson. Did you run the lessons_update.sql script? Details: ' + dbError.message);
        } else {
            setLessonModal({ isOpen: false, lesson: null });
            fetchLessons(selectedCourseForLessons);
        }
    };

    const handleDeleteLessonConfirm = (lesson) => {
        setDeleteLessonModal({ isOpen: true, lessonId: lesson.id });
    };

    const executeDeleteLesson = async () => {
        const targetId = deleteLessonModal.lessonId;
        if (!targetId) return;
        
        const { error } = await supabase.from('lessons').delete().eq('id', targetId);
        if (error) {
            alert('Error deleting lesson: ' + error.message);
        } else {
            setDeleteLessonModal({ isOpen: false, lessonId: null });
            fetchLessons(selectedCourseForLessons);
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        
        const items = Array.from(lessons);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            order_index: index + 1
        }));
        setLessons(updatedItems);

        try {
            const updates = updatedItems.map(item => 
                supabase.from('lessons').update({ order_index: item.order_index, order: item.order_index }).eq('id', item.id)
            );
            await Promise.all(updates);
        } catch (error) {
            console.error('Error updating order:', error);
            fetchLessons(selectedCourseForLessons);
        }
    };

    // --- Enrollments Handlers ---
    const handleResetEnrollment = async () => {
        const target = resetEnrollmentModal.enrollment;
        if (!target) return;
        
        const { error } = await supabase
            .from('enrollments')
            .update({ progress: 0, completed_lessons: [] })
            .eq('id', target.id);
            
        if (error) {
            alert('Error resetting progress. Did you run the enrollments_admin_policy.sql script? Details: ' + error.message);
        } else {
            setResetEnrollmentModal({ isOpen: false, enrollment: null });
            fetchAllEnrollments();
        }
    };

    const handleRemoveEnrollment = async () => {
        const target = removeEnrollmentModal.enrollment;
        if (!target) return;
        
        const { error } = await supabase
            .from('enrollments')
            .delete()
            .eq('id', target.id);
            
        if (error) {
            alert('Error removing enrollment. Did you run the enrollments_admin_policy.sql script? Details: ' + error.message);
        } else {
            setRemoveEnrollmentModal({ isOpen: false, enrollment: null });
            fetchAllEnrollments();
        }
    };

    // --- Users Handlers ---
    const toggleAdminStatus = async () => {
        const targetUser = adminModal.user;
        if (!targetUser) return;
        
        if (targetUser.id === user.id) {
            alert("You cannot change your own admin status.");
            setAdminModal({ isOpen: false, user: null });
            return;
        }

        const newStatus = !targetUser.is_admin;
        const { error } = await supabase.rpc('toggle_admin_status', { 
            target_user_id: targetUser.id, 
            new_status: newStatus 
        });
            
        if (error) {
            alert('Error updating admin status. Did you run the SQL RPC script? Details: ' + error.message);
        } else {
            setUsers(users.map(u => u.id === targetUser.id ? { ...u, is_admin: newStatus } : u));
        }
        setAdminModal({ isOpen: false, user: null });
    };

    const resetUserProgress = async () => {
        const targetUser = resetModal.user;
        if (!targetUser) return;

        const { error } = await supabase.rpc('reset_user_progress', {
            target_user_id: targetUser.id
        });

        if (error) {
            alert('Error resetting progress. Did you run the SQL RPC script? Details: ' + error.message);
        } else {
            if (drawerUser && drawerUser.id === targetUser.id) {
                openUserDrawer(targetUser);
            }
        }
        setResetModal({ isOpen: false, user: null });
    };

    const openUserDrawer = async (u) => {
        setDrawerUser(u);
        setLoadingDrawer(true);
        const { data } = await supabase
            .from('enrollments')
            .select(`
                *,
                courses (*)
            `)
            .eq('user_id', u.id);
        setDrawerEnrollments(data || []);
        setLoadingDrawer(false);
    };

    const closeUserDrawer = () => {
        setDrawerUser(null);
        setDrawerEnrollments([]);
    };

    const filteredUsers = users.filter(u => 
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="loader"></div></div>;
    if (!isAdmin) return null;

    return (
        <div className="d-flex w-100 overflow-hidden bg-dark" style={{ height: '100vh', paddingTop: '70px' }}>
            {/* Sidebar */}
            <div className="glass-card rounded-0 border-end border-secondary border-opacity-25 d-none d-md-flex flex-column" style={{ width: '260px', flexShrink: 0, height: '100%', overflowY: 'auto' }}>
                <div className="p-4 border-bottom border-secondary border-opacity-25 text-center">
                    <h5 className="mb-0 text-white fw-bold"><i className="fas fa-cogs me-2 text-info"></i>Admin Panel</h5>
                </div>
                <div className="list-group list-group-flush p-3 flex-grow-1">
                    {adminTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`list-group-item list-group-item-action bg-transparent border-0 mb-2 py-2 px-3 rounded text-start fw-medium ${activeTab === tab.id ? 'active bg-info bg-opacity-25 text-info' : 'text-muted hover-text-white'}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ transition: 'all 0.2s', outline: 'none', boxShadow: 'none' }}
                        >
                            <i className={`${tab.icon} fa-fw me-3`}></i>{tab.label}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-top border-secondary border-opacity-25">
                    <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2" onClick={() => navigate('/dashboard')}>
                        <i className="fas fa-arrow-left"></i>Exit Admin
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Toggle (Visible only on mobile) */}
            <div className="d-md-none bg-dark border-bottom border-secondary border-opacity-25 p-3 d-flex justify-content-between align-items-center position-fixed w-100 z-3" style={{ top: '70px' }}>
                <span className="fw-bold text-info"><i className="fas fa-cogs me-2"></i>Admin</span>
                <select 
                    className="form-select bg-dark text-white border-secondary w-auto" 
                    value={activeTab} 
                    onChange={(e) => setActiveTab(e.target.value)}
                >
                    {adminTabs.map(tab => (
                        <option key={tab.id} value={tab.id}>{tab.label}</option>
                    ))}
                </select>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow-1 overflow-auto position-relative h-100 p-4 p-md-5" style={{ marginTop: '50px', paddingBottom: '100px' }}>
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <OverviewTab
                        loadingStats={loadingStats}
                        dashboardStats={dashboardStats}
                        recentEnrollments={recentEnrollments}
                        topCourses={topCourses}
                        activityLogs={activityLogs}
                        systemHealth={systemHealth}
                        categoryDistribution={categoryDistribution}
                        totalPlatformValue={totalPlatformValue}
                        fetchDashboardStats={fetchDashboardStats}
                        setActiveTab={setActiveTab}
                        exportWaitlistCSV={exportWaitlistCSV}
                        handleClearWaitlist={handleClearWaitlist}
                        setAnnouncementModal={setAnnouncementModal}
                        setCourseModal={setCourseModal}
                        showToast={showToast}
                        setInboxSubTab={setInboxSubTab}
                    />
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <UsersTab
                        users={users}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        paginatedUsers={paginatedUsers}
                        filteredUsers={filteredUsers}
                        totalPages={totalPages}
                        usersPerPage={usersPerPage}
                        drawerUser={drawerUser}
                        drawerEnrollments={drawerEnrollments}
                        loadingDrawer={loadingDrawer}
                        openUserDrawer={openUserDrawer}
                        closeUserDrawer={closeUserDrawer}
                        adminModal={adminModal}
                        setAdminModal={setAdminModal}
                        resetModal={resetModal}
                        setResetModal={setResetModal}
                        toggleAdminStatus={toggleAdminStatus}
                        resetUserProgress={resetUserProgress}
                        fetchUsers={fetchUsers}
                        user={user}
                    />
                )}

                {/* COURSES TAB */}
                {activeTab === 'courses' && (
                    <CoursesTab
                        courses={courses}
                        courseModal={courseModal}
                        setCourseModal={setCourseModal}
                        courseForm={courseForm}
                        setCourseForm={setCourseForm}
                        deleteCourseModal={deleteCourseModal}
                        setDeleteCourseModal={setDeleteCourseModal}
                        handleNewCourse={handleNewCourse}
                        handleEditCourse={handleEditCourse}
                        saveCourse={saveCourse}
                        handleDeleteCourseConfirm={handleDeleteCourseConfirm}
                        executeDeleteCourse={executeDeleteCourse}
                        toggleCourseVisibility={toggleCourseVisibility}
                        handleCourseSelect={handleCourseSelect}
                    />
                )}

                {/* LESSONS TAB */}
                {activeTab === 'lessons' && (
                    <LessonsTab
                        courses={courses}
                        selectedCourseForLessons={selectedCourseForLessons}
                        setSelectedCourseForLessons={setSelectedCourseForLessons}
                        lessons={lessons}
                        lessonModal={lessonModal}
                        setLessonModal={setLessonModal}
                        lessonForm={lessonForm}
                        setLessonForm={setLessonForm}
                        deleteLessonModal={deleteLessonModal}
                        setDeleteLessonModal={setDeleteLessonModal}
                        handleNewLesson={handleNewLesson}
                        handleNewModule={handleNewModule}
                        handleEditLesson={handleEditLesson}
                        handleSaveLesson={handleSaveLesson}
                        handleDeleteLessonConfirm={handleDeleteLessonConfirm}
                        executeDeleteLesson={executeDeleteLesson}
                        onDragEnd={onDragEnd}
                    />
                )}

                {/* ENROLLMENTS TAB */}
                {activeTab === 'enrollments' && (
                    <EnrollmentsTab
                        filteredEnrollments={filteredEnrollments}
                        courses={courses}
                        enrollmentSearchQuery={enrollmentSearchQuery}
                        setEnrollmentSearchQuery={setEnrollmentSearchQuery}
                        enrollmentCourseFilter={enrollmentCourseFilter}
                        setEnrollmentCourseFilter={setEnrollmentCourseFilter}
                        enrollmentStatusFilter={enrollmentStatusFilter}
                        setEnrollmentStatusFilter={setEnrollmentStatusFilter}
                        currentPageEnrollments={currentPageEnrollments}
                        setCurrentPageEnrollments={setCurrentPageEnrollments}
                        enrollmentsPerPage={enrollmentsPerPage}
                        resetEnrollmentModal={resetEnrollmentModal}
                        setResetEnrollmentModal={setResetEnrollmentModal}
                        removeEnrollmentModal={removeEnrollmentModal}
                        setRemoveEnrollmentModal={setRemoveEnrollmentModal}
                        handleResetEnrollment={handleResetEnrollment}
                        handleRemoveEnrollment={handleRemoveEnrollment}
                    />
                )}

                {/* WAITLIST TAB */}
                {activeTab === 'waitlist' && (
                    <WaitlistTab
                        filteredWaitlist={filteredWaitlist}
                        waitlistSearch={waitlistSearch}
                        setWaitlistSearch={setWaitlistSearch}
                        deleteWaitlistModal={deleteWaitlistModal}
                        setDeleteWaitlistModal={setDeleteWaitlistModal}
                        handleDeleteWaitlistEntry={handleDeleteWaitlistEntry}
                        exportWaitlistCSV={exportWaitlistCSV}
                    />
                )}

                {/* ANNOUNCEMENTS TAB */}
                {activeTab === 'announcements' && (
                    <AnnouncementsTab
                        announcements={announcements}
                        announcementModal={announcementModal}
                        setAnnouncementModal={setAnnouncementModal}
                        announcementForm={announcementForm}
                        setAnnouncementForm={setAnnouncementForm}
                        deleteAnnouncementModal={deleteAnnouncementModal}
                        setDeleteAnnouncementModal={setDeleteAnnouncementModal}
                        handleNewAnnouncement={handleNewAnnouncement}
                        handleEditAnnouncement={handleEditAnnouncement}
                        handleSaveAnnouncement={handleSaveAnnouncement}
                        toggleAnnouncementActive={toggleAnnouncementActive}
                        handleDeleteAnnouncement={handleDeleteAnnouncement}
                    />
                )}

                {/* INBOX TAB */}
                {activeTab === 'inbox' && (
                    <InboxTab
                        inboxSubTab={inboxSubTab}
                        setInboxSubTab={setInboxSubTab}
                        sentNotifications={sentNotifications}
                        inboxLoading={inboxLoading}
                        inboxSearch={inboxSearch}
                        setInboxSearch={setInboxSearch}
                        inboxPage={inboxPage}
                        setInboxPage={setInboxPage}
                        composeForm={composeForm}
                        setComposeForm={setComposeForm}
                        composeTargetEmail={composeTargetEmail}
                        setComposeTargetEmail={setComposeTargetEmail}
                        composeEmailError={composeEmailError}
                        setComposeEmailError={setComposeEmailError}
                        composePreview={composePreview}
                        setComposePreview={setComposePreview}
                        deleteNotifModal={deleteNotifModal}
                        setDeleteNotifModal={setDeleteNotifModal}
                        sendNotification={sendNotification}
                        deleteNotification={deleteNotification}
                        lookupUserByEmail={lookupUserByEmail}
                    />
                )}

                {/* ANALYTICS TAB */}
                {activeTab === 'analytics' && (
                    <AnalyticsTab
                        analyticsLoading={analyticsLoading}
                        enrollmentTimeData={enrollmentTimeData}
                        coursePopularityData={coursePopularityData}
                        completionRateData={completionRateData}
                        fetchAnalyticsData={fetchAnalyticsData}
                    />
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <SettingsTab
                        settingsLoading={settingsLoading}
                        activeSettingsSection={activeSettingsSection}
                        setActiveSettingsSection={setActiveSettingsSection}
                        siteSettings={siteSettings}
                        setSiteSettings={setSiteSettings}
                        saveSiteSettings={saveSiteSettings}
                        user={user}
                        adminProfileName={adminProfileName}
                        setAdminProfileName={setAdminProfileName}
                        updateAdminProfile={updateAdminProfile}
                        passwordForm={passwordForm}
                        setPasswordForm={setPasswordForm}
                        handleChangePassword={handleChangePassword}
                        notifPrefs={notifPrefs}
                        setNotifPrefs={setNotifPrefs}
                        saveNotificationPrefs={saveNotificationPrefs}
                        clearWaitlistModal={clearWaitlistModal}
                        setClearWaitlistModal={setClearWaitlistModal}
                        resetProgressModal={resetProgressModal}
                        setResetProgressModal={setResetProgressModal}
                        resetConfirmText={resetConfirmText}
                        setResetConfirmText={setResetConfirmText}
                        handleClearWaitlist={handleClearWaitlist}
                        handleResetAllProgress={handleResetAllProgress}
                        handleExportBackup={handleExportBackup}
                        isSiteSettingsDirty={isSiteSettingsDirty}
                        isProfileDirty={isProfileDirty}
                        isNotifDirty={isNotifDirty}
                    />
                )}

                {/* UNKNOWN TAB FALLBACK */}
                {!['overview', 'users', 'courses', 'lessons', 'enrollments', 'waitlist', 'announcements', 'inbox', 'analytics', 'settings'].includes(activeTab) && (
                    <div className="animate-fade-in h-100 d-flex flex-column align-items-center justify-content-center text-muted text-center pt-5">
                        <div className="glass-card p-5" style={{ maxWidth: '400px' }}>
                            <i className={`${adminTabs.find(t => t.id === activeTab)?.icon} fs-1 mb-4 text-info opacity-75`} style={{ fontSize: '3rem' }}></i>
                            <h4 className="text-white mb-3">{adminTabs.find(t => t.id === activeTab)?.label} Module</h4>
                            <p className="mb-0">This module is scheduled for development in Phase 2 (AP-2).</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Global Toast Notification */}
            {toast.show && (
                <div className="position-fixed bottom-0 end-0 p-3 z-3" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <div className={`alert ${toast.type === 'error' ? 'alert-danger' : 'alert-success'} alert-dismissible shadow-lg mb-0 d-flex align-items-center`} style={{ minWidth: '300px' }}>
                        <i className={`fas ${toast.type === 'error' ? 'fa-times-circle' : 'fa-check-circle'} me-2 fs-5`}></i>
                        <span>{toast.message}</span>
                        <button type="button" className="btn-close" onClick={() => setToast({ ...toast, show: false })}></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShell;
