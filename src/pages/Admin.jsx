import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Admin = () => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [editingLesson, setEditingLesson] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const navigate = useNavigate();

    // Form states
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

        // Check if user is admin
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
        setLoading(false);
    };

    const fetchCourses = async () => {
        const { data } = await supabase
            .from('courses')
            .select('*')
            .eq('is_placeholder', false)
            .order('title');
        setCourses(data || []);
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

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        setEditingLesson(null);
        fetchLessons(course.id);
    };

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

    const addQuizQuestion = async () => {
        if (!questionForm.question.trim() || questionForm.options.some(o => !o.trim())) {
            alert('Please fill in the question and all options');
            return;
        }

        const { error } = await supabase
            .from('quiz_questions')
            .insert([{
                lesson_id: editingLesson.id,
                question: questionForm.question,
                options: questionForm.options,
                correct_index: questionForm.correct_index,
                order: quizQuestions.length + 1
            }]);

        if (error) {
            alert('Error adding question: ' + error.message);
            return;
        }

        fetchQuizQuestions(editingLesson.id);
        setQuestionForm({
            question: '',
            options: ['', '', '', ''],
            correct_index: 0
        });
    };

    const deleteQuestion = async (questionId) => {
        await supabase.from('quiz_questions').delete().eq('id', questionId);
        fetchQuizQuestions(editingLesson.id);
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="loader"></div></div>;
    if (!isAdmin) return null;

    return (
        <section className="bg-dark" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px', position: 'relative', zIndex: 1 }}>
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2><i className="fas fa-tools me-2"></i>Admin Dashboard</h2>
                    <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/dashboard')}>
                        <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
                    </button>
                </div>

                <div className="row">
                    {/* Course List */}
                    <div className="col-lg-3 mb-4">
                        <div className="glass-card p-3 h-100">
                            <h5 className="mb-3"><i className="fas fa-book me-2 text-info"></i>Courses</h5>
                            <div className="list-group list-group-flush">
                                {courses.map(course => (
                                    <button
                                        key={course.id}
                                        className={`list-group-item list-group-item-action bg-transparent border-0 text-white ${selectedCourse?.id === course.id ? 'active bg-info bg-opacity-25' : ''}`}
                                        onClick={() => handleCourseSelect(course)}
                                    >
                                        <i className={`${course.icon} me-2`}></i>
                                        {course.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lessons List */}
                    <div className="col-lg-3 mb-4">
                        <div className="glass-card p-3 h-100">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0"><i className="fas fa-list me-2 text-warning"></i>Lessons</h5>
                                {selectedCourse && (
                                    <button className="btn btn-success btn-sm" onClick={handleNewLesson}>
                                        <i className="fas fa-plus"></i>
                                    </button>
                                )}
                            </div>
                            {selectedCourse ? (
                                <div className="list-group list-group-flush">
                                    {lessons.map(lesson => (
                                        <button
                                            key={lesson.id}
                                            className={`list-group-item list-group-item-action bg-transparent border-0 text-white ${editingLesson?.id === lesson.id ? 'active bg-warning bg-opacity-25' : ''}`}
                                            onClick={() => handleLessonSelect(lesson)}
                                        >
                                            <small className="text-muted">#{lesson.order}</small> {lesson.title}
                                        </button>
                                    ))}
                                    {lessons.length === 0 && (
                                        <p className="text-muted small mb-0">No lessons yet. Click + to add.</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted small">Select a course first</p>
                            )}
                        </div>
                    </div>

                    {/* Lesson Editor */}
                    <div className="col-lg-6 mb-4">
                        <div className="glass-card p-4 h-100">
                            {editingLesson ? (
                                <>
                                    <h5 className="mb-4">
                                        <i className="fas fa-edit me-2 text-success"></i>
                                        {editingLesson.isNew ? 'New Lesson' : 'Edit Lesson'}
                                    </h5>

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
                                        <div className="col-md-4">
                                            <label className="form-label">Order</label>
                                            <input
                                                type="number"
                                                className="form-control bg-dark border-secondary text-white"
                                                value={lessonForm.order}
                                                onChange={e => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Duration (min)</label>
                                            <input
                                                type="number"
                                                className="form-control bg-dark border-secondary text-white"
                                                value={lessonForm.duration_minutes}
                                                onChange={e => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Video URL</label>
                                            <input
                                                type="url"
                                                className="form-control bg-dark border-secondary text-white"
                                                placeholder="YouTube embed URL"
                                                value={lessonForm.video_url}
                                                onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Content (Markdown)</label>
                                        <textarea
                                            className="form-control bg-dark border-secondary text-white"
                                            rows="8"
                                            value={lessonForm.content}
                                            onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                                            placeholder="# Lesson Title&#10;&#10;Your content here..."
                                        ></textarea>
                                    </div>

                                    <div className="d-flex gap-2 mb-4">
                                        <button className="btn btn-success px-4" onClick={saveLesson}>
                                            <i className="fas fa-save me-1"></i> Save Changes
                                        </button>
                                        {!editingLesson.isNew && (
                                            <button className="btn btn-danger" onClick={() => deleteLesson(editingLesson.id)}>
                                                <i className="fas fa-trash me-1"></i> Delete
                                            </button>
                                        )}
                                        <button className="btn btn-outline-light" onClick={() => setEditingLesson(null)}>
                                            Cancel
                                        </button>
                                    </div>

                                    {/* Quiz Questions Section (Collapsible) */}
                                    {!editingLesson.isNew && (
                                        <div className="accordion mt-4" id="quizAccordion">
                                            <div className="accordion-item bg-dark border-secondary">
                                                <h2 className="accordion-header" id="headingQuiz">
                                                    <button
                                                        className="accordion-button collapsed bg-dark text-info shadow-none"
                                                        type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target="#collapseQuiz"
                                                        aria-expanded="false"
                                                        aria-controls="collapseQuiz"
                                                    >
                                                        <i className="fas fa-question-circle me-2"></i> Manage Lesson Quiz
                                                    </button>
                                                </h2>
                                                <div id="collapseQuiz" className="accordion-collapse collapse" aria-labelledby="headingQuiz" data-bs-parent="#quizAccordion">
                                                    <div className="accordion-body border-top border-secondary border-opacity-25">
                                                        {quizQuestions.length > 0 ? (
                                                            quizQuestions.map((q, idx) => (
                                                                <div key={q.id} className="bg-dark bg-opacity-50 p-3 rounded mb-2 d-flex justify-content-between align-items-start border border-secondary border-opacity-10">
                                                                    <div>
                                                                        <strong className="text-info">Q{idx + 1}:</strong> {q.question}
                                                                        <div className="small text-muted mt-1">
                                                                            Correct: {q.options[q.correct_index]}
                                                                        </div>
                                                                    </div>
                                                                    <button className="btn btn-sm btn-outline-danger border-0" onClick={() => deleteQuestion(q.id)}>
                                                                        <i className="fas fa-times"></i>
                                                                    </button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-muted small text-center py-2">No quiz questions for this lesson.</p>
                                                        )}

                                                        <div className="mt-4 p-3 rounded border border-secondary border-opacity-25 bg-dark bg-opacity-25">
                                                            <h6 className="small text-muted mb-3 border-bottom border-secondary border-opacity-25 pb-2">Add New Question</h6>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm bg-dark border-secondary text-white mb-2"
                                                                placeholder="Enter question text..."
                                                                value={questionForm.question}
                                                                onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
                                                            />
                                                            <div className="row g-2">
                                                                {questionForm.options.map((opt, idx) => (
                                                                    <div key={idx} className="col-md-6">
                                                                        <div className="input-group input-group-sm">
                                                                            <span className="input-group-text bg-dark border-secondary text-white">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="correct"
                                                                                    className="form-check-input"
                                                                                    checked={questionForm.correct_index === idx}
                                                                                    onChange={() => setQuestionForm({ ...questionForm, correct_index: idx })}
                                                                                />
                                                                            </span>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control bg-dark border-secondary text-white"
                                                                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                                                value={opt}
                                                                                onChange={e => {
                                                                                    const newOpts = [...questionForm.options];
                                                                                    newOpts[idx] = e.target.value;
                                                                                    setQuestionForm({ ...questionForm, options: newOpts });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <button className="btn btn-sm btn-info mt-3 w-100" onClick={addQuizQuestion}>
                                                                <i className="fas fa-plus me-1"></i> Add Question to Quiz
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-muted py-5">
                                    <i className="fas fa-hand-point-left fs-1 mb-3"></i>
                                    <p>Select a lesson to edit or create a new one</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Admin;
