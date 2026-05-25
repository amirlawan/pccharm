import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import QuizSection from '../components/QuizSection';
import { markLessonComplete, getCourseProgress, isLessonComplete } from '../lib/progressService';
import confetti from 'canvas-confetti';
import DOMPurify from 'dompurify';

const CourseViewer = () => {
    const { courseId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [courseProgress, setCourseProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedModules, setExpandedModules] = useState({});
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [savingProgress, setSavingProgress] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [lessonNotes, setLessonNotes] = useState('');
    const [scrollProgress, setScrollProgress] = useState('0%');
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate('/login');
            return;
        }

        const fetchCourseContent = async () => {
            setLoading(true);
            try {
                // Fetch Course Info
                const { data: courseData, error: courseError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('id', courseId)
                    .single();

                if (courseError) throw courseError;
                setCourse(courseData);

                // Fetch Lessons — try order_index first, fall back to order
                const { data: lessonsData, error: lessonsError } = await supabase
                    .from('lessons')
                    .select('*')
                    .eq('course_id', courseId)
                    .order('order_index', { ascending: true })
                    .order('order', { ascending: true });

                if (lessonsError) throw lessonsError;
                setLessons(lessonsData || []);

                // Fetch Quizzes (may not exist — catch silently)
                try {
                    const { data: quizzesData, error: quizzesError } = await supabase
                        .from('quizzes')
                        .select('*')
                        .eq('course_id', courseId)
                        .order('order', { ascending: true });

                    if (!quizzesError) {
                        setQuizzes(quizzesData || []);
                    }
                } catch {
                    // Quizzes table may not exist — that's fine
                    setQuizzes([]);
                }

                // Determine active lesson and progress
                // FIX: was using undefined `currentUser` — now correctly uses `user`
                const progress = await getCourseProgress(user.id, courseId);
                setCompletedLessons(progress.completed_lessons || []);
                setCourseProgress(progress.progress || 0);

                // Set initial active lesson to first incomplete, or first lesson
                if (lessonsData && lessonsData.length > 0) {
                    const firstIncomplete = lessonsData.find(
                        l => !progress.completed_lessons?.includes(l.id)
                    );
                    setActiveLesson(firstIncomplete || lessonsData[0]);
                }

                // Auto-expand first module
                if (lessonsData && lessonsData.length > 0) {
                    const firstModuleTitle = getModuleTitle(lessonsData[0].title);
                    if (firstModuleTitle) {
                        setExpandedModules({ [firstModuleTitle]: true });
                    } else {
                        // If no module pattern, expand "All Lessons"
                        setExpandedModules({ 'All Lessons': true });
                    }
                }

            } catch (error) {
                console.error("Error loading course:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseContent();
    }, [courseId, user, authLoading, navigate]);

    // Fetch quiz questions when rendering a quiz
    useEffect(() => {
        const fetchQuizDetails = async () => {
            if (!activeLesson || activeLesson.type !== 'quiz') {
                setQuizQuestions([]);
                return;
            }

            try {
                // Fetch questions
                const { data: questions, error: qError } = await supabase
                    .from('quiz_questions')
                    .select('*')
                    .eq('quiz_id', activeLesson.id)
                    .order('order');

                if (qError) throw qError;

                if (questions && questions.length > 0) {
                    // Fetch options for all questions
                    const questionIds = questions.map(q => q.id);
                    const { data: options, error: oError } = await supabase
                        .from('quiz_options')
                        .select('*')
                        .in('question_id', questionIds);

                    if (oError) throw oError;

                    // Group options by question
                    const transformedQuestions = questions.map(q => {
                        const qOptions = (options || []).filter(o => o.question_id === q.id);
                        const correctIndex = qOptions.findIndex(o => o.is_correct);

                        return {
                            id: q.id,
                            question: q.question_text,
                            options: qOptions.map(o => o.option_text),
                            correct_index: correctIndex
                        };
                    });

                    setQuizQuestions(transformedQuestions);
                } else {
                    setQuizQuestions([]);
                }
            } catch (err) {
                console.error("Error fetching quiz details:", err);
            }
        };

        fetchQuizDetails();

        // Auto-expand module for active quiz/lesson
        if (activeLesson) {
            let moduleTitle = null;
            if (activeLesson.type === 'quiz') {
                const moduleNum = activeLesson.module_id?.replace('module-', '');
                moduleTitle = moduleNum ? `Module ${moduleNum}` : null;
            } else {
                moduleTitle = getModuleTitle(activeLesson.title);
            }

            if (moduleTitle) {
                setExpandedModules(prev => ({ ...prev, [moduleTitle]: true }));
            }
        }

    }, [activeLesson?.id]);

    // Load notes when lesson changes
    useEffect(() => {
        if (activeLesson && user) {
            const savedNotes = localStorage.getItem(`notes_${user.id}_${activeLesson.id}`);
            setLessonNotes(savedNotes || '');
        }
    }, [activeLesson, user]);

    // Save notes
    const handleNotesChange = (e) => {
        const val = e.target.value;
        setLessonNotes(val);
        if (activeLesson && user) {
            localStorage.setItem(`notes_${user.id}_${activeLesson.id}`, val);
        }
    };

    // Scroll Progress logic
    useEffect(() => {
        const container = document.getElementById('lesson-content-container');
        if (!container) return;

        const handleScroll = () => {
            const totalScroll = container.scrollTop;
            const windowHeight = container.scrollHeight - container.clientHeight;
            const scroll = windowHeight > 0 ? `${(totalScroll / windowHeight) * 100}%` : '0%';
            setScrollProgress(scroll);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [activeLesson]);

    // Copy Code Utility
    useEffect(() => {
        if (!activeLesson || activeLesson.type === 'quiz') return;
        
        const timeout = setTimeout(() => {
            const preBlocks = document.querySelectorAll('.quill-content pre.ql-syntax');
            
            preBlocks.forEach(pre => {
                if (pre.querySelector('.copy-code-btn')) return;

                pre.style.position = 'relative';

                const btn = document.createElement('button');
                btn.className = 'btn btn-sm copy-code-btn';
                btn.innerHTML = '<i class="far fa-copy"></i>';
                btn.style.position = 'absolute';
                btn.style.top = '5px';
                btn.style.right = '5px';
                btn.style.background = 'rgba(255,255,255,0.1)';
                btn.style.border = '1px solid rgba(255,255,255,0.2)';
                btn.style.color = '#fff';
                btn.style.borderRadius = '4px';
                btn.style.cursor = 'pointer';
                btn.style.padding = '2px 8px';
                btn.style.fontSize = '12px';
                btn.style.transition = 'all 0.2s';
                btn.title = "Copy Code";

                btn.onmouseover = () => btn.style.background = 'rgba(255,255,255,0.2)';
                btn.onmouseout = () => btn.style.background = 'rgba(255,255,255,0.1)';

                btn.onclick = () => {
                    const clone = pre.cloneNode(true);
                    const btnInClone = clone.querySelector('.copy-code-btn');
                    if (btnInClone) clone.removeChild(btnInClone);
                    
                    navigator.clipboard.writeText(clone.innerText).then(() => {
                        btn.innerHTML = '<i class="fas fa-check text-success"></i> Copied!';
                        btn.style.background = 'rgba(25, 135, 84, 0.2)';
                        btn.style.borderColor = 'rgba(25, 135, 84, 0.5)';
                        setTimeout(() => {
                            btn.innerHTML = '<i class="far fa-copy"></i>';
                            btn.style.background = 'rgba(255,255,255,0.1)';
                            btn.style.borderColor = 'rgba(255,255,255,0.2)';
                        }, 2000);
                    });
                };

                pre.appendChild(btn);
            });
        }, 150);

        return () => clearTimeout(timeout);
    }, [activeLesson]);

    // Helper to detect if a lesson is a module header
    const isModuleHeader = (title) => {
        return title?.toLowerCase().startsWith('module ');
    };

    // Get module title from lesson title
    const getModuleTitle = (lessonTitle) => {
        if (!lessonTitle) return null;
        if (isModuleHeader(lessonTitle)) {
            return lessonTitle;
        }
        return null;
    };

    // Organize lessons and quizzes into modules sequentially based on drag order
    const organizedLessons = () => {
        const modules = {};
        let currentModuleKey = "Course Introduction"; // Default starting group

        // 1. Process Lessons in order
        lessons.forEach(lesson => {
            if (isModuleHeader(lesson.title)) {
                currentModuleKey = lesson.title;
                if (!modules[currentModuleKey]) {
                    modules[currentModuleKey] = { header: lesson, items: [] };
                } else {
                    modules[currentModuleKey].header = lesson;
                }
            } else {
                if (!modules[currentModuleKey]) {
                    modules[currentModuleKey] = { header: null, items: [] };
                }
                modules[currentModuleKey].items.push({ ...lesson, type: 'lesson' });
            }
        });

        // 2. Process Quizzes and append to modules
        quizzes.forEach(quiz => {
            const moduleNum = quiz.module_id?.replace('module-', '');
            if (!moduleNum) return;
            
            // Attempt to find the matching module key
            const targetModuleKey = Object.keys(modules).find(key => 
                key.toLowerCase().includes(`module ${moduleNum}:`) || 
                key.toLowerCase() === `module ${moduleNum}`
            );
            const finalKey = targetModuleKey || `Module ${moduleNum}`;

            if (modules[finalKey]) {
                modules[finalKey].items.push({
                    ...quiz,
                    type: 'quiz',
                });
            } else {
                modules[finalKey] = { header: { title: finalKey }, items: [{ ...quiz, type: 'quiz' }] };
            }
        });

        return modules;
    };

    const toggleModule = (moduleName) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleName]: !prev[moduleName]
        }));
    };

    const handleLessonChange = (item) => {
        setActiveLesson(item);
        setSidebarOpen(false); // Close mobile sidebar
        const contentContainer = document.getElementById('lesson-content-container');
        if (contentContainer) contentContainer.scrollTop = 0;
    };

    const handleLessonComplete = async () => {
        if (!user || !activeLesson || savingProgress) return;
        setSavingProgress(true);
        const result = await markLessonComplete(user.id, courseId, activeLesson.id);
        if (result.success) {
            setCompletedLessons(result.completedLessons);
            setCourseProgress(result.progress);
            
            // Trigger Confetti!
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#00e676', '#18ffff', '#e040fb', '#ffcf26']
            });

            setShowSuccessToast(true);
            const contentContainer = document.getElementById('lesson-content-container');
            if (contentContainer) {
                contentContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }

            setTimeout(() => {
                setShowSuccessToast(false);
                const nextItem = getNextItem();
                if (nextItem) {
                    handleLessonChange(nextItem);
                } else {
                    sessionStorage.setItem('courseCompleted', 'true');
                    navigate('/dashboard');
                }
            }, 1500);
        }
        setSavingProgress(false);
    };

    const getNextItem = () => {
        // Flatten all items to find next, skipping module headers
        const allItems = [];
        const modules = organizedLessons();
        Object.values(modules).forEach(m => {
            allItems.push(...m.items);
        });

        if (!activeLesson || !allItems.length) return null;
        const currentIndex = allItems.findIndex(i => i.id === activeLesson.id);
        return currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;
    };

    const getPrevItem = () => {
        const allItems = [];
        const modules = organizedLessons();
        Object.values(modules).forEach(m => {
            allItems.push(...m.items);
        });

        if (!activeLesson || !allItems.length) return null;
        const currentIndex = allItems.findIndex(i => i.id === activeLesson.id);
        return currentIndex > 0 ? allItems[currentIndex - 1] : null;
    };

    // Format duration for display
    const formatDuration = (mins) => {
        if (!mins || mins <= 0) return null;
        if (mins < 60) return `${mins} min`;
        const hrs = Math.floor(mins / 60);
        const rem = mins % 60;
        return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="loader"></div></div>;
    if (!course) return <div className="text-center py-5 mt-5">Course not found.</div>;

    const nextItem = getNextItem();
    const prevItem = getPrevItem();
    const currentItemComplete = isLessonComplete(completedLessons, activeLesson?.id);
    const modules = organizedLessons();

    // Flatten items for numbering and progress (skipping headers)
    const allItems = [];
    Object.values(modules).forEach(m => {
        allItems.push(...m.items);
    });
    const totalItems = allItems.length;
    const currentItemIndex = activeLesson ? allItems.findIndex(i => i.id === activeLesson.id) + 1 : 0;

    const renderSidebarContent = () => (
        <>
            {/* Sidebar Header */}
            <div className="p-3 border-bottom border-secondary border-opacity-25 sticky-top bg-dark bg-opacity-90" style={{ backdropFilter: 'blur(10px)' }}>
                <Link to="/dashboard" className="text-muted text-decoration-none small mb-2 d-block hover-text-white">
                    <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
                </Link>
                <h6 className="mb-2 text-truncate fw-bold text-info" title={course.title}>{course.title}</h6>

                {/* Progress Bar */}
                <div className="progress" style={{ height: '6px' }}>
                    <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${courseProgress}%` }}
                    ></div>
                </div>
                <small className="text-muted">{courseProgress}% complete</small>
            </div>

            {/* Module List */}
            <div className="flex-grow-1 p-2">
                {Object.keys(modules).length > 0 ? (
                    Object.entries(modules).map(([moduleName, moduleData]) => (
                        <div key={moduleName} className="mb-2">
                            {/* Module Header (Collapsible) */}
                            <button
                                className="btn btn-sm w-100 text-start d-flex align-items-center justify-content-between py-2 px-3"
                                style={{
                                    background: expandedModules[moduleName] ? 'rgba(var(--bs-info-rgb), 0.2)' : 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                onClick={() => toggleModule(moduleName)}
                            >
                                <div className="d-flex align-items-center">
                                    <i
                                        className={`fas fa-chevron-${expandedModules[moduleName] ? 'down' : 'right'} me-2 small`}
                                        style={{ width: '12px', cursor: 'pointer' }}
                                        onClick={(e) => { e.stopPropagation(); toggleModule(moduleName); }}
                                    ></i>
                                    <span className="fw-medium small">{moduleName}</span>
                                </div>
                                {moduleData.items.length > 0 && (
                                    <span className="badge bg-secondary small">{moduleData.items.length}</span>
                                )}
                            </button>

                            {/* Collapsible Lessons & Quizzes */}
                            <div
                                className="overflow-hidden transition-all"
                                style={{
                                    maxHeight: expandedModules[moduleName] ? '2000px' : '0',
                                    transition: 'max-height 0.3s ease-out'
                                }}
                            >
                                {moduleData.items.map((item) => {
                                    const complete = isLessonComplete(completedLessons, item.id);
                                    const isActive = activeLesson?.id === item.id;
                                    const isQuiz = item.type === 'quiz';
                                    const globalIdx = allItems.findIndex(i => i.id === item.id) + 1;

                                    return (
                                        <button
                                            key={item.id}
                                            className="btn btn-sm w-100 text-start py-2 ps-4 pe-3 border-0"
                                            style={{
                                                background: isActive ? 'rgba(var(--bs-info-rgb), 0.15)' : 'transparent',
                                                borderLeft: isActive ? '3px solid var(--bs-info)' : '3px solid transparent',
                                                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                                                marginTop: '2px'
                                            }}
                                            onClick={() => handleLessonChange(item)}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="small text-truncate" style={{ maxWidth: '200px' }}>
                                                    <span className="text-muted me-2">{globalIdx}.</span>
                                                    {isQuiz && <i className="fas fa-question-circle me-1 text-warning"></i>}
                                                    {item.title.replace(/^\d+\.\d+\s*/, '')}
                                                </span>
                                                <div className="d-flex align-items-center gap-1">
                                                    {item.duration_minutes > 0 && (
                                                        <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                                                            {formatDuration(item.duration_minutes)}
                                                        </span>
                                                    )}
                                                    {complete && <i className="fas fa-check-circle text-success small"></i>}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-3 text-muted">
                        <small>No content available yet.</small>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <div className="d-flex flex-column flex-md-row w-100 overflow-hidden" style={{ height: '100vh', paddingTop: '70px' }}>
            {/* Mobile Top Bar with intuitive course title and map button */}
            <div className="d-md-none bg-dark border-bottom border-secondary border-opacity-25 p-3 d-flex justify-content-between align-items-center z-3 shadow-sm" style={{ flexShrink: 0 }}>
                <div className="d-flex align-items-center gap-2">
                    <Link to="/dashboard" className="text-muted text-decoration-none me-2 hover-text-white">
                        <i className="fas fa-arrow-left"></i>
                    </Link>
                    <span className="fw-bold text-info text-truncate" style={{ maxWidth: '180px' }} title={course?.title}>{course?.title}</span>
                </div>
                <button 
                    className="btn btn-gradient btn-sm px-3 py-1.5 rounded-pill d-flex align-items-center gap-1 shadow-sm"
                    onClick={() => setSidebarOpen(true)}
                    style={{ fontWeight: '600', fontSize: '0.85rem' }}
                >
                    <i className="fas fa-map-marked-alt"></i> Course Map
                </button>
            </div>

            {/* Mobile Sidebar Backdrop Overlay */}
            <div 
                className={`mobile-sidebar-backdrop d-md-none ${sidebarOpen ? 'show' : ''}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Mobile Sidebar Slide-out Drawer */}
            <div className={`mobile-sidebar-drawer d-md-none ${sidebarOpen ? 'open' : ''}`}>
                <div className="d-flex justify-content-between align-items-center px-4 pb-3 border-bottom border-secondary border-opacity-25">
                    <span className="fw-bold text-info"><i className="fas fa-map-marked-alt me-2"></i>Course Map</span>
                    <button className="btn btn-sm btn-outline-light border-0 text-white" onClick={() => setSidebarOpen(false)}>
                        <i className="fas fa-times fs-5"></i>
                    </button>
                </div>
                <div className="flex-grow-1 overflow-auto">
                    {renderSidebarContent()}
                </div>
            </div>

            {/* Desktop Sidebar */}
            {!focusMode && (
                <div
                    className="glass-card no-hover rounded-0 border-end border-secondary border-opacity-25 d-none d-md-flex flex-column"
                    style={{
                        width: '300px',
                        flexShrink: 0,
                        height: '100%',
                        overflowY: 'auto',
                        transition: 'width 0.3s'
                    }}
                >
                    {renderSidebarContent()}
                </div>
            )}

            {/* Main Content */}
            <div id="lesson-content-container" className="flex-grow-1 overflow-auto bg-dark position-relative h-100" style={{ scrollBehavior: 'smooth' }}>
                {/* Scroll Progress Bar */}
                <div 
                    className="position-sticky top-0 z-3" 
                    style={{ height: '3px', width: scrollProgress, background: 'var(--gradient-1)', transition: 'width 0.15s ease-out' }}
                ></div>

                {/* Toast Notification */}
                {showSuccessToast && (
                    <div className="position-fixed top-0 start-50 translate-middle-x mt-3 z-3 animate-fade-in" style={{ marginTop: '80px' }}>
                        <div className="toast show align-items-center text-white bg-success border-0 shadow-lg" role="alert">
                            <div className="d-flex px-3 py-2">
                                <div className="toast-body fs-6 fw-bold">
                                    <i className="fas fa-check-circle me-2"></i> Lesson complete!
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="container py-4 py-md-5 px-3 px-lg-5 mx-auto" style={{ maxWidth: '800px' }}>
                    {activeLesson ? (
                        <div className="animate-fade-in">
                            {/* Sleek Lesson Indicator */}
                            <div className="d-flex justify-content-between align-items-center mb-3 small text-muted fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
                                <span>Lesson {currentItemIndex} of {totalItems}</span>
                            </div>

                            <nav aria-label="breadcrumb" className="mb-4">
                                <ol className="breadcrumb small text-muted mb-0">
                                    <li className="breadcrumb-item">{course.title}</li>
                                    <li className="breadcrumb-item active text-info" aria-current="page">
                                        {activeLesson.type === 'quiz'
                                            ? `Module ${activeLesson.module_id?.replace('module-', '') || '?'} Assessment`
                                            : (isModuleHeader(activeLesson.title) ? activeLesson.title.split(':')[0] : activeLesson.title)}
                                    </li>
                                </ol>
                            </nav>

                            <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
                                <h2 className="mb-0 fw-bold fs-4 fs-md-2 flex-grow-1">{activeLesson.title}</h2>
                                
                                <div className="d-flex gap-2 align-items-center flex-wrap">
                                    {activeLesson.duration_minutes > 0 && (
                                        <span className="badge bg-dark border border-secondary text-muted d-flex align-items-center">
                                            <i className="far fa-clock me-1"></i>{formatDuration(activeLesson.duration_minutes)}
                                        </span>
                                    )}
                                    {currentItemComplete && (
                                        <span className="badge bg-success d-flex align-items-center">
                                            <i className="fas fa-check me-1"></i> Completed
                                        </span>
                                    )}
                                    <div className="btn-group shadow-sm ms-md-2">
                                        <button 
                                            className={`btn btn-sm ${notesOpen ? 'btn-warning text-dark' : 'btn-outline-warning'}`}
                                            onClick={() => setNotesOpen(!notesOpen)}
                                            title="Toggle My Notes"
                                        >
                                            <i className="fas fa-sticky-note me-1"></i> Notes
                                        </button>
                                        <button 
                                            className={`btn btn-sm d-none d-md-inline-block ${focusMode ? 'btn-info' : 'btn-outline-info'}`}
                                            onClick={() => setFocusMode(!focusMode)}
                                            title="Toggle Focus Mode"
                                        >
                                            <i className={`fas ${focusMode ? 'fa-compress' : 'fa-expand'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {activeLesson.video_url && (
                                <div className="ratio ratio-16x9 mb-5 rounded overflow-hidden shadow-lg border border-secondary border-opacity-25">
                                    <iframe
                                        src={activeLesson.video_url}
                                        title={activeLesson.title}
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}

                            {activeLesson.type === 'quiz' ? (
                                <QuizSection
                                    questions={quizQuestions}
                                    onPass={handleLessonComplete}
                                    isCompleted={currentItemComplete}
                                />
                            ) : (
                                <div className="lesson-content p-4 p-md-5 rounded-4 shadow-sm" style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {activeLesson.content ? (
                                        <div 
                                            className="quill-content"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeLesson.content) }}
                                        />
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fas fa-file-alt fs-1 text-secondary mb-3 d-block"></i>
                                            <p className="text-muted">No content has been added to this lesson yet.</p>
                                        </div>
                                    )}

                                    {/* Inline quiz from lesson (has_quiz field) */}
                                    {activeLesson.has_quiz && activeLesson.quiz_question && (
                                        <div className="mt-5 pt-4 border-top border-secondary border-opacity-25">
                                            <h5 className="text-warning mb-3"><i className="fas fa-question-circle me-2"></i>Quick Quiz</h5>
                                            <QuizSection
                                                questions={[{
                                                    id: `inline-${activeLesson.id}`,
                                                    question: activeLesson.quiz_question,
                                                    options: activeLesson.quiz_options || [],
                                                    correct_index: activeLesson.quiz_correct_index || 0
                                                }]}
                                                onPass={() => {}}
                                                isCompleted={false}
                                                passScore={activeLesson.quiz_pass_score || 70}
                                            />
                                        </div>
                                    )}

                                    {/* Mark Complete Button for Non-Quiz */}
                                    <div className="mt-5 pt-4 border-top border-secondary border-opacity-25 d-flex justify-content-center">
                                        {currentItemComplete ? (
                                            <div className="text-success fw-bold d-flex align-items-center bg-success bg-opacity-10 px-4 py-2 rounded-pill">
                                                <i className="fas fa-check-circle me-2"></i> Lesson Completed
                                            </div>
                                        ) : (
                                            <button 
                                                className="btn btn-outline-success rounded-pill px-5 py-2 fw-bold d-flex align-items-center transition-all"
                                                onClick={handleLessonComplete}
                                                disabled={savingProgress}
                                                style={{ letterSpacing: '0.5px' }}
                                            >
                                                {savingProgress ? (
                                                    <><span className="spinner-border spinner-border-sm me-2"></span> Saving...</>
                                                ) : (
                                                    <>Mark as Complete <i className="fas fa-check ms-2"></i></>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="d-flex justify-content-between align-items-center mt-5 mb-5 pb-5 gap-2 flex-wrap">
                                <button
                                    className="btn btn-outline-light d-flex align-items-center gap-2"
                                    onClick={() => prevItem && handleLessonChange(prevItem)}
                                    disabled={!prevItem}
                                    style={{ visibility: prevItem ? 'visible' : 'hidden' }}
                                >
                                    <i className="fas fa-chevron-left"></i> <span className="d-none d-sm-inline">Previous</span>
                                </button>

                                {nextItem ? (
                                    <button
                                        className="btn btn-gradient d-flex align-items-center gap-2"
                                        onClick={() => handleLessonChange(nextItem)}
                                    >
                                        <span className="d-none d-sm-inline">{nextItem.type === 'quiz' ? 'Take Quiz' : 'Next Lesson'}</span> <i className="fas fa-chevron-right"></i>
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-success d-flex align-items-center gap-2"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Complete Course <i className="fas fa-check"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5 mt-5">
                            <h3>Welcome to {course.title}</h3>
                            <p className="lead text-muted">Select a lesson from the sidebar to begin learning.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Notes Sidebar */}
            {notesOpen && (
                <div
                    className="glass-card no-hover rounded-0 border-start border-secondary border-opacity-25 d-flex flex-column shadow-lg"
                    style={{
                        width: '350px',
                        maxWidth: '85vw',
                        flexShrink: 0,
                        height: '100%',
                        background: 'rgba(10, 17, 40, 0.98)',
                        position: window.innerWidth < 992 ? 'absolute' : 'relative',
                        right: 0,
                        zIndex: 1040,
                        animation: 'fadeInRight 0.3s ease-out'
                    }}
                >
                    <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-warning"><i className="fas fa-sticky-note me-2"></i>My Notes</h5>
                        <button className="btn btn-sm text-muted hover-text-white border-0" onClick={() => setNotesOpen(false)}>
                            <i className="fas fa-times fs-5"></i>
                        </button>
                    </div>
                    <div className="flex-grow-1 p-3 d-flex flex-column bg-dark bg-opacity-50">
                        <p className="small text-muted mb-3">
                            <i className="fas fa-info-circle me-1"></i> Notes are automatically saved to your browser for this specific lesson.
                        </p>
                        <textarea 
                            className="form-control bg-dark text-white border-secondary flex-grow-1 p-3 shadow-sm"
                            value={lessonNotes}
                            onChange={handleNotesChange}
                            placeholder="Jot down important concepts, code ideas, or questions here..."
                            style={{ resize: 'none', lineHeight: '1.6', fontSize: '0.95rem' }}
                        ></textarea>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseViewer;
