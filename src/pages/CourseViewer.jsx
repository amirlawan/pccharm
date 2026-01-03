import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import QuizSection from '../components/QuizSection';
import { markLessonComplete, getCourseProgress, isLessonComplete } from '../lib/progressService';

// Custom Code Component with Copy Button
const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = String(children).replace(/\n$/, '');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!inline && match) {
        return (
            <div className="position-relative my-4 code-block-wrapper">
                <div className="d-flex justify-content-between align-items-center bg-dark text-muted px-3 py-1 rounded-top border-bottom border-secondary border-opacity-25 small">
                    <span>{match[1]}</span>
                    <button
                        onClick={handleCopy}
                        className="btn btn-link btn-sm text-muted text-decoration-none hover-text-white p-0"
                    >
                        {copied ? <><i className="fas fa-check me-1 text-success"></i> Copied</> : <><i className="far fa-copy me-1"></i> Copy</>}
                    </button>
                </div>
                <SyntaxHighlighter
                    {...props}
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-bottom m-0"
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '0.9rem',
                        background: 'rgba(0,0,0,0.3)'
                    }}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            </div>
        );
    }

    return (
        <code className={className} {...props}>
            {children}
        </code>
    );
};

const CourseViewer = () => {
    const { courseId } = useParams();
    const [user, setUser] = useState(null);
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [courseProgress, setCourseProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedModules, setExpandedModules] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourseContent = async () => {
            setLoading(true);
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                setUser(currentUser);

                const { data: courseData, error: courseError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('id', courseId)
                    .single();

                if (courseError) throw courseError;
                setCourse(courseData);

                const { data: lessonsData, error: lessonsError } = await supabase
                    .from('lessons')
                    .select('*')
                    .eq('course_id', courseId)
                    .order('order', { ascending: true });

                if (lessonsError) throw lessonsError;
                setLessons(lessonsData);

                if (currentUser) {
                    const progress = await getCourseProgress(currentUser.id, courseId);
                    setCompletedLessons(progress.completed_lessons || []);
                    setCourseProgress(progress.progress || 0);

                    if (lessonsData && lessonsData.length > 0) {
                        const firstIncomplete = lessonsData.find(
                            l => !progress.completed_lessons?.includes(l.id)
                        );
                        setActiveLesson(firstIncomplete || lessonsData[0]);
                    }
                } else if (lessonsData && lessonsData.length > 0) {
                    setActiveLesson(lessonsData[0]);
                }

                // Auto-expand first module
                if (lessonsData && lessonsData.length > 0) {
                    const firstModuleTitle = getModuleTitle(lessonsData[0].title);
                    if (firstModuleTitle) {
                        setExpandedModules({ [firstModuleTitle]: true });
                    }
                }

            } catch (error) {
                console.error("Error loading course:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseContent();
    }, [courseId]);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!activeLesson?.id) return;

            const { data } = await supabase
                .from('quiz_questions')
                .select('*')
                .eq('lesson_id', activeLesson.id)
                .order('order');

            setQuizQuestions(data || []);

            // Expand the module containing the active lesson
            const moduleTitle = getModuleTitle(activeLesson.title);
            if (moduleTitle) {
                setExpandedModules(prev => ({ ...prev, [moduleTitle]: true }));
            }
        };
        fetchQuiz();
    }, [activeLesson?.id]);

    // Helper to detect if a lesson is a module header
    const isModuleHeader = (title) => {
        return title?.startsWith('Module ') && title.includes(':');
    };

    // Get module title from lesson title (e.g., "3.1 Headings" -> "Module 3")
    const getModuleTitle = (lessonTitle) => {
        if (!lessonTitle) return null;
        if (isModuleHeader(lessonTitle)) {
            const match = lessonTitle.match(/^Module (\d+)/);
            return match ? `Module ${match[1]}` : null;
        }
        const match = lessonTitle.match(/^(\d+)\./);
        return match ? `Module ${match[1]}` : null;
    };

    // Organize lessons into modules
    const organizedLessons = () => {
        const modules = {};
        let currentModule = null;

        lessons.forEach(lesson => {
            if (isModuleHeader(lesson.title)) {
                const moduleNum = lesson.title.match(/^Module (\d+)/)?.[1];
                currentModule = `Module ${moduleNum}`;
                if (!modules[currentModule]) {
                    modules[currentModule] = { header: lesson, lessons: [] };
                } else {
                    modules[currentModule].header = lesson;
                }
            } else {
                const moduleNum = lesson.title.match(/^(\d+)\./)?.[1];
                const moduleName = moduleNum ? `Module ${moduleNum}` : 'Other';
                if (!modules[moduleName]) {
                    modules[moduleName] = { header: null, lessons: [] };
                }
                modules[moduleName].lessons.push(lesson);
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

    const handleLessonChange = (lesson) => {
        setActiveLesson(lesson);
        setSidebarOpen(false); // Close mobile sidebar
        const contentContainer = document.getElementById('lesson-content-container');
        if (contentContainer) contentContainer.scrollTop = 0;
    };

    const handleQuizPass = async () => {
        if (!user || !activeLesson) return;
        const result = await markLessonComplete(user.id, courseId, activeLesson.id);
        if (result.success) {
            setCompletedLessons(result.completedLessons);
            setCourseProgress(result.progress);
        }
    };

    const getNextLesson = () => {
        if (!activeLesson || !lessons.length) return null;
        const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
        return currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    };

    const getPrevLesson = () => {
        if (!activeLesson || !lessons.length) return null;
        const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
        return currentIndex > 0 ? lessons[currentIndex - 1] : null;
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="loader"></div></div>;
    if (!course) return <div className="text-center py-5 mt-5">Course not found.</div>;

    const nextLesson = getNextLesson();
    const prevLesson = getPrevLesson();
    const currentLessonComplete = isLessonComplete(completedLessons, activeLesson?.id);
    const modules = organizedLessons();

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
                                onClick={() => moduleData.header ? handleLessonChange(moduleData.header) : toggleModule(moduleName)}
                            >
                                <div className="d-flex align-items-center">
                                    <i
                                        className={`fas fa-chevron-${expandedModules[moduleName] ? 'down' : 'right'} me-2 small`}
                                        style={{ width: '12px', cursor: 'pointer' }}
                                        onClick={(e) => { e.stopPropagation(); toggleModule(moduleName); }}
                                    ></i>
                                    <span className="fw-medium small">{moduleName}</span>
                                </div>
                                {moduleData.lessons.length > 0 && (
                                    <span className="badge bg-secondary small">{moduleData.lessons.length}</span>
                                )}
                            </button>

                            {/* Collapsible Lessons */}
                            <div
                                className="overflow-hidden transition-all"
                                style={{
                                    maxHeight: expandedModules[moduleName] ? '1000px' : '0',
                                    transition: 'max-height 0.3s ease-out'
                                }}
                            >
                                {moduleData.lessons.map((lesson) => {
                                    const complete = isLessonComplete(completedLessons, lesson.id);
                                    const isActive = activeLesson?.id === lesson.id;
                                    return (
                                        <button
                                            key={lesson.id}
                                            className="btn btn-sm w-100 text-start py-2 ps-4 pe-3 border-0"
                                            style={{
                                                background: isActive ? 'rgba(var(--bs-info-rgb), 0.15)' : 'transparent',
                                                borderLeft: isActive ? '3px solid var(--bs-info)' : '3px solid transparent',
                                                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                                                marginTop: '2px'
                                            }}
                                            onClick={() => handleLessonChange(lesson)}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="small text-truncate" style={{ maxWidth: '200px' }}>
                                                    {lesson.title.replace(/^\d+\.\d+\s*/, '')}
                                                </span>
                                                {complete && <i className="fas fa-check-circle text-success small"></i>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-3 text-muted">
                        <small>No lessons available yet.</small>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <div className="d-flex w-100 overflow-hidden" style={{ height: '100vh', paddingTop: '70px' }}>
            {/* Mobile Sidebar Toggle */}
            <button
                className="btn btn-info position-fixed d-md-none"
                style={{ bottom: '20px', right: '20px', zIndex: 1050, borderRadius: '50%', width: '56px', height: '56px' }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>

            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div
                    className="position-fixed d-md-none"
                    style={{ inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1040, top: '70px' }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className="glass-card rounded-0 border-end border-secondary border-opacity-25 flex-column position-fixed d-md-none"
                style={{
                    width: '280px',
                    height: 'calc(100vh - 70px)',
                    overflowY: 'auto',
                    zIndex: 1045,
                    left: sidebarOpen ? 0 : '-280px',
                    top: '70px',
                    transition: 'left 0.3s ease',
                    display: 'flex'
                }}
            >
                {renderSidebarContent()}
            </div>

            {/* Desktop Sidebar */}
            <div
                className="glass-card rounded-0 border-end border-secondary border-opacity-25 d-none d-md-flex flex-column"
                style={{
                    width: '300px',
                    flexShrink: 0,
                    height: '100%',
                    overflowY: 'auto'
                }}
            >
                {renderSidebarContent()}
            </div>

            {/* Main Content */}
            <div id="lesson-content-container" className="flex-grow-1 overflow-auto bg-dark position-relative h-100">
                <div className="container py-4 py-md-5 px-3 px-lg-5" style={{ maxWidth: '900px' }}>
                    {activeLesson ? (
                        <div className="animate-fade-in">
                            <nav aria-label="breadcrumb" className="mb-4">
                                <ol className="breadcrumb small text-muted mb-0">
                                    <li className="breadcrumb-item">{course.title}</li>
                                    <li className="breadcrumb-item active text-info" aria-current="page">
                                        {isModuleHeader(activeLesson.title) ? activeLesson.title.split(':')[0] : activeLesson.title}
                                    </li>
                                </ol>
                            </nav>

                            <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
                                <h2 className="mb-0 fw-bold fs-4 fs-md-2">{activeLesson.title}</h2>
                                {currentLessonComplete && (
                                    <span className="badge bg-success">
                                        <i className="fas fa-check me-1"></i> Completed
                                    </span>
                                )}
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

                            <div className="lesson-content typography glass-card p-3 p-md-5">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code: CodeBlock,
                                        table: ({ node, ...props }) => (
                                            <div className="table-responsive my-4">
                                                <table className="table table-dark table-striped table-hover border border-secondary border-opacity-25" {...props} />
                                            </div>
                                        )
                                    }}
                                >
                                    {activeLesson.content || '*No content available.*'}
                                </ReactMarkdown>
                            </div>

                            {/* Quiz Section */}
                            <QuizSection
                                questions={quizQuestions}
                                onPass={handleQuizPass}
                                isCompleted={currentLessonComplete}
                            />

                            {/* Navigation */}
                            <div className="d-flex justify-content-between align-items-center mt-5 mb-5 pb-5 gap-2 flex-wrap">
                                <button
                                    className="btn btn-outline-light d-flex align-items-center gap-2"
                                    onClick={() => prevLesson && handleLessonChange(prevLesson)}
                                    disabled={!prevLesson}
                                    style={{ visibility: prevLesson ? 'visible' : 'hidden' }}
                                >
                                    <i className="fas fa-chevron-left"></i> <span className="d-none d-sm-inline">Previous</span>
                                </button>

                                {nextLesson ? (
                                    <button
                                        className="btn btn-gradient d-flex align-items-center gap-2"
                                        onClick={() => handleLessonChange(nextLesson)}
                                    >
                                        <span className="d-none d-sm-inline">Next Lesson</span> <i className="fas fa-chevron-right"></i>
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-success d-flex align-items-center gap-2"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Complete <i className="fas fa-check"></i>
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
        </div>
    );
};

export default CourseViewer;
