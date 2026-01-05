import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Admin = () => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Tab State
    const [activeTab, setActiveTab] = useState('courses');

    // Data States
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isEditingCourse, setIsEditingCourse] = useState(false);

    // Lesson States (Existing logic)
    const [lessons, setLessons] = useState([]);
    const [editingLesson, setEditingLesson] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);

    // Forms
    const [courseForm, setCourseForm] = useState({
        id: '',
        title: '',
        description: '',
        icon: 'fas fa-code',
        category: 'web-development',
        category_label: 'Programming & Web Dev',
        price: 0,
        is_placeholder: false
    });

    const [lessonForm, setLessonForm] = useState({
        title: '',
        content: '',
        video_url: '',
        duration_minutes: 10,
        order: 1
    });

    const [questionForm, setQuestionForm] = useState({
        question: '',
        options: ['', '', '', ''],
        correct_index: 0
    });

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }
        setUser(user);

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            navigate('/dashboard');
            return;
        }

        setIsAdmin(true);
        fetchCourses();
        fetchUsers();
        setLoading(false);
    };

    // --- Fetchers ---
    const fetchCourses = async () => {
        const { data } = await supabase
            .from('courses')
            .select('*')
            .order('title');
        setCourses(data || []);
    };

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name');
        setUsers(data || []);
    };

    const fetchLessons = async (courseId) => {
        const { data } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order');
        setLessons(data || []);
    };

    const fetchQuizQuestions = async (lessonId) => {
        const { data } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('lesson_id', lessonId)
            .order('order');
        setQuizQuestions(data || []);
    };

    // --- Course Handlers ---
    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        setIsEditingCourse(false);
        setEditingLesson(null);
        fetchLessons(course.id);
    };

    const handleNewCourse = () => {
        setSelectedCourse(null);
        setIsEditingCourse(true);
        setCourseForm({
            id: '',
            title: '',
            description: '',
            icon: 'fas fa-code',
            category: 'web-development',
            category_label: 'Programming & Web Dev',
            price: 0,
            is_placeholder: false
        });
    };

    const handleEditCourse = (course) => {
        setSelectedCourse(course);
        setIsEditingCourse(true);
        setCourseForm({ ...course });
        setEditingLesson(null);
    };

    const saveCourse = async () => {
        if (!courseForm.id || !courseForm.title) {
            alert("ID and Title are required");
            return;
        }

        const payload = { ...courseForm };

        const { data, error } = await supabase
            .from('courses')
            .upsert(payload)
            .select();

        if (error) {
            alert('Error saving course: ' + error.message);
        } else {
            fetchCourses();
            setIsEditingCourse(false);
            if (data && data[0]) handleCourseSelect(data[0]);
        }
    };

    // --- Lesson Handlers ---
    const handleLessonSelect = (lesson) => {
        setEditingLesson(lesson);
        setLessonForm({
            title: lesson.title,
            content: lesson.content || '',
            video_url: lesson.video_url || '',
            duration_minutes: lesson.duration_minutes || 10,
            order: lesson.order
        });
        fetchQuizQuestions(lesson.id);
    };

    const handleNewLesson = () => {
        setEditingLesson({ isNew: true });
        setLessonForm({
            title: '',
            content: '',
            video_url: '',
            duration_minutes: 10,
            order: lessons.length + 1
        });
        setQuizQuestions([]);
    };

    const saveLesson = async () => {
        if (!lessonForm.title.trim()) {
            alert('Please enter a lesson title');
            return;
        }

        if (editingLesson.isNew) {
            const { error } = await supabase
                .from('lessons')
                .insert([{
                    course_id: selectedCourse.id,
                    ...lessonForm
                }]);
            if (error) {
                alert('Error creating lesson: ' + error.message);
                return;
            }
        } else {
            const { error } = await supabase
                .from('lessons')
                .update(lessonForm)
                .eq('id', editingLesson.id);
            if (error) {
                alert('Error updating lesson: ' + error.message);
                return;
            }
        }

        fetchLessons(selectedCourse.id);
        setEditingLesson(null);
    };

    const deleteLesson = async (lessonId) => {
        if (!confirm('Delete this lesson and all its quiz questions?')) return;
        await supabase.from('quiz_questions').delete().eq('lesson_id', lessonId);
        await supabase.from('lessons').delete().eq('id', lessonId);
        fetchLessons(selectedCourse.id);
        setEditingLesson(null);
    };

    // --- Quiz Handlers ---
    const addQuizQuestion = async () => {
        if (!questionForm.question.trim()) return;

        // Handle both possible schema fields for question text to be safe
        // Ideally we should know, but 'question' was legacy, 'question_text' is new schema.
        // We'll insert 'question_text' mainly, but check what API expects?
        // Actually, Supabase ignores extra fields if not in schema usually, or errors.
        // We will assume 'question_text' is the correct one based on our recent work.
        // AND 'question' for legacy support if the column still exists? 
        // No, let's stick to ONE. Based on 'quiz_schema.sql', it is 'question_text'.
        // However, if the old 'quiz_questions' table is still there untouched by 'reset', it might be 'question'.
        // To be safe, I'll provide logic that aligns with 'quiz_schema.sql'.

        const { error } = await supabase
            .from('quiz_questions')
            .insert([{
                lesson_id: editingLesson.id,
                question_text: questionForm.question,
                options: questionForm.options,
                correct_index: questionForm.correct_index,
                order: quizQuestions.length + 1
            }]);

        if (error) {
            // Fallback for legacy schema if 'question_text' fails (e.g. column does not exist error)
            if (error.message.includes('column "question_text" of relation "quiz_questions" does not exist')) {
                const { error: legacyError } = await supabase
                    .from('quiz_questions')
                    .insert([{
                        lesson_id: editingLesson.id,
                        question: questionForm.question,
                        options: questionForm.options,
                        correct_index: questionForm.correct_index,
                        order: quizQuestions.length + 1
                    }]);
                if (legacyError) alert('Error adding question: ' + legacyError.message);
                else {
                    fetchQuizQuestions(editingLesson.id);
                    setQuestionForm({ question: '', options: ['', '', '', ''], correct_index: 0 });
                }
            } else {
                alert('Error adding question: ' + error.message);
            }
        } else {
            fetchQuizQuestions(editingLesson.id);
            setQuestionForm({ question: '', options: ['', '', '', ''], correct_index: 0 });
        }
    };

    const deleteQuestion = async (qId) => {
        await supabase.from('quiz_questions').delete().eq('id', qId);
        fetchQuizQuestions(editingLesson.id);
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="loader"></div></div>;
    if (!isAdmin) return null;

    return (
        <section className="bg-dark" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px' }}>
            <div className="container-fluid px-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="text-white"><i className="fas fa-cogs me-2 text-info"></i>System Admin</h2>
                    <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/dashboard')}>
                        <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
                    </button>
                </div>

                {/* Tabs */}
                <ul className="nav nav-pills mb-4 border-bottom border-secondary border-opacity-25 pb-3">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'courses' ? 'active bg-gradient text-white' : 'text-muted'}`}
                            onClick={() => setActiveTab('courses')}
                        >
                            <i className="fas fa-book me-2"></i>Course Management
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'users' ? 'active bg-gradient text-white' : 'text-muted'}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <i className="fas fa-users me-2"></i>User Management
                        </button>
                    </li>
                </ul>

                {/* --- USERS TAB --- */}
                {activeTab === 'users' && (
                    <div className="glass-card p-4">
                        <h4 className="mb-4 text-info">Registered Users ({users.length})</h4>
                        <div className="table-responsive">
                            <table className="table table-dark table-hover table-striped border border-secondary border-opacity-25">
                                <thead>
                                    <tr>
                                        <th>Avatar</th>
                                        <th>Full Name</th>
                                        <th>Role</th>
                                        <th>Updated At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="d-flex align-items-center justify-content-center bg-secondary rounded-circle" style={{ width: '32px', height: '32px' }}>
                                                    {u.avatar_url ? <img src={u.avatar_url} alt="" className="rounded-circle w-100 h-100" /> : <i className="fas fa-user small"></i>}
                                                </div>
                                            </td>
                                            <td>{u.full_name || 'N/A'}</td>
                                            <td>
                                                {u.is_admin ?
                                                    <span className="badge bg-danger">Admin</span> :
                                                    <span className="badge bg-secondary">Student</span>
                                                }
                                            </td>
                                            <td className="small text-muted">{new Date(u.updated_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- COURSES TAB --- */}
                {activeTab === 'courses' && (
                    <div className="row">
                        {/* Sidebar: Course List */}
                        <div className="col-lg-3 mb-4">
                            <div className="glass-card p-3 h-100">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Courses</h5>
                                    <button className="btn btn-success btn-sm" onClick={handleNewCourse}>
                                        <i className="fas fa-plus"></i> New
                                    </button>
                                </div>
                                <div className="list-group list-group-flush">
                                    {courses.map(course => (
                                        <button
                                            key={course.id}
                                            className={`list-group-item list-group-item-action bg-transparent border-0 text-white d-flex justify-content-between align-items-center ${selectedCourse?.id === course.id ? 'active bg-info bg-opacity-25' : ''}`}
                                            onClick={() => handleCourseSelect(course)}
                                        >
                                            <span><i className={`${course.icon} me-2`}></i>{course.title}</span>
                                            <i
                                                className="fas fa-edit text-muted hover-text-white"
                                                onClick={(e) => { e.stopPropagation(); handleEditCourse(course); }}
                                            ></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Area */}
                        <div className="col-lg-9 mb-4">
                            {/* Course Editor */}
                            {isEditingCourse ? (
                                <div className="glass-card p-4 mb-4">
                                    <h4 className="mb-3 text-info">{courseForm.id ? 'Edit Course' : 'Create New Course'}</h4>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Course ID (unique slug)</label>
                                            <input
                                                type="text"
                                                className="form-control bg-dark text-white border-secondary"
                                                value={courseForm.id}
                                                onChange={e => setCourseForm({ ...courseForm, id: e.target.value })}
                                                disabled={selectedCourse && !!selectedCourse.id} // Disable ID edit if updating
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Title</label>
                                            <input
                                                type="text"
                                                className="form-control bg-dark text-white border-secondary"
                                                value={courseForm.title}
                                                onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control bg-dark text-white border-secondary"
                                                rows="3"
                                                value={courseForm.description}
                                                onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Icon (FontAwesome Class)</label>
                                            <input
                                                type="text"
                                                className="form-control bg-dark text-white border-secondary"
                                                value={courseForm.icon}
                                                onChange={e => setCourseForm({ ...courseForm, icon: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Category</label>
                                            <input
                                                type="text"
                                                className="form-control bg-dark text-white border-secondary"
                                                value={courseForm.category}
                                                onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-12 d-flex gap-2 mt-3">
                                            <button className="btn btn-success" onClick={saveCourse}>
                                                <i className="fas fa-save me-1"></i> Save Course
                                            </button>
                                            <button className="btn btn-outline-light" onClick={() => setIsEditingCourse(false)}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            ) : selectedCourse ? (
                                <div className="row">
                                    {/* Lessons List */}
                                    <div className="col-md-4 mb-4">
                                        <div className="glass-card p-3 h-100">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5 className="mb-0 text-warning">Lessons</h5>
                                                <button className="btn btn-success btn-sm" onClick={handleNewLesson}>
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            </div>
                                            <div className="list-group list-group-flush">
                                                {lessons.map(lesson => (
                                                    <button
                                                        key={lesson.id}
                                                        className={`list-group-item list-group-item-action bg-transparent border-0 text-white ${editingLesson?.id === lesson.id ? 'active bg-warning bg-opacity-25' : ''}`}
                                                        onClick={() => handleLessonSelect(lesson)}
                                                    >
                                                        <small className="text-muted me-2">#{lesson.order}</small>
                                                        {lesson.title}
                                                    </button>
                                                ))}
                                                {lessons.length === 0 && <p className="text-muted small">No lessons found.</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lesson Editor */}
                                    <div className="col-md-8">
                                        <div className="glass-card p-4 h-100">
                                            {editingLesson ? (
                                                <>
                                                    <h5 className="mb-4 text-success">{editingLesson.isNew ? 'New Lesson' : 'Edit Lesson'}</h5>
                                                    <div className="mb-3">
                                                        <label className="form-label">Title</label>
                                                        <input
                                                            type="text"
                                                            className="form-control bg-dark border-secondary text-white"
                                                            value={lessonForm.title}
                                                            onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="row mb-3">
                                                        <div className="col-6">
                                                            <label className="form-label">Order</label>
                                                            <input type="number" className="form-control bg-dark border-secondary text-white" value={lessonForm.order} onChange={e => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })} />
                                                        </div>
                                                        <div className="col-6">
                                                            <label className="form-label">Duration (min)</label>
                                                            <input type="number" className="form-control bg-dark border-secondary text-white" value={lessonForm.duration_minutes} onChange={e => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) })} />
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Content (Markdown)</label>
                                                        <textarea className="form-control bg-dark border-secondary text-white" rows="6" value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}></textarea>
                                                    </div>

                                                    {/* Save / Delete Lesson Buttons */}
                                                    <div className="d-flex gap-2 mb-4">
                                                        <button className="btn btn-success" onClick={saveLesson}><i className="fas fa-save me-1"></i> Save Logic</button>
                                                        {!editingLesson.isNew && <button className="btn btn-danger" onClick={() => deleteLesson(editingLesson.id)}><i className="fas fa-trash me-1"></i> Delete</button>}
                                                        <button className="btn btn-outline-light" onClick={() => setEditingLesson(null)}>Cancel</button>
                                                    </div>

                                                    {/* Quiz Questions Section */}
                                                    {!editingLesson.isNew && (
                                                        <div className="border-top border-secondary border-opacity-25 pt-4 mt-4">
                                                            <h6 className="text-info mb-3">Lesson Quiz Questions</h6>
                                                            {quizQuestions.map((q, idx) => (
                                                                <div key={q.id} className="bg-dark bg-opacity-50 p-2 rounded mb-2 d-flex justify-content-between align-items-center">
                                                                    <small>{idx + 1}. {q.question || q.question_text}</small>
                                                                    <button className="btn btn-sm text-danger" onClick={() => deleteQuestion(q.id)}><i className="fas fa-times"></i></button>
                                                                </div>
                                                            ))}
                                                            <div className="mt-3">
                                                                <input type="text" className="form-control form-control-sm bg-dark text-white mb-2" placeholder="New Question" value={questionForm.question} onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })} />
                                                                <div className="row g-1 mb-2">
                                                                    {questionForm.options.map((opt, i) => (
                                                                        <div key={i} className="col-6">
                                                                            <input type="text" className="form-control form-control-sm bg-dark text-white" placeholder={`Option ${i + 1}`} value={opt} onChange={e => {
                                                                                const newOpt = [...questionForm.options]; newOpt[i] = e.target.value; setQuestionForm({ ...questionForm, options: newOpt });
                                                                            }} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label className="small text-muted me-2">Correct Option Index (0-3):</label>
                                                                    <input type="number" min="0" max="3" className="d-inline-block form-control form-control-sm bg-dark text-white w-auto" value={questionForm.correct_index} onChange={e => setQuestionForm({ ...questionForm, correct_index: parseInt(e.target.value) })} />
                                                                </div>

                                                                <button className="btn btn-sm btn-info w-100" onClick={addQuizQuestion}>Add Question</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-center text-muted py-5">
                                                    <i className="fas fa-arrow-left me-2"></i> Select a lesson to edit
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted py-5 glass-card">
                                    <i className="fas fa-book fs-1 mb-3 text-secondary"></i>
                                    <p>Select a course to manage its content or click "New" to create one.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Admin;
