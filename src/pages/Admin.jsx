import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { coursesData } from '../data/courses';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, Filler
);

const Admin = () => {
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
    const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('All'); // All, In Progress, Completed, Not Started
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
        try {
            // 1. Total Users
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            // 2. Total Enrollments
            const { count: enrollmentsCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });
            // 3. Completions
            const { count: completionsCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('progress', 100);
            // 4. Waitlist Signups
            const { count: waitlistCount } = await supabase.from('course_waitlist').select('*', { count: 'exact', head: true });
            
            // Active Learners
            const { data: activeData } = await supabase.from('enrollments').select('user_id').gt('progress', 0).lt('progress', 100);
            const activeLearners = activeData ? new Set(activeData.map(d => d.user_id)).size : '-';

            setDashboardStats({
                totalUsers: usersCount ?? '-',
                totalEnrollments: enrollmentsCount ?? '-',
                completions: completionsCount ?? '-',
                activeLearners: activeLearners,
                waitlist: waitlistCount ?? '-',
                totalCourses: coursesData.length
            });

            // Recent Enrollments (Join profiles and courses)
            const { data: recentData } = await supabase.from('enrollments')
                .select(`
                    user_id,
                    course_id,
                    enrolled_at,
                    progress,
                    profiles ( full_name, email ),
                    courses ( title )
                `)
                .order('enrolled_at', { ascending: false })
                .limit(10);
            setRecentEnrollments(recentData || []);

            // Top Courses
            const { data: allEnrollments } = await supabase.from('enrollments').select(`
                course_id,
                courses ( title )
            `);

            if (allEnrollments) {
                const courseCounts = {};
                allEnrollments.forEach(e => {
                    const cId = e.course_id;
                    const cTitle = e.courses?.title || 'Unknown Course';
                    if (!courseCounts[cId]) {
                        courseCounts[cId] = { id: cId, title: cTitle, count: 0 };
                    }
                    courseCounts[cId].count += 1;
                });
                
                const sortedCourses = Object.values(courseCounts)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                setTopCourses(sortedCourses);
            }
            
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchCourses = async () => {
        const { data: coursesData, error } = await supabase
            .from('courses')
            .select('*')
            .order('title');
            
        if (error) {
            console.error("Error fetching courses:", error);
            setCourses([]);
            return;
        }
            
        // Fetch enrollments to get count per course
        const { data: enrollments } = await supabase.from('enrollments').select('course_id');
        
        if (coursesData && enrollments) {
            const counts = {};
            enrollments.forEach(e => {
                counts[e.course_id] = (counts[e.course_id] || 0) + 1;
            });
            const enhancedCourses = coursesData.map(c => ({
                ...c,
                enrollmentCount: counts[c.id] || 0
            }));
            setCourses(enhancedCourses);
        } else {
            setCourses(coursesData || []);
        }
    };

    const fetchAllEnrollments = async () => {
        // Try the joined query first
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

        // Fallback: if join fails (missing FK), fetch separately and merge
        console.warn("Join failed, using fallback fetch:", error?.message);
        const { data: enrollData } = await supabase
            .from('enrollments')
            .select('*')
            .order('enrolled_at', { ascending: false });

        if (!enrollData || enrollData.length === 0) {
            setAllEnrollments([]);
            return;
        }

        // Get unique user_ids and course_ids
        const userIds = [...new Set(enrollData.map(e => e.user_id))];
        const courseIds = [...new Set(enrollData.map(e => e.course_id))];

        // Fetch full profiles to find the email field
        const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

        const { data: coursesDataList } = await supabase
            .from('courses')
            .select('id, title')
            .in('id', courseIds);

        // Build lookup maps - profiles table uses full_name, not email
        const profileMap = {};
        (profilesData || []).forEach(p => { 
            profileMap[p.id] = { 
                email: p.email || p.full_name || 'Unknown',
                full_name: p.full_name || 'Unknown'
            }; 
        });
        const courseMap = {};
        (coursesDataList || []).forEach(c => { courseMap[c.id] = { title: c.title }; });

        // Merge
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
        setCurrentPageEnrollments(1); // Reset page on filter change
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

            // 1. Enrollments Over Time (last 30 days)
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

            // 2. Course Popularity (top 10)
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

            // 3. Completion Rate by Course
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
            // Fetch site settings
            const { data: settingsRows } = await supabase.from('site_settings').select('*');
            const map = {};
            (settingsRows || []).forEach(r => { map[r.key] = r.value; });
            setSiteSettings(map);
            setOriginalSiteSettings({ ...map });

            // Notification prefs are stored in same table
            const nPrefs = {
                notify_admin_new_user: map.notify_admin_new_user || 'false',
                notify_admin_waitlist: map.notify_admin_waitlist || 'false',
                notify_admin_completion: map.notify_admin_completion || 'false',
            };
            setNotifPrefs(nPrefs);
            setOriginalNotifPrefs({ ...nPrefs });

            // Admin profile
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
            // Verify current password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: passwordForm.current,
            });
            if (signInError) {
                showToast('Current password is incorrect.', 'error');
                return;
            }
            // Update password
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

        // Fetch enrollment counts
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
                // Primary Sort: Most enrollments first (this surfaces newly enrolled users immediately)
                if (b.enrollmentCount !== a.enrollmentCount) return b.enrollmentCount - a.enrollmentCount;
                // Secondary Sort: Admin status first
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
        setSelectedCourse(course); // For Courses tab UI context
        setSelectedCourseForLessons(course.id); // For Lessons tab context
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

        // Auto-generate id if empty
        const courseId = courseForm.id || courseForm.title.toLowerCase().replace(/\s+/g, '-');
        const payload = { ...courseForm, id: courseId };
        
        // Remove computed properties before sending to Supabase
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
            .order('order', { ascending: true }); // Fallback to 'order' if order_index is identical initially
        
        // Ensure every lesson has an order_index for the frontend (especially before migration)
        const formattedLessons = (data || []).map((l, i) => ({
            ...l,
            order_index: typeof l.order_index === 'number' ? l.order_index : (l.order || i + 1)
        })).sort((a, b) => a.order_index - b.order_index);

        setLessons(formattedLessons);
    };

    // Update lessons when course selector changes
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
            has_quiz: false,
            quiz_question: '',
            quiz_options: ['', '', '', ''],
            quiz_correct_index: 0,
            quiz_pass_score: 70
        });
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

        const payload = {
            course_id: selectedCourseForLessons,
            ...lessonForm,
            order: lessonForm.order_index // Fallback to satisfy legacy NOT NULL constraint
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

        // Optimistically update UI
        const updatedItems = items.map((item, index) => ({
            ...item,
            order_index: index + 1
        }));
        setLessons(updatedItems);

        // Perform batch update. Note: Supabase doesn't have a single-call batch update RPC built-in by default
        // unless you create one. We will send concurrent updates.
        try {
            const updates = updatedItems.map(item => 
                supabase.from('lessons').update({ order_index: item.order_index, order: item.order_index }).eq('id', item.id)
            );
            await Promise.all(updates);
        } catch (error) {
            console.error('Error updating order:', error);
            // Re-fetch on error to restore correct state
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
        // Use RPC to bypass RLS policies that block updating other users' profiles
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

        // Use RPC to bypass RLS policies that block updating other users' enrollments
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

    // Filter and Pagination Logic
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
                
                {/* --- OVERVIEW TAB --- */}
                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
                            <h3 className="mb-0 text-white"><i className="fas fa-chart-line me-2 text-info"></i>Dashboard Overview</h3>
                            {loadingStats && <span className="spinner-border spinner-border-sm text-info" role="status" aria-hidden="true"></span>}
                        </div>
                        
                        {/* 6 Stat Cards */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-4">
                                <div className="glass-card p-4 text-center">
                                    {loadingStats ? <div className="spinner-border text-info my-2"></div> : <h2 className="text-info m-0 fw-bold">{dashboardStats.totalUsers}</h2>}
                                    <p className="text-muted small m-0 mt-2 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Total Users</p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="glass-card p-4 text-center">
                                    {loadingStats ? <div className="spinner-border text-warning my-2"></div> : <h2 className="text-warning m-0 fw-bold">{dashboardStats.totalEnrollments}</h2>}
                                    <p className="text-muted small m-0 mt-2 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Total Enrollments</p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="glass-card p-4 text-center">
                                    {loadingStats ? <div className="spinner-border text-success my-2"></div> : <h2 className="text-success m-0 fw-bold">{dashboardStats.completions}</h2>}
                                    <p className="text-muted small m-0 mt-2 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Completions</p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="glass-card p-4 text-center">
                                    {loadingStats ? <div className="spinner-border text-primary my-2"></div> : <h2 className="text-primary m-0 fw-bold">{dashboardStats.activeLearners}</h2>}
                                    <p className="text-muted small m-0 mt-2 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Active Learners</p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="glass-card p-4 text-center">
                                    {loadingStats ? <div className="spinner-border text-danger my-2"></div> : <h2 className="text-danger m-0 fw-bold">{dashboardStats.waitlist}</h2>}
                                    <p className="text-muted small m-0 mt-2 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Waitlist Signups</p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="glass-card p-4 text-center">
                                    {loadingStats ? <div className="spinner-border text-light my-2"></div> : <h2 className="text-light m-0 fw-bold">{dashboardStats.totalCourses}</h2>}
                                    <p className="text-muted small m-0 mt-2 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Total Courses</p>
                                </div>
                            </div>
                        </div>

                        <div className="row g-4">
                            {/* Recent Enrollments (Left) */}
                            <div className="col-lg-8">
                                <div className="glass-card p-4 h-100">
                                    <h5 className="mb-4 text-white"><i className="fas fa-history me-2 text-info"></i>Recent Enrollments</h5>
                                    {loadingStats ? (
                                        <div className="text-center py-5"><div className="spinner-border text-info"></div></div>
                                    ) : recentEnrollments.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-dark table-hover table-borderless align-middle mb-0">
                                                <thead className="border-bottom border-secondary border-opacity-25">
                                                    <tr>
                                                        <th className="text-muted small text-uppercase pb-3">User</th>
                                                        <th className="text-muted small text-uppercase pb-3">Course</th>
                                                        <th className="text-muted small text-uppercase pb-3">Enrolled At</th>
                                                        <th className="text-muted small text-uppercase pb-3">Progress</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentEnrollments.map((enrollment, idx) => (
                                                        <tr key={idx} className="border-bottom border-secondary border-opacity-10">
                                                            <td className="py-3">
                                                                <div className="fw-bold text-white">{enrollment.profiles?.full_name || 'Unknown'}</div>
                                                                <small className="text-muted">{enrollment.profiles?.email}</small>
                                                            </td>
                                                            <td className="py-3 text-white">{enrollment.courses?.title || 'Unknown Course'}</td>
                                                            <td className="py-3 text-muted small">{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                                                            <td className="py-3">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="progress flex-grow-1 me-2" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                                                        <div 
                                                                            className={`progress-bar ${enrollment.progress === 100 ? 'bg-success' : 'bg-info'}`} 
                                                                            style={{ width: `${enrollment.progress}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <small className="text-muted" style={{ minWidth: '35px' }}>{enrollment.progress}%</small>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted py-5">No recent enrollments found.</div>
                                    )}
                                </div>
                            </div>

                            {/* Top Courses (Right) */}
                            <div className="col-lg-4">
                                <div className="glass-card p-4 h-100">
                                    <h5 className="mb-4 text-white"><i className="fas fa-fire me-2 text-warning"></i>Top Courses</h5>
                                    {loadingStats ? (
                                        <div className="text-center py-5"><div className="spinner-border text-warning"></div></div>
                                    ) : topCourses.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {topCourses.map((course, idx) => {
                                                const maxCount = topCourses[0].count;
                                                const percent = Math.round((course.count / maxCount) * 100);
                                                return (
                                                    <div key={course.id} className="bg-dark bg-opacity-25 p-3 rounded border border-secondary border-opacity-25">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <div className="fw-bold text-white text-truncate pe-2">
                                                                <span className="text-muted me-2">#{idx + 1}</span>
                                                                {course.title}
                                                            </div>
                                                            <span className="badge bg-warning text-dark">{course.count}</span>
                                                        </div>
                                                        <div className="progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                                            <div className="progress-bar bg-warning" style={{ width: `${percent}%` }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted py-5">No course data available.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- USERS TAB --- */}
                {activeTab === 'users' && (
                    <div className="animate-fade-in">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-bottom border-secondary border-opacity-25 pb-3 gap-3">
                            <h3 className="mb-0 text-white"><i className="fas fa-users me-2 text-info"></i>User Management</h3>
                            <div className="d-flex gap-2" style={{ maxWidth: '400px', flexGrow: 1 }}>
                                <button className="btn btn-outline-info text-nowrap" onClick={fetchUsers} title="Refresh Live Data">
                                    <i className="fas fa-sync-alt"></i>
                                </button>
                                <div className="input-group">
                                    <span className="input-group-text bg-dark border-secondary text-muted"><i className="fas fa-search"></i></span>
                                    <input 
                                        type="text" 
                                        className="form-control bg-dark text-white border-secondary" 
                                        placeholder="Search users..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-4">
                            <div className="table-responsive mb-3">
                                <table className="table table-dark table-hover table-borderless align-middle mb-0">
                                    <thead className="border-bottom border-secondary border-opacity-25">
                                        <tr>
                                            <th className="text-muted small text-uppercase pb-3">User</th>
                                            <th className="text-muted small text-uppercase pb-3">Joined</th>
                                            <th className="text-muted small text-uppercase pb-3 text-center">Courses</th>
                                            <th className="text-muted small text-uppercase pb-3">Role</th>
                                            <th className="text-muted small text-uppercase pb-3 text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedUsers.length > 0 ? paginatedUsers.map(u => (
                                            <tr key={u.id} className="border-bottom border-secondary border-opacity-10">
                                                <td className="py-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                                                            {u.avatar_url ? <img src={u.avatar_url} alt="" className="rounded-circle w-100 h-100" /> : <i className="fas fa-user text-white"></i>}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-white">{u.full_name || 'Anonymous'}</div>
                                                            <small className="text-muted">{u.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-muted">{u.updated_at ? new Date(u.updated_at).toLocaleDateString() : 'N/A'}</td>
                                                <td className="py-3 text-center">
                                                    <span className="badge bg-dark border border-secondary text-light">{u.enrollmentCount || 0}</span>
                                                </td>
                                                <td className="py-3">
                                                    {u.is_admin ?
                                                        <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50"><i className="fas fa-shield-alt me-1"></i>Admin</span> :
                                                        <span className="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-50">User</span>
                                                    }
                                                </td>
                                                <td className="py-3 text-end">
                                                    <div className="btn-group">
                                                        <button 
                                                            className="btn btn-sm btn-outline-info" 
                                                            title="View Profile"
                                                            onClick={() => openUserDrawer(u)}
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-warning" 
                                                            title={u.is_admin ? "Revoke Admin" : "Make Admin"}
                                                            onClick={() => setAdminModal({ isOpen: true, user: u })}
                                                            disabled={u.id === user.id}
                                                        >
                                                            <i className={`fas ${u.is_admin ? 'fa-user-times' : 'fa-user-shield'}`}></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger" 
                                                            title="Reset Progress"
                                                            onClick={() => setResetModal({ isOpen: true, user: u })}
                                                        >
                                                            <i className="fas fa-history"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="text-center py-5 text-muted">No users found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25">
                                    <span className="text-muted small">Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length}</span>
                                    <div className="btn-group">
                                        <button 
                                            className="btn btn-sm btn-outline-secondary text-white" 
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                        >
                                            <i className="fas fa-chevron-left"></i>
                                        </button>
                                        <span className="btn btn-sm btn-dark text-white disabled px-3">{currentPage} / {totalPages}</span>
                                        <button 
                                            className="btn btn-sm btn-outline-secondary text-white" 
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                        >
                                            <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- COURSES TAB --- */}
                {activeTab === 'courses' && (
                    <div className="animate-fade-in">
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
                            <h3 className="mb-0 text-white"><i className="fas fa-graduation-cap me-2 text-info"></i>Course Management</h3>
                            <button className="btn btn-success" onClick={handleNewCourse}>
                                <i className="fas fa-plus me-2"></i> Add New Course
                            </button>
                        </div>
                        
                        <div className="glass-card overflow-hidden">
                            <div className="table-responsive">
                                <table className="table table-dark table-hover table-borderless align-middle mb-0">
                                    <thead className="border-bottom border-secondary border-opacity-25">
                                        <tr>
                                            <th className="text-muted small text-uppercase pb-3 ps-4">Course</th>
                                            <th className="text-muted small text-uppercase pb-3">Category</th>
                                            <th className="text-muted small text-uppercase pb-3">Level</th>
                                            <th className="text-muted small text-uppercase pb-3 text-center">Enrollments</th>
                                            <th className="text-muted small text-uppercase pb-3 text-center">Visibility</th>
                                            <th className="text-muted small text-uppercase pb-3 text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.length > 0 ? courses.map(course => (
                                            <tr key={course.id} className="border-bottom border-secondary border-opacity-10">
                                                <td className="py-3 ps-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-dark rounded d-flex align-items-center justify-content-center me-3 border border-secondary border-opacity-25" style={{ width: '40px', height: '40px' }}>
                                                            <i className={`${course.icon || 'fas fa-book'} text-info fs-5`}></i>
                                                        </div>
                                                        <div className="fw-bold text-white">{course.title}</div>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-muted">{course.category_label || course.category}</td>
                                                <td className="py-3">
                                                    <span className={`badge ${course.level === 'Advanced' ? 'bg-danger' : course.level === 'Intermediate' ? 'bg-warning' : 'bg-success'} bg-opacity-25 border border-opacity-50 text-white`}>
                                                        {course.level || 'Beginner'}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-center">
                                                    <span className="badge bg-dark border border-secondary text-light fs-6 px-3">{course.enrollmentCount || 0}</span>
                                                </td>
                                                <td className="py-3 text-center">
                                                    <div className="form-check form-switch d-inline-block">
                                                        <input 
                                                            className="form-check-input border-secondary" 
                                                            type="checkbox" 
                                                            role="switch" 
                                                            style={{ cursor: 'pointer' }}
                                                            checked={course.is_visible !== false}
                                                            onChange={() => toggleCourseVisibility(course.id, course.is_visible !== false)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-3 text-end pe-4">
                                                    <div className="btn-group">
                                                        <button 
                                                            className="btn btn-sm btn-outline-info" 
                                                            title="Edit Course"
                                                            onClick={() => handleEditCourse(course)}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-warning" 
                                                            title="Manage Lessons"
                                                            onClick={() => handleCourseSelect(course)}
                                                        >
                                                            <i className="fas fa-book-open"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger" 
                                                            title="Delete Course"
                                                            onClick={() => handleDeleteCourseConfirm(course)}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="6" className="text-center py-5 text-muted">No courses found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- LESSONS TAB --- */}
                {activeTab === 'lessons' && (
                    <div className="animate-fade-in">
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
                            <h3 className="mb-0 text-white"><i className="fas fa-book-open me-2 text-info"></i>Lessons Management</h3>
                            <button 
                                className="btn btn-success" 
                                onClick={handleNewLesson}
                                disabled={!selectedCourseForLessons}
                            >
                                <i className="fas fa-plus me-2"></i> Add Lesson
                            </button>
                        </div>
                        
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase">Select Course</label>
                                <select 
                                    className="form-select bg-dark text-white border-secondary"
                                    value={selectedCourseForLessons}
                                    onChange={(e) => setSelectedCourseForLessons(e.target.value)}
                                >
                                    <option value="">-- Choose a course --</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedCourseForLessons ? (
                            <div className="glass-card overflow-hidden p-3">
                                {lessons.length > 0 ? (
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId="lessons-list">
                                            {(provided) => (
                                                <div 
                                                    {...provided.droppableProps} 
                                                    ref={provided.innerRef}
                                                    className="list-group list-group-flush"
                                                >
                                                    {lessons.map((lesson, index) => (
                                                        <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={`list-group-item bg-transparent border-bottom border-secondary border-opacity-25 p-3 d-flex align-items-center justify-content-between ${snapshot.isDragging ? 'bg-dark bg-opacity-75 shadow' : ''}`}
                                                                >
                                                                    <div className="d-flex align-items-center flex-grow-1">
                                                                        <div {...provided.dragHandleProps} className="me-3 text-muted" style={{ cursor: 'grab' }}>
                                                                            <i className="fas fa-grip-vertical fs-5"></i>
                                                                        </div>
                                                                        <span className="badge bg-secondary me-3">#{lesson.order_index}</span>
                                                                        <div className="fw-bold text-white fs-5">{lesson.title}</div>
                                                                        
                                                                        {lesson.has_quiz ? (
                                                                            <span className="badge bg-info ms-3"><i className="fas fa-question-circle me-1"></i> Quiz</span>
                                                                        ) : (
                                                                            <span className="badge bg-primary ms-3"><i className="fas fa-book-reader me-1"></i> Reading</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="btn-group">
                                                                        <button className="btn btn-sm btn-outline-info" onClick={() => handleEditLesson(lesson)}>
                                                                            <i className="fas fa-edit"></i>
                                                                        </button>
                                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteLessonConfirm(lesson)}>
                                                                            <i className="fas fa-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                ) : (
                                    <div className="text-center text-muted py-5">
                                        <i className="fas fa-box-open fs-1 mb-3 text-secondary"></i>
                                        <p>No lessons found for this course. Click "Add Lesson" to get started.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-muted py-5 glass-card mt-4">
                                <i className="fas fa-arrow-up fs-1 mb-3 text-secondary"></i>
                                <p>Please select a course from the dropdown above to manage its lessons.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* --- OTHER TABS PLACEHOLDER --- */}
                {/* --- ENROLLMENTS TAB --- */}
                {activeTab === 'enrollments' && (
                    <div className="animate-fade-in">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="text-white mb-0"><i className="fas fa-list-check me-2 text-info"></i>Student Enrollments</h3>
                        </div>

                        {/* Filters */}
                        <div className="glass-card p-3 mb-4">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="input-group">
                                        <span className="input-group-text bg-dark border-secondary text-muted"><i className="fas fa-search"></i></span>
                                        <input 
                                            type="text" 
                                            className="form-control bg-dark text-white border-secondary" 
                                            placeholder="Search student name..." 
                                            value={enrollmentSearchQuery}
                                            onChange={(e) => setEnrollmentSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <select 
                                        className="form-select bg-dark text-white border-secondary"
                                        value={enrollmentCourseFilter}
                                        onChange={(e) => setEnrollmentCourseFilter(e.target.value)}
                                    >
                                        <option value="">All Courses</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <select 
                                        className="form-select bg-dark text-white border-secondary"
                                        value={enrollmentStatusFilter}
                                        onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="In Progress">In Progress (1-99%)</option>
                                        <option value="Completed">Completed (100%)</option>
                                        <option value="Not Started">Not Started (0%)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="glass-card overflow-hidden">
                            <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                                <span className="text-white fw-bold">Showing {filteredEnrollments.length} results</span>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-dark table-hover mb-0 align-middle">
                                    <thead>
                                        <tr>
                                            <th className="text-muted small text-uppercase">Student</th>
                                            <th className="text-muted small text-uppercase">Course</th>
                                            <th className="text-muted small text-uppercase" style={{ minWidth: '150px' }}>Progress</th>
                                            <th className="text-muted small text-uppercase">Completed Lessons</th>
                                            <th className="text-muted small text-uppercase">Enrolled At</th>
                                            <th className="text-muted small text-uppercase text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEnrollments
                                            .slice((currentPageEnrollments - 1) * enrollmentsPerPage, currentPageEnrollments * enrollmentsPerPage)
                                            .map((enr) => (
                                            <tr key={enr.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                                                            <i className="fas fa-user text-white small"></i>
                                                        </div>
                                                        <span className="text-white">{enr.profiles?.full_name || enr.profiles?.email || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td><span className="text-white">{enr.courses?.title || 'Unknown Course'}</span></td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="progress flex-grow-1 me-2" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                                            <div className={`progress-bar ${enr.progress === 100 ? 'bg-success' : 'bg-info'}`} style={{ width: `${enr.progress}%` }}></div>
                                                        </div>
                                                        <small className="text-muted">{enr.progress}%</small>
                                                    </div>
                                                </td>
                                                <td><span className="text-white text-center d-block w-50">{enr.completed_lessons ? enr.completed_lessons.length : 0}</span></td>
                                                <td><span className="text-muted small">{new Date(enr.enrolled_at).toLocaleDateString()}</span></td>
                                                <td className="text-end pe-3">
                                                    <div className="dropdown">
                                                        <button className="btn btn-sm btn-outline-secondary text-white border-0" data-bs-toggle="dropdown">
                                                            <i className="fas fa-ellipsis-v"></i>
                                                        </button>
                                                        <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-sm border border-secondary border-opacity-25">
                                                            <li><button className="dropdown-item text-warning" onClick={() => setResetEnrollmentModal({ isOpen: true, enrollment: enr })}><i className="fas fa-redo me-2"></i>Reset Progress</button></li>
                                                            <li><hr className="dropdown-divider border-secondary border-opacity-25" /></li>
                                                            <li><button className="dropdown-item text-danger" onClick={() => setRemoveEnrollmentModal({ isOpen: true, enrollment: enr })}><i className="fas fa-trash-alt me-2"></i>Remove Enrollment</button></li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredEnrollments.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-muted">No enrollments match your filters.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination */}
                            {filteredEnrollments.length > enrollmentsPerPage && (
                                <div className="p-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">
                                        Showing {(currentPageEnrollments - 1) * enrollmentsPerPage + 1} to {Math.min(currentPageEnrollments * enrollmentsPerPage, filteredEnrollments.length)} of {filteredEnrollments.length}
                                    </span>
                                    <div className="btn-group">
                                        <button 
                                            className="btn btn-sm btn-outline-secondary text-white" 
                                            disabled={currentPageEnrollments === 1}
                                            onClick={() => setCurrentPageEnrollments(p => p - 1)}
                                        >
                                            <i className="fas fa-chevron-left"></i>
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-outline-secondary text-white" 
                                            disabled={currentPageEnrollments * enrollmentsPerPage >= filteredEnrollments.length}
                                            onClick={() => setCurrentPageEnrollments(p => p + 1)}
                                        >
                                            <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- WAITLIST TAB --- */}
                {activeTab === 'waitlist' && (
                    <div className="animate-fade-in">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                            <h3 className="text-white mb-0"><i className="fas fa-bell me-2 text-info"></i>Course Waitlist</h3>
                            <button className="btn btn-outline-info" onClick={exportWaitlistCSV} disabled={filteredWaitlist.length === 0}>
                                <i className="fas fa-file-csv me-2"></i>Export CSV
                            </button>
                        </div>

                        {/* Search & Count */}
                        <div className="glass-card p-3 mb-4">
                            <div className="row g-3 align-items-center">
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text bg-dark border-secondary text-muted"><i className="fas fa-search"></i></span>
                                        <input 
                                            type="text" 
                                            className="form-control bg-dark text-white border-secondary" 
                                            placeholder="Search email..." 
                                            value={waitlistSearch}
                                            onChange={(e) => setWaitlistSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <span className="text-muted fw-bold"><i className="fas fa-users me-2"></i>{filteredWaitlist.length} email{filteredWaitlist.length !== 1 ? 's' : ''} on the waitlist</span>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="glass-card overflow-hidden">
                            <div className="table-responsive">
                                <table className="table table-dark table-hover mb-0 align-middle">
                                    <thead>
                                        <tr>
                                            <th className="text-muted small text-uppercase">Email</th>
                                            <th className="text-muted small text-uppercase">Signed Up</th>
                                            <th className="text-muted small text-uppercase text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredWaitlist.map((entry) => (
                                            <tr key={entry.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-info bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                                                            <i className="fas fa-envelope text-info small"></i>
                                                        </div>
                                                        <span className="text-white">{entry.email}</span>
                                                    </div>
                                                </td>
                                                <td><span className="text-muted">{new Date(entry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></td>
                                                <td className="text-end pe-3">
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger border-0" 
                                                        onClick={() => setDeleteWaitlistModal({ isOpen: true, entry })}
                                                        title="Remove from waitlist"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredWaitlist.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="text-center py-4 text-muted">No waitlist entries found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ANNOUNCEMENTS TAB --- */}
                {activeTab === 'announcements' && (
                    <div className="animate-fade-in">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                            <h3 className="text-white mb-0"><i className="fas fa-bullhorn me-2 text-info"></i>Announcements</h3>
                            <button className="btn btn-success" onClick={handleNewAnnouncement}>
                                <i className="fas fa-plus me-2"></i>New Announcement
                            </button>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {announcements.length === 0 && (
                                <div className="glass-card p-5 text-center text-muted">
                                    <i className="fas fa-bullhorn fs-1 mb-3 opacity-50"></i>
                                    <p className="mb-0">No announcements yet. Click "New Announcement" to create one.</p>
                                </div>
                            )}
                            {announcements.map(ann => {
                                const typeColors = { info: 'info', warning: 'warning', success: 'success', danger: 'danger' };
                                const color = typeColors[ann.type] || 'info';
                                return (
                                    <div key={ann.id} className={`glass-card p-4 border-start border-4 border-${color} ${!ann.is_active ? 'opacity-50' : ''}`}>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <span className={`badge bg-${color}`}>{ann.type.toUpperCase()}</span>
                                                    {!ann.is_active && <span className="badge bg-secondary">Inactive</span>}
                                                    <small className="text-muted">{new Date(ann.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</small>
                                                </div>
                                                <h5 className="text-white mb-1">{ann.title}</h5>
                                                <p className="text-muted mb-0">{ann.body}</p>
                                            </div>
                                            <div className="d-flex gap-2 ms-3 flex-shrink-0">
                                                <button
                                                    className={`btn btn-sm ${ann.is_active ? 'btn-outline-warning' : 'btn-outline-success'} border-0`}
                                                    onClick={() => toggleAnnouncementActive(ann)}
                                                    title={ann.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    <i className={`fas ${ann.is_active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-info border-0" onClick={() => handleEditAnnouncement(ann)} title="Edit">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger border-0" onClick={() => setDeleteAnnouncementModal({ isOpen: true, announcement: ann })} title="Delete">
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- INBOX TAB --- */}
                {activeTab === 'inbox' && (
                    <div className="animate-fade-in">
                        <h3 className="text-white mb-4"><i className="fas fa-inbox me-2 text-info"></i>Inbox & Notifications</h3>

                        {/* Sub-tabs */}
                        <ul className="nav nav-pills mb-4 gap-2">
                            <li className="nav-item">
                                <button className={`nav-link ${inboxSubTab === 'compose' ? 'active bg-info border-0' : 'text-white'}`} onClick={() => setInboxSubTab('compose')}>
                                    <i className="fas fa-pen me-2"></i>Compose
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${inboxSubTab === 'sent' ? 'active bg-info border-0' : 'text-white'}`} onClick={() => { setInboxSubTab('sent'); fetchSentNotifications(); }}>
                                    <i className="fas fa-paper-plane me-2"></i>Sent ({sentNotifications.length})
                                </button>
                            </li>
                        </ul>

                        {/* COMPOSE TAB */}
                        {inboxSubTab === 'compose' && (
                            <div className="glass-card p-4">
                                <h5 className="text-white mb-4"><i className="fas fa-paper-plane me-2 text-info"></i>Compose Notification</h5>
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <label className="form-label text-muted small text-uppercase">Title *</label>
                                        <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="Notification title" value={composeForm.title} onChange={e => setComposeForm({ ...composeForm, title: e.target.value })} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label text-muted small text-uppercase">Type</label>
                                        <select className="form-select bg-dark text-white border-secondary" value={composeForm.type} onChange={e => setComposeForm({ ...composeForm, type: e.target.value })}>
                                            <option value="info">ℹ️ Info</option>
                                            <option value="warning">⚠️ Warning</option>
                                            <option value="success">✅ Success</option>
                                            <option value="danger">🚨 Danger</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-muted small text-uppercase">Message Body *</label>
                                        <textarea className="form-control bg-dark text-white border-secondary" rows="4" placeholder="Write your notification message..." value={composeForm.body} onChange={e => setComposeForm({ ...composeForm, body: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small text-uppercase">Send To</label>
                                        <select className="form-select bg-dark text-white border-secondary" value={composeForm.target_type} onChange={e => { setComposeForm({ ...composeForm, target_type: e.target.value, target_value: '' }); setComposeTargetEmail(''); setComposeEmailError(''); }}>
                                            <option value="all">🌐 All Users</option>
                                            <option value="category">📚 Users enrolled in a course</option>
                                            <option value="specific">👤 Specific User (by email)</option>
                                        </select>
                                    </div>
                                    {composeForm.target_type === 'category' && (
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small text-uppercase">Select Course</label>
                                            <select className="form-select bg-dark text-white border-secondary" value={composeForm.target_value} onChange={e => setComposeForm({ ...composeForm, target_value: e.target.value })}>
                                                <option value="">-- Select Course --</option>
                                                {coursesData.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    {composeForm.target_type === 'specific' && (
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small text-uppercase">User Email</label>
                                            <input type="email" className={`form-control bg-dark text-white border-secondary ${composeEmailError ? 'border-danger' : ''}`} placeholder="user@example.com" value={composeTargetEmail} onChange={e => { setComposeTargetEmail(e.target.value); setComposeEmailError(''); }} onBlur={e => lookupUserByEmail(e.target.value)} />
                                            {composeEmailError && <small className="text-danger">{composeEmailError}</small>}
                                            {composeForm.target_value && !composeEmailError && <small className="text-success"><i className="fas fa-check me-1"></i>User found</small>}
                                        </div>
                                    )}

                                    {/* Preview */}
                                    {composePreview && composeForm.title && (
                                        <div className="col-12">
                                            <label className="form-label text-muted small text-uppercase">Preview</label>
                                            <div className="p-3 rounded" style={{
                                                borderLeft: `4px solid ${{ info: '#0d6efd', warning: '#ffc107', success: '#198754', danger: '#dc3545' }[composeForm.type]}`,
                                                background: 'rgba(255,255,255,0.03)',
                                            }}>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className={`badge bg-${composeForm.type}`}>{composeForm.type.toUpperCase()}</span>
                                                    <small className="text-muted">Just now</small>
                                                </div>
                                                <h6 className="text-white fw-bold mb-1">{composeForm.title}</h6>
                                                <p className="text-light mb-0" style={{ opacity: 0.85 }}>{composeForm.body}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-12 d-flex gap-2 pt-2 border-top border-secondary border-opacity-25">
                                        <button className="btn btn-outline-info" onClick={() => setComposePreview(!composePreview)}>
                                            <i className={`fas ${composePreview ? 'fa-eye-slash' : 'fa-eye'} me-2`}></i>{composePreview ? 'Hide Preview' : 'Preview'}
                                        </button>
                                        <button className="btn btn-success" onClick={sendNotification} disabled={!composeForm.title.trim() || !composeForm.body.trim()}>
                                            <i className="fas fa-paper-plane me-2"></i>Send Notification
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SENT TAB */}
                        {inboxSubTab === 'sent' && (
                            <div className="glass-card p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                    <h5 className="text-white mb-0"><i className="fas fa-history me-2"></i>Sent Notifications</h5>
                                    <input type="text" className="form-control bg-dark text-white border-secondary" style={{ maxWidth: '250px' }} placeholder="Search by title..." value={inboxSearch} onChange={e => { setInboxSearch(e.target.value); setInboxPage(0); }} />
                                </div>
                                {inboxLoading ? (
                                    <div className="text-center py-4"><div className="spinner-border text-info" role="status"></div></div>
                                ) : (() => {
                                    const filtered = sentNotifications.filter(n => n.title.toLowerCase().includes(inboxSearch.toLowerCase()));
                                    const pageSize = 20;
                                    const totalPages = Math.ceil(filtered.length / pageSize);
                                    const paged = filtered.slice(inboxPage * pageSize, (inboxPage + 1) * pageSize);
                                    return (
                                        <>
                                            <div className="table-responsive">
                                                <table className="table table-dark table-hover align-middle mb-0">
                                                    <thead>
                                                        <tr className="text-muted small text-uppercase">
                                                            <th>Title</th><th>Type</th><th>Sent To</th><th>Sent At</th><th>Read By</th><th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paged.map(n => (
                                                            <tr key={n.id}>
                                                                <td className="text-white fw-bold">{n.title}</td>
                                                                <td><span className={`badge bg-${n.type}`}>{n.type}</span></td>
                                                                <td className="text-muted small">{n.target_type === 'all' ? 'All Users' : n.target_type === 'category' ? `Course: ${coursesData.find(c => c.id === n.target_value)?.title || n.target_value}` : `User: ${n.target_value?.substring(0, 8)}...`}</td>
                                                                <td className="text-muted small">{new Date(n.created_at).toLocaleDateString()}</td>
                                                                <td><span className="badge bg-secondary">{n.readCount}</span></td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteNotifModal({ isOpen: true, notif: n })} title="Delete">
                                                                        <i className="fas fa-trash-alt"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {paged.length === 0 && <tr><td colSpan="6" className="text-center py-4 text-muted">No sent notifications found.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {totalPages > 1 && (
                                                <div className="d-flex justify-content-center gap-2 mt-3">
                                                    <button className="btn btn-sm btn-outline-info" disabled={inboxPage === 0} onClick={() => setInboxPage(p => p - 1)}><i className="fas fa-chevron-left"></i></button>
                                                    <span className="text-muted small align-self-center">Page {inboxPage + 1} of {totalPages}</span>
                                                    <button className="btn btn-sm btn-outline-info" disabled={inboxPage >= totalPages - 1} onClick={() => setInboxPage(p => p + 1)}><i className="fas fa-chevron-right"></i></button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )}

                {/* --- ANALYTICS TAB --- */}
                {activeTab === 'analytics' && (
                    <div className="animate-fade-in">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                            <h3 className="text-white mb-0"><i className="fas fa-chart-line me-2 text-info"></i>Analytics</h3>
                            <button className="btn btn-outline-info" onClick={fetchAnalyticsData} disabled={analyticsLoading}>
                                <i className={`fas fa-sync-alt me-2 ${analyticsLoading ? 'fa-spin' : ''}`}></i>Refresh
                            </button>
                        </div>

                        {analyticsLoading ? (
                            <div className="d-flex justify-content-center align-items-center py-5">
                                <div className="spinner-border text-info" role="status"><span className="visually-hidden">Loading...</span></div>
                                <span className="text-muted ms-3">Loading analytics data...</span>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {/* Chart 1: Enrollments Over Time */}
                                <div className="col-12">
                                    <div className="glass-card p-4">
                                        <h5 className="text-white mb-3"><i className="fas fa-chart-area me-2 text-info"></i>Enrollments Over Time <span className="text-muted small fw-normal">(Last 30 Days)</span></h5>
                                        <div style={{ height: '300px' }}>
                                            {enrollmentTimeData ? (
                                                <Line
                                                    data={enrollmentTimeData}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: { display: false },
                                                            tooltip: {
                                                                backgroundColor: 'rgba(30,30,50,0.95)',
                                                                titleColor: '#fff',
                                                                bodyColor: '#ccc',
                                                                borderColor: 'rgba(54,162,235,0.3)',
                                                                borderWidth: 1,
                                                                padding: 12,
                                                                cornerRadius: 8,
                                                            }
                                                        },
                                                        scales: {
                                                            x: {
                                                                ticks: { color: '#888', maxRotation: 45, font: { size: 11 } },
                                                                grid: { color: 'rgba(255,255,255,0.05)' },
                                                            },
                                                            y: {
                                                                beginAtZero: true,
                                                                ticks: { color: '#888', stepSize: 1, font: { size: 11 } },
                                                                grid: { color: 'rgba(255,255,255,0.05)' },
                                                            }
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="d-flex justify-content-center align-items-center h-100 text-muted">No enrollment data available.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Chart 2: Course Popularity */}
                                <div className="col-lg-6">
                                    <div className="glass-card p-4 h-100">
                                        <h5 className="text-white mb-3"><i className="fas fa-fire me-2 text-warning"></i>Course Popularity <span className="text-muted small fw-normal">(Top 10)</span></h5>
                                        <div style={{ height: '320px' }}>
                                            {coursePopularityData && coursePopularityData.labels.length > 0 ? (
                                                <Bar
                                                    data={coursePopularityData}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        indexAxis: 'y',
                                                        plugins: {
                                                            legend: { display: false },
                                                            tooltip: {
                                                                backgroundColor: 'rgba(30,30,50,0.95)',
                                                                titleColor: '#fff',
                                                                bodyColor: '#ccc',
                                                                borderColor: 'rgba(255,255,255,0.1)',
                                                                borderWidth: 1,
                                                                padding: 12,
                                                                cornerRadius: 8,
                                                            }
                                                        },
                                                        scales: {
                                                            x: {
                                                                beginAtZero: true,
                                                                ticks: { color: '#888', stepSize: 1, font: { size: 11 } },
                                                                grid: { color: 'rgba(255,255,255,0.05)' },
                                                            },
                                                            y: {
                                                                ticks: { color: '#ccc', font: { size: 12 } },
                                                                grid: { display: false },
                                                            }
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="d-flex justify-content-center align-items-center h-100 text-muted">No course data available.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Chart 3: Completion Rate */}
                                <div className="col-lg-6">
                                    <div className="glass-card p-4 h-100">
                                        <h5 className="text-white mb-3"><i className="fas fa-trophy me-2 text-success"></i>Completion Rate by Course</h5>
                                        <div style={{ height: '320px' }}>
                                            {completionRateData && completionRateData.labels.length > 0 ? (
                                                <Bar
                                                    data={completionRateData}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        indexAxis: 'y',
                                                        plugins: {
                                                            legend: { display: false },
                                                            tooltip: {
                                                                backgroundColor: 'rgba(30,30,50,0.95)',
                                                                titleColor: '#fff',
                                                                bodyColor: '#ccc',
                                                                borderColor: 'rgba(255,255,255,0.1)',
                                                                borderWidth: 1,
                                                                padding: 12,
                                                                cornerRadius: 8,
                                                                callbacks: {
                                                                    label: (ctx) => `${ctx.raw}% completed`
                                                                }
                                                            }
                                                        },
                                                        scales: {
                                                            x: {
                                                                beginAtZero: true,
                                                                max: 100,
                                                                ticks: { color: '#888', callback: (v) => v + '%', font: { size: 11 } },
                                                                grid: { color: 'rgba(255,255,255,0.05)' },
                                                            },
                                                            y: {
                                                                ticks: { color: '#ccc', font: { size: 12 } },
                                                                grid: { display: false },
                                                            }
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="d-flex justify-content-center align-items-center h-100 text-muted">No completion data available.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="col-12">
                                    <div className="glass-card p-3 d-flex justify-content-center gap-4 flex-wrap">
                                        <span className="d-flex align-items-center gap-2 text-muted small">
                                            <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#22c55e', display: 'inline-block' }}></span> ≥70% Completion
                                        </span>
                                        <span className="d-flex align-items-center gap-2 text-muted small">
                                            <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#eab308', display: 'inline-block' }}></span> 40–69% Completion
                                        </span>
                                        <span className="d-flex align-items-center gap-2 text-muted small">
                                            <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#ef4444', display: 'inline-block' }}></span> &lt;40% Completion
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- SETTINGS TAB --- */}
                {activeTab === 'settings' && (
                    <div className="animate-fade-in">
                        <h3 className="text-white mb-4"><i className="fas fa-cog me-2 text-info"></i>Settings</h3>

                        {settingsLoading ? (
                            <div className="d-flex justify-content-center align-items-center py-5">
                                <div className="spinner-border text-info" role="status"><span className="visually-hidden">Loading...</span></div>
                                <span className="text-muted ms-3">Loading settings...</span>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-4">

                                {/* Section Navigation */}
                                <div className="glass-card p-2 d-flex flex-wrap gap-2">
                                    {[
                                        { id: 'site', label: 'Site Settings', icon: 'fa-globe', dirty: isSiteSettingsDirty() },
                                        { id: 'account', label: 'Admin Account', icon: 'fa-user-shield', dirty: isProfileDirty() },
                                        { id: 'notifications', label: 'Email & Notifications', icon: 'fa-envelope', dirty: isNotifDirty() },
                                        { id: 'danger', label: 'Danger Zone', icon: 'fa-exclamation-triangle' },
                                    ].map(s => (
                                        <button
                                            key={s.id}
                                            className={`btn btn-sm ${activeSettingsSection === s.id ? (s.id === 'danger' ? 'btn-danger' : 'btn-info') : 'btn-outline-secondary text-white'} position-relative`}
                                            onClick={() => setActiveSettingsSection(s.id)}
                                        >
                                            <i className={`fas ${s.icon} me-2`}></i>{s.label}
                                            {s.dirty && <span className="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-dark rounded-circle"><span className="visually-hidden">unsaved</span></span>}
                                        </button>
                                    ))}
                                </div>

                                {/* === SECTION 1: Site Settings === */}
                                {activeSettingsSection === 'site' && (
                                    <div className="glass-card p-4">
                                        <h5 className="text-white mb-4"><i className="fas fa-globe me-2 text-info"></i>Site Settings</h5>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label text-muted small text-uppercase">Site Name</label>
                                                <input type="text" className="form-control bg-dark text-white border-secondary" value={siteSettings.site_name || ''} onChange={e => setSiteSettings({ ...siteSettings, site_name: e.target.value })} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label text-muted small text-uppercase">Tagline</label>
                                                <input type="text" className="form-control bg-dark text-white border-secondary" value={siteSettings.site_tagline || ''} onChange={e => setSiteSettings({ ...siteSettings, site_tagline: e.target.value })} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label text-muted small text-uppercase">Support Email</label>
                                                <input type="email" className="form-control bg-dark text-white border-secondary" value={siteSettings.support_email || ''} onChange={e => setSiteSettings({ ...siteSettings, support_email: e.target.value })} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label text-muted small text-uppercase">Hero CTA Button Text</label>
                                                <input type="text" className="form-control bg-dark text-white border-secondary" value={siteSettings.hero_cta_text || ''} onChange={e => setSiteSettings({ ...siteSettings, hero_cta_text: e.target.value })} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label text-muted small text-uppercase">Hero CTA Link</label>
                                                <input type="text" className="form-control bg-dark text-white border-secondary" value={siteSettings.hero_cta_link || ''} onChange={e => setSiteSettings({ ...siteSettings, hero_cta_link: e.target.value })} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label text-muted small text-uppercase">Announcement Bar Text</label>
                                                <input type="text" className="form-control bg-dark text-white border-secondary" value={siteSettings.announcement_bar_text || ''} onChange={e => setSiteSettings({ ...siteSettings, announcement_bar_text: e.target.value })} />
                                            </div>

                                            <div className="col-12"><hr className="border-secondary border-opacity-25 my-2" /></div>

                                            <div className="col-md-4">
                                                <div className="form-check form-switch d-flex align-items-center gap-2">
                                                    <input className="form-check-input border-secondary fs-5" type="checkbox" checked={siteSettings.announcement_bar_enabled === 'true'} onChange={e => setSiteSettings({ ...siteSettings, announcement_bar_enabled: e.target.checked ? 'true' : 'false' })} id="annBarToggle" />
                                                    <label className="form-check-label text-white" htmlFor="annBarToggle">Announcement Bar</label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check form-switch d-flex align-items-center gap-2">
                                                    <input className="form-check-input border-secondary fs-5" type="checkbox" checked={siteSettings.allow_new_signups === 'true'} onChange={e => setSiteSettings({ ...siteSettings, allow_new_signups: e.target.checked ? 'true' : 'false' })} id="signupsToggle" />
                                                    <label className="form-check-label text-white" htmlFor="signupsToggle">Allow New Signups</label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check form-switch d-flex align-items-center gap-2">
                                                    <input className="form-check-input border-danger fs-5" type="checkbox" checked={siteSettings.maintenance_mode === 'true'} onChange={e => setSiteSettings({ ...siteSettings, maintenance_mode: e.target.checked ? 'true' : 'false' })} id="maintToggle" />
                                                    <label className="form-check-label text-danger fw-bold" htmlFor="maintToggle">Maintenance Mode</label>
                                                </div>
                                                <small className="text-danger d-block mt-1"><i className="fas fa-exclamation-triangle me-1"></i>Shows a maintenance page to all non-admin users.</small>
                                            </div>

                                            <div className="col-12 pt-3 border-top border-secondary border-opacity-25">
                                                <button className="btn btn-success" onClick={saveSiteSettings} disabled={!isSiteSettingsDirty()}><i className="fas fa-save me-2"></i>Save Site Settings</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* === SECTION 2: Admin Account === */}
                                {activeSettingsSection === 'account' && (
                                    <div className="d-flex flex-column gap-4">
                                        <div className="glass-card p-4">
                                            <h5 className="text-white mb-4"><i className="fas fa-user-shield me-2 text-info"></i>Admin Profile</h5>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label text-muted small text-uppercase">Email</label>
                                                    <input type="email" className="form-control bg-dark text-white border-secondary" value={user?.email || ''} disabled readOnly />
                                                    <small className="text-muted">Email cannot be changed from here.</small>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label text-muted small text-uppercase">Display Name</label>
                                                    <input type="text" className="form-control bg-dark text-white border-secondary" value={adminProfileName} onChange={e => setAdminProfileName(e.target.value)} placeholder="Your display name" />
                                                </div>
                                                <div className="col-12 pt-2">
                                                    <button className="btn btn-success" onClick={updateAdminProfile} disabled={!isProfileDirty()}><i className="fas fa-save me-2"></i>Update Profile</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="glass-card p-4">
                                            <h5 className="text-white mb-4"><i className="fas fa-lock me-2 text-warning"></i>Change Password</h5>
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <label className="form-label text-muted small text-uppercase">Current Password</label>
                                                    <input type="password" className="form-control bg-dark text-white border-secondary" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label text-muted small text-uppercase">New Password</label>
                                                    <input type="password" className="form-control bg-dark text-white border-secondary" value={passwordForm.newPass} onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })} placeholder="Min. 8 characters" />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label text-muted small text-uppercase">Confirm New Password</label>
                                                    <input type="password" className="form-control bg-dark text-white border-secondary" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
                                                </div>
                                                <div className="col-12 pt-2">
                                                    <button className="btn btn-warning text-dark" onClick={handleChangePassword} disabled={!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm}><i className="fas fa-key me-2"></i>Change Password</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* === SECTION 3: Email & Notifications === */}
                                {activeSettingsSection === 'notifications' && (
                                    <div className="glass-card p-4">
                                        <h5 className="text-white mb-4"><i className="fas fa-envelope me-2 text-info"></i>Email & Notifications</h5>
                                        <div className="d-flex flex-column gap-3 mb-4">
                                            <div className="form-check form-switch d-flex align-items-center gap-2">
                                                <input className="form-check-input border-secondary fs-5" type="checkbox" checked={notifPrefs.notify_admin_new_user === 'true'} onChange={e => setNotifPrefs({ ...notifPrefs, notify_admin_new_user: e.target.checked ? 'true' : 'false' })} id="notifNewUser" />
                                                <label className="form-check-label text-white" htmlFor="notifNewUser">Email me when a new user signs up</label>
                                            </div>
                                            <div className="form-check form-switch d-flex align-items-center gap-2">
                                                <input className="form-check-input border-secondary fs-5" type="checkbox" checked={notifPrefs.notify_admin_waitlist === 'true'} onChange={e => setNotifPrefs({ ...notifPrefs, notify_admin_waitlist: e.target.checked ? 'true' : 'false' })} id="notifWaitlist" />
                                                <label className="form-check-label text-white" htmlFor="notifWaitlist">Email me when course waitlist gets 10+ signups</label>
                                            </div>
                                            <div className="form-check form-switch d-flex align-items-center gap-2">
                                                <input className="form-check-input border-secondary fs-5" type="checkbox" checked={notifPrefs.notify_admin_completion === 'true'} onChange={e => setNotifPrefs({ ...notifPrefs, notify_admin_completion: e.target.checked ? 'true' : 'false' })} id="notifCompletion" />
                                                <label className="form-check-label text-white" htmlFor="notifCompletion">Email me when a user completes a course</label>
                                            </div>
                                        </div>
                                        <p className="text-muted small mb-3"><i className="fas fa-info-circle me-1"></i>Email notifications require a transactional email service (Resend, SendGrid, etc.) to be configured. These settings save your preferences for when you integrate one.</p>
                                        <button className="btn btn-success" onClick={saveNotificationPrefs} disabled={!isNotifDirty()}><i className="fas fa-save me-2"></i>Save Notification Preferences</button>
                                    </div>
                                )}

                                {/* === SECTION 4: Danger Zone === */}
                                {activeSettingsSection === 'danger' && (
                                    <div className="border border-danger rounded p-4" style={{ background: 'rgba(220,53,69,0.05)' }}>
                                        <h5 className="text-danger mb-4"><i className="fas fa-exclamation-triangle me-2"></i>Danger Zone</h5>
                                        <div className="d-flex flex-column gap-4">
                                            {/* Clear Waitlist */}
                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                <div>
                                                    <h6 className="text-white mb-1">Clear All Waitlist Emails</h6>
                                                    <p className="text-muted small mb-0">Permanently deletes all emails from the course waitlist. This cannot be undone.</p>
                                                </div>
                                                <button className="btn btn-outline-danger flex-shrink-0" onClick={() => setClearWaitlistModal(true)}>
                                                    <i className="fas fa-trash me-2"></i>Clear Waitlist
                                                </button>
                                            </div>

                                            {/* Reset Progress */}
                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                <div>
                                                    <h6 className="text-white mb-1">Reset All User Progress</h6>
                                                    <p className="text-muted small mb-0">Sets progress to 0% and clears completed lessons for every enrolled student.</p>
                                                </div>
                                                <button className="btn btn-outline-danger flex-shrink-0" onClick={() => setResetProgressModal(true)}>
                                                    <i className="fas fa-redo me-2"></i>Reset Progress
                                                </button>
                                            </div>

                                            {/* Export Backup */}
                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                <div>
                                                    <h6 className="text-white mb-1">Export Full Database Backup (JSON)</h6>
                                                    <p className="text-muted small mb-0">Downloads all profiles, enrollments, lessons, announcements, and settings as a JSON file. Non-destructive.</p>
                                                </div>
                                                <button className="btn btn-outline-warning flex-shrink-0" onClick={handleExportBackup}>
                                                    <i className="fas fa-download me-2"></i>Export Backup
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* --- OTHER TABS PLACEHOLDER --- */}
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

            {/* --- USER DRAWER OVERLAY --- */}
            {drawerUser && (
                <>
                    <div className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 z-2" onClick={closeUserDrawer} style={{ backdropFilter: 'blur(3px)' }}></div>
                    <div className="position-fixed top-0 end-0 h-100 bg-dark border-start border-secondary border-opacity-25 shadow-lg z-3 d-flex flex-column" style={{ width: '400px', maxWidth: '100%', transition: 'transform 0.3s ease-in-out', transform: 'translateX(0)' }}>
                        <div className="p-4 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-white"><i className="fas fa-user-circle me-2 text-info"></i>User Profile</h5>
                            <button className="btn btn-sm btn-outline-secondary text-white border-0" onClick={closeUserDrawer}><i className="fas fa-times fs-5"></i></button>
                        </div>
                        <div className="p-4 flex-grow-1 overflow-auto">
                            <div className="text-center mb-4">
                                <div className="bg-secondary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                    {drawerUser.avatar_url ? <img src={drawerUser.avatar_url} alt="" className="rounded-circle w-100 h-100" /> : <i className="fas fa-user fs-1 text-white"></i>}
                                </div>
                                <h4 className="text-white mb-1">{drawerUser.full_name || 'Anonymous User'}</h4>
                                <p className="text-muted mb-2">{drawerUser.email}</p>
                                {drawerUser.is_admin ? <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50">Administrator</span> : <span className="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-50">Student</span>}
                                <p className="small text-muted mt-3 mb-0">Last Active: {drawerUser.updated_at ? new Date(drawerUser.updated_at).toLocaleDateString() : 'N/A'}</p>
                            </div>

                            <h6 className="text-white mb-3 border-bottom border-secondary border-opacity-25 pb-2">Enrolled Courses ({drawerEnrollments.length})</h6>
                            {loadingDrawer ? (
                                <div className="text-center py-4"><div className="spinner-border text-info"></div></div>
                            ) : drawerEnrollments.length > 0 ? (
                                <div className="d-flex flex-column gap-3">
                                    {drawerEnrollments.map(enr => (
                                        <div key={enr.id} className="bg-dark bg-opacity-50 p-3 rounded border border-secondary border-opacity-25">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="fw-bold text-white text-truncate pe-2">{enr.courses?.title || 'Unknown Course'}</div>
                                                {enr.progress === 100 && <i className="fas fa-award text-warning" title="Certificate Earned"></i>}
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <div className="progress flex-grow-1 me-2" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                                    <div className={`progress-bar ${enr.progress === 100 ? 'bg-success' : 'bg-info'}`} style={{ width: `${enr.progress}%` }}></div>
                                                </div>
                                                <small className="text-muted">{enr.progress}%</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted py-4 glass-card">No enrollments found.</div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* --- CUSTOM MODALS --- */}
            {courseModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3" style={{ maxWidth: '600px', width: '100%', animation: 'fadeInUp 0.2s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="text-white mb-0">{courseForm.id ? 'Edit Course' : 'Add New Course'}</h4>
                            <button className="btn btn-sm btn-outline-secondary text-white border-0" onClick={() => setCourseModal({ isOpen: false, course: null })}><i className="fas fa-times fs-5"></i></button>
                        </div>
                        
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label text-muted small text-uppercase">Title</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase">Category ID</label>
                                <select className="form-select bg-dark text-white border-secondary" value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}>
                                    <option value="web-development">Web Development</option>
                                    <option value="data-science">Data Science</option>
                                    <option value="mobile-development">Mobile Development</option>
                                    <option value="design">Design</option>
                                </select>
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase">Level</label>
                                <select className="form-select bg-dark text-white border-secondary" value={courseForm.level} onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <label className="form-label text-muted small text-uppercase">Description</label>
                                <textarea className="form-control bg-dark text-white border-secondary" rows="3" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}></textarea>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase">Icon Class</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-dark border-secondary text-muted"><i className={courseForm.icon}></i></span>
                                    <input type="text" className="form-control bg-dark text-white border-secondary" value={courseForm.icon} onChange={e => setCourseForm({ ...courseForm, icon: e.target.value })} placeholder="fas fa-code" />
                                </div>
                            </div>
                            
                            <div className="col-md-6 d-flex align-items-end pb-2">
                                <div className="form-check form-switch d-flex align-items-center gap-2">
                                    <input className="form-check-input border-secondary fs-5" type="checkbox" role="switch" checked={courseForm.is_visible} onChange={e => setCourseForm({ ...courseForm, is_visible: e.target.checked })} id="visibilityToggle" />
                                    <label className="form-check-label text-white" htmlFor="visibilityToggle">Course is Visible</label>
                                </div>
                            </div>
                            
                            <div className="col-12 mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex gap-2">
                                <button className="btn btn-outline-light flex-grow-1" onClick={() => setCourseModal({ isOpen: false, course: null })}>Cancel</button>
                                <button className="btn btn-success flex-grow-1" onClick={saveCourse}><i className="fas fa-save me-2"></i>Save Course</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteCourseModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-danger border-opacity-50" style={{ maxWidth: '450px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
                            <h4 className="text-white">Delete Course?</h4>
                            <p className="text-muted mb-2">Are you sure you want to permanently delete <strong className="text-white">{deleteCourseModal.course?.title}</strong>?</p>
                            {deleteCourseModal.enrollmentCount > 0 && (
                                <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border-opacity-50 mt-3 text-start">
                                    <i className="fas fa-engine-warning me-2"></i> <strong>Warning:</strong> This course has {deleteCourseModal.enrollmentCount} enrolled student{deleteCourseModal.enrollmentCount !== 1 ? 's' : ''}. Deleting it will remove all their progress and access to this course!
                                </div>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => setDeleteCourseModal({ isOpen: false, course: null, enrollmentCount: 0 })}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1" onClick={executeDeleteCourse}>Yes, Delete It</button>
                        </div>
                    </div>
                </div>
            )}

            {adminModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3" style={{ maxWidth: '400px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className={`fas ${adminModal.user?.is_admin ? 'fa-user-times text-warning' : 'fa-user-shield text-success'} fs-1 mb-3`}></i>
                            <h4 className="text-white">Confirm Role Change</h4>
                            <p className="text-muted">Are you sure you want to {adminModal.user?.is_admin ? 'revoke admin rights from' : 'grant admin rights to'} <strong className="text-white">{adminModal.user?.email}</strong>?</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => setAdminModal({ isOpen: false, user: null })}>Cancel</button>
                            <button className={`btn ${adminModal.user?.is_admin ? 'btn-warning' : 'btn-success'} flex-grow-1`} onClick={toggleAdminStatus}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {resetModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-danger border-opacity-50" style={{ maxWidth: '400px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
                            <h4 className="text-white">Reset All Progress?</h4>
                            <p className="text-muted">This will permanently reset <strong>all course progress</strong> and revoke any certificates for <strong className="text-white">{resetModal.user?.email}</strong>. This action cannot be undone.</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => setResetModal({ isOpen: false, user: null })}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1" onClick={resetUserProgress}>Yes, Reset Progress</button>
                        </div>
                    </div>
                </div>
            )}
            {lessonModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 overflow-auto" style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-3 mb-4">
                            <h4 className="text-white mb-0">
                                <i className={`fas ${lessonModal.lesson ? 'fa-edit' : 'fa-plus'} me-2 text-info`}></i>
                                {lessonModal.lesson ? 'Edit Lesson' : 'Add New Lesson'}
                            </h4>
                            <button className="btn btn-sm btn-outline-secondary text-white border-0" onClick={() => setLessonModal({ isOpen: false, lesson: null })}>
                                <i className="fas fa-times fs-5"></i>
                            </button>
                        </div>

                        <div className="row g-3">
                            <div className="col-md-8">
                                <label className="form-label text-muted small text-uppercase">Lesson Title</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="e.g. Introduction to React" />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label text-muted small text-uppercase">Duration (mins)</label>
                                <input type="number" className="form-control bg-dark text-white border-secondary" value={lessonForm.duration_minutes} onChange={e => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) || 0 })} />
                            </div>

                            <div className="col-12 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
                                <label className="form-label text-muted small text-uppercase">Content</label>
                                <div className="bg-white rounded overflow-hidden">
                                    <ReactQuill 
                                        theme="snow" 
                                        value={lessonForm.content} 
                                        onChange={(content) => setLessonForm({ ...lessonForm, content })} 
                                        style={{ height: '200px', color: '#000' }}
                                    />
                                </div>
                                <small className="text-muted mt-5 d-block">Note: Scroll down in the editor to see all content.</small>
                            </div>

                            <div className="col-12 d-flex align-items-center mb-2">
                                <div className="form-check form-switch fs-5">
                                    <input className="form-check-input border-secondary" type="checkbox" role="switch" checked={lessonForm.has_quiz} onChange={e => setLessonForm({ ...lessonForm, has_quiz: e.target.checked })} id="quizToggle" />
                                    <label className="form-check-label text-white ms-2" htmlFor="quizToggle">Include Quiz at end of lesson?</label>
                                </div>
                            </div>

                            {lessonForm.has_quiz && (
                                <div className="col-12 bg-dark bg-opacity-50 p-4 rounded border border-info border-opacity-25 mb-3">
                                    <h5 className="text-info mb-3"><i className="fas fa-question-circle me-2"></i>Lesson Quiz Setup</h5>
                                    
                                    <div className="mb-3">
                                        <label className="form-label text-muted small text-uppercase">Question</label>
                                        <input type="text" className="form-control bg-dark text-white border-secondary" value={lessonForm.quiz_question} onChange={e => setLessonForm({ ...lessonForm, quiz_question: e.target.value })} placeholder="What does HTML stand for?" />
                                    </div>

                                    <div className="row g-2 mb-3">
                                        {lessonForm.quiz_options.map((opt, i) => (
                                            <div key={i} className="col-md-6">
                                                <label className="form-label text-muted small text-uppercase">Option {String.fromCharCode(65 + i)}</label>
                                                <div className="input-group">
                                                    <div className="input-group-text bg-dark border-secondary">
                                                        <input 
                                                            className="form-check-input mt-0 border-secondary" 
                                                            type="radio" 
                                                            name="correctAnswer" 
                                                            checked={lessonForm.quiz_correct_index === i}
                                                            onChange={() => setLessonForm({ ...lessonForm, quiz_correct_index: i })}
                                                        />
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        className="form-control bg-dark text-white border-secondary" 
                                                        value={opt} 
                                                        onChange={e => {
                                                            const newOptions = [...lessonForm.quiz_options];
                                                            newOptions[i] = e.target.value;
                                                            setLessonForm({ ...lessonForm, quiz_options: newOptions });
                                                        }} 
                                                        placeholder={`Answer ${String.fromCharCode(65 + i)}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label text-muted small text-uppercase">Passing Score (%)</label>
                                        <input type="number" min="0" max="100" className="form-control bg-dark text-white border-secondary" value={lessonForm.quiz_pass_score} onChange={e => setLessonForm({ ...lessonForm, quiz_pass_score: parseInt(e.target.value) || 70 })} />
                                    </div>
                                </div>
                            )}

                            <div className="col-12 mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex gap-2">
                                <button className="btn btn-outline-light flex-grow-1" onClick={() => setLessonModal({ isOpen: false, lesson: null })}>Cancel</button>
                                <button className="btn btn-success flex-grow-1" onClick={handleSaveLesson}><i className="fas fa-save me-2"></i>Save Lesson</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteLessonModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-danger border-opacity-50" style={{ maxWidth: '400px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
                            <h4 className="text-white">Delete Lesson?</h4>
                            <p className="text-muted">Are you sure you want to permanently delete this lesson? This action cannot be undone.</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => setDeleteLessonModal({ isOpen: false, lessonId: null })}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1" onClick={executeDeleteLesson}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {resetEnrollmentModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-warning border-opacity-50" style={{ maxWidth: '450px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-redo text-warning fs-1 mb-3"></i>
                            <h4 className="text-white">Reset Course Progress?</h4>
                            <p className="text-muted">Are you sure you want to reset progress to 0% for <strong className="text-white">{resetEnrollmentModal.enrollment?.profiles?.full_name || resetEnrollmentModal.enrollment?.profiles?.email}</strong> in <strong className="text-white">{resetEnrollmentModal.enrollment?.courses?.title}</strong>? All completed lessons will be cleared.</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => setResetEnrollmentModal({ isOpen: false, enrollment: null })}>Cancel</button>
                            <button className="btn btn-warning flex-grow-1" onClick={handleResetEnrollment}>Yes, Reset</button>
                        </div>
                    </div>
                </div>
            )}

            {removeEnrollmentModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-danger border-opacity-50" style={{ maxWidth: '450px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-user-minus text-danger fs-1 mb-3"></i>
                            <h4 className="text-white">Remove Enrollment?</h4>
                            <p className="text-muted">This will completely remove <strong className="text-white">{removeEnrollmentModal.enrollment?.profiles?.full_name || removeEnrollmentModal.enrollment?.profiles?.email}</strong> from <strong className="text-white">{removeEnrollmentModal.enrollment?.courses?.title}</strong>. They will lose access to the course content.</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => setRemoveEnrollmentModal({ isOpen: false, enrollment: null })}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1" onClick={handleRemoveEnrollment}>Yes, Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteWaitlistModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-danger border-opacity-50" style={{ maxWidth: '400px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-trash-alt text-danger fs-1 mb-3"></i>
                            <h4 className="text-white">Remove from Waitlist?</h4>
                            <p className="text-muted">Remove <strong className="text-white">{deleteWaitlistModal.entry?.email}</strong> from the waitlist?</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => setDeleteWaitlistModal({ isOpen: false, entry: null })}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1" onClick={handleDeleteWaitlistEntry}>Yes, Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {announcementModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3" style={{ maxWidth: '550px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="text-white mb-0">
                                <i className={`fas ${announcementModal.announcement ? 'fa-edit' : 'fa-plus'} me-2 text-info`}></i>
                                {announcementModal.announcement ? 'Edit Announcement' : 'New Announcement'}
                            </h4>
                            <button className="btn btn-sm btn-outline-secondary text-white border-0" onClick={() => setAnnouncementModal({ isOpen: false, announcement: null })}>
                                <i className="fas fa-times fs-5"></i>
                            </button>
                        </div>
                        
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label text-muted small text-uppercase">Title</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="e.g. New Course Available!" />
                            </div>
                            <div className="col-12">
                                <label className="form-label text-muted small text-uppercase">Body</label>
                                <textarea className="form-control bg-dark text-white border-secondary" rows="4" value={announcementForm.body} onChange={e => setAnnouncementForm({ ...announcementForm, body: e.target.value })} placeholder="Write your announcement message..."></textarea>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase">Type</label>
                                <select className="form-select bg-dark text-white border-secondary" value={announcementForm.type} onChange={e => setAnnouncementForm({ ...announcementForm, type: e.target.value })}>
                                    <option value="info">Info (Blue)</option>
                                    <option value="warning">Warning (Yellow)</option>
                                    <option value="success">Success (Green)</option>
                                    <option value="danger">Danger (Red)</option>
                                </select>
                            </div>
                            <div className="col-md-6 d-flex align-items-end pb-2">
                                <div className="form-check form-switch d-flex align-items-center gap-2">
                                    <input className="form-check-input border-secondary fs-5" type="checkbox" role="switch" checked={announcementForm.is_active} onChange={e => setAnnouncementForm({ ...announcementForm, is_active: e.target.checked })} id="announcementActiveToggle" />
                                    <label className="form-check-label text-white" htmlFor="announcementActiveToggle">Active (visible to students)</label>
                                </div>
                            </div>
                            <div className="col-12 mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex gap-2">
                                <button className="btn btn-outline-light flex-grow-1" onClick={() => setAnnouncementModal({ isOpen: false, announcement: null })}>Cancel</button>
                                <button className="btn btn-success flex-grow-1" onClick={handleSaveAnnouncement}><i className="fas fa-save me-2"></i>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteAnnouncementModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-danger border-opacity-50" style={{ maxWidth: '400px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-trash-alt text-danger fs-1 mb-3"></i>
                            <h4 className="text-white">Delete Announcement?</h4>
                            <p className="text-muted">Permanently delete "<strong className="text-white">{deleteAnnouncementModal.announcement?.title}</strong>"?</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => setDeleteAnnouncementModal({ isOpen: false, announcement: null })}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1" onClick={handleDeleteAnnouncement}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Notification Confirmation */}
            {deleteNotifModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-danger border-opacity-50" style={{ maxWidth: '400px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-trash-alt text-danger fs-1 mb-3"></i>
                            <h4 className="text-white">Delete Notification?</h4>
                            <p className="text-muted">Permanently delete "<strong className="text-white">{deleteNotifModal.notif?.title}</strong>"? Read receipts will also be removed.</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => setDeleteNotifModal({ isOpen: false, notif: null })}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1" onClick={deleteNotification}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear Waitlist Confirmation */}
            {clearWaitlistModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-danger border-opacity-50" style={{ maxWidth: '450px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-trash text-danger fs-1 mb-3"></i>
                            <h4 className="text-white">Clear All Waitlist?</h4>
                            <p className="text-muted">This will permanently delete <strong className="text-white">all waitlist emails</strong>. This cannot be undone.</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => setClearWaitlistModal(false)}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1" onClick={handleClearWaitlist}>Yes, Clear All</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset All Progress Confirmation */}
            {resetProgressModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-danger border-opacity-50" style={{ maxWidth: '480px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
                            <h4 className="text-white">Reset ALL User Progress?</h4>
                            <p className="text-muted">This will set progress to 0% and clear completed lessons for <strong className="text-white">every enrolled student</strong>. This cannot be undone.</p>
                            <p className="text-warning small fw-bold">Type <code className="text-danger">RESET ALL</code> to confirm:</p>
                            <input type="text" className="form-control bg-dark text-white border-secondary text-center" value={resetConfirmText} onChange={e => setResetConfirmText(e.target.value)} placeholder="RESET ALL" />
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => { setResetProgressModal(false); setResetConfirmText(''); }}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1" onClick={handleResetAllProgress} disabled={resetConfirmText !== 'RESET ALL'}>Confirm Reset</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
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

export default Admin;
