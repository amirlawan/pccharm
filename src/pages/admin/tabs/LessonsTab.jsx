import React, { Suspense } from 'react';
import RichTextEditor from '../../../components/RichTextEditor';

// Lazy load heavy DnD components
const DragDropContext = React.lazy(() => import('@hello-pangea/dnd').then(m => ({ default: m.DragDropContext })));
const Droppable = React.lazy(() => import('@hello-pangea/dnd').then(m => ({ default: m.Droppable })));
const Draggable = React.lazy(() => import('@hello-pangea/dnd').then(m => ({ default: m.Draggable })));

const LessonsTab = ({
    courses,
    selectedCourseForLessons,
    setSelectedCourseForLessons,
    lessons,
    lessonModal,
    setLessonModal,
    lessonForm,
    setLessonForm,
    deleteLessonModal,
    setDeleteLessonModal,
    handleNewLesson,
    handleNewModule,
    handleEditLesson,
    handleSaveLesson,
    handleDeleteLessonConfirm,
    executeDeleteLesson,
    onDragEnd,
}) => {
    return (
        <>
            <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
                    <h3 className="mb-0 text-white"><i className="fas fa-book-open me-2 text-info"></i>Lessons Management</h3>
                    <div className="d-flex gap-2">
                        <button 
                            className="btn btn-outline-info" 
                            onClick={handleNewModule}
                            disabled={!selectedCourseForLessons}
                        >
                            <i className="fas fa-folder-plus me-2"></i> Add Module
                        </button>
                        <button 
                            className="btn btn-success" 
                            onClick={handleNewLesson}
                            disabled={!selectedCourseForLessons}
                        >
                            <i className="fas fa-file-circle-plus me-2"></i> Add Lesson
                        </button>
                    </div>
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
                            <Suspense fallback={<div className="text-center py-4"><div className="spinner-border text-info"></div></div>}>
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
                                                        {(provided, snapshot) => {
                                                            const isModule = lesson.title?.toLowerCase().startsWith('module ');
                                                            return (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={`list-group-item border-bottom border-secondary border-opacity-25 p-3 d-flex align-items-center justify-content-between 
                                                                        ${snapshot.isDragging ? 'bg-dark shadow-lg border border-info' : (isModule ? 'bg-dark bg-opacity-50' : 'bg-transparent')}
                                                                    `}
                                                                    style={{
                                                                        ...provided.draggableProps.style,
                                                                        marginLeft: isModule ? '0' : '20px',
                                                                        borderLeft: isModule ? '4px solid var(--bs-info)' : 'none'
                                                                    }}
                                                                >
                                                                    <div className="d-flex align-items-center flex-grow-1">
                                                                        <div {...provided.dragHandleProps} className="me-3 text-muted" style={{ cursor: 'grab' }}>
                                                                            <i className="fas fa-grip-vertical fs-5"></i>
                                                                        </div>
                                                                        <span className={`badge ${isModule ? 'bg-info' : 'bg-secondary'} me-3`}>#{lesson.order_index}</span>
                                                                        
                                                                        {isModule ? (
                                                                            <i className="fas fa-folder-open text-info me-2 fs-5"></i>
                                                                        ) : (
                                                                            <i className="fas fa-file-alt text-muted me-2"></i>
                                                                        )}

                                                                        <div className={`${isModule ? 'fw-bold text-white fs-5' : 'text-light fs-6'}`}>
                                                                            {lesson.title}
                                                                        </div>
                                                                        
                                                                        {!isModule && lesson.has_quiz && (
                                                                            <span className="badge bg-warning ms-3 text-dark"><i className="fas fa-question-circle me-1"></i> Quiz</span>
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
                                                            );
                                                        }}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </Suspense>
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

            {/* Lesson Create/Edit Modal */}
            {lessonModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
                    <div className="glass-card p-4 mx-3 overflow-auto" style={{ maxWidth: '980px', width: '100%', maxHeight: '92vh', animation: 'fadeInUp 0.2s ease-out' }}>
                        {/* Modal Header */}
                        <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-3 mb-4">
                            <div>
                                <h4 className="text-white mb-0">
                                    <i className={`fas ${lessonModal.lesson ? 'fa-edit' : 'fa-plus-circle'} me-2 text-info`}></i>
                                    {lessonModal.lesson ? 'Edit Lesson' : 'Add New Lesson'}
                                </h4>
                                {selectedCourseForLessons && (
                                    <small className="text-muted d-block mt-1">
                                        <i className="fas fa-graduation-cap me-1"></i>
                                        {courses.find(c => c.id === selectedCourseForLessons)?.title || selectedCourseForLessons}
                                    </small>
                                )}
                            </div>
                            <button className="btn btn-sm btn-outline-secondary text-white border-0" onClick={() => setLessonModal({ isOpen: false, lesson: null })}>
                                <i className="fas fa-times fs-5"></i>
                            </button>
                        </div>

                        <div className="row g-3">
                            {/* Title + Module Placement */}
                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase fw-bold">Lesson Title *</label>
                                <input
                                    type="text"
                                    className="form-control bg-dark text-white border-secondary"
                                    value={lessonForm.title}
                                    onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                                    placeholder="e.g. 1.1 Introduction to React"
                                    autoFocus
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase fw-bold">Add to Module (Optional)</label>
                                <select 
                                    className="form-select bg-dark text-white border-secondary"
                                    value={lessonForm.modulePlacement || ''}
                                    onChange={(e) => setLessonForm({...lessonForm, modulePlacement: e.target.value})}
                                    disabled={lessonModal.lesson != null}
                                >
                                    <option value="">-- At the end of the course --</option>
                                    {lessons.filter(l => l.title?.toLowerCase().startsWith('module ')).map(m => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase fw-bold">Duration (mins)</label>
                                <input
                                    type="number"
                                    className="form-control bg-dark text-white border-secondary"
                                    value={lessonForm.duration_minutes}
                                    onChange={e => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) || 0 })}
                                    min="1"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase fw-bold">Order Index</label>
                                <input
                                    type="number"
                                    className="form-control bg-dark text-white border-secondary"
                                    value={lessonForm.order_index}
                                    onChange={e => setLessonForm({ ...lessonForm, order_index: parseInt(e.target.value) || 1 })}
                                    min="1"
                                />
                                <small className="text-muted">You can also drag-reorder lessons.</small>
                            </div>

                            {/* Video URL */}
                            <div className="col-12">
                                <label className="form-label text-muted small text-uppercase fw-bold">
                                    <i className="fas fa-video me-1 text-info"></i> Video URL
                                    <span className="text-muted fw-normal ms-2">(YouTube, Vimeo, or embed URL — optional)</span>
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-dark border-secondary text-muted">
                                        <i className="fab fa-youtube text-danger"></i>
                                    </span>
                                    <input
                                        type="url"
                                        className="form-control bg-dark text-white border-secondary"
                                        value={lessonForm.video_url}
                                        onChange={e => {
                                            let url = e.target.value.trim();
                                            // Auto-convert YouTube watch URLs to embed
                                            const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
                                            if (ytMatch) {
                                                url = `https://www.youtube.com/embed/${ytMatch[1]}`;
                                            }
                                            setLessonForm({ ...lessonForm, video_url: url });
                                        }}
                                        placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/embed/..."
                                    />
                                    {lessonForm.video_url && (
                                        <button
                                            className="btn btn-outline-secondary text-muted border-secondary"
                                            type="button"
                                            onClick={() => setLessonForm({ ...lessonForm, video_url: '' })}
                                            title="Clear video URL"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                                {/* Video preview */}
                                {lessonForm.video_url && (
                                    <div className="mt-2 rounded overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: '200px' }}>
                                        <iframe
                                            src={lessonForm.video_url}
                                            title="Video Preview"
                                            className="w-100 h-100 border-0"
                                            allowFullScreen
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Rich Text Editor */}
                            <div className="col-12">
                                <label className="form-label text-muted small text-uppercase fw-bold">
                                    <i className="fas fa-pen-nib me-1 text-info"></i> Lesson Content
                                </label>
                                <RichTextEditor
                                    value={lessonForm.content}
                                    onChange={(content) => setLessonForm({ ...lessonForm, content })}
                                    placeholder="Write your lesson content here... Use the toolbar above for headings, code blocks, colours, lists and more."
                                    dark={true}
                                    style={{ height: '380px', marginBottom: '60px' }}
                                />
                                <div className="d-flex align-items-center gap-2 mt-1">
                                    <i className="fas fa-info-circle text-info small"></i>
                                    <small className="text-muted">Tip: Use the <strong className="text-light">code block</strong> button (</small>
                                    <code style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px', color: '#f472b6' }}>&lt;/&gt;</code>
                                    <small className="text-muted">) to add syntax-highlighted code examples visible to students.</small>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="col-12"><hr className="border-secondary border-opacity-25 my-1" /></div>

                            {/* Quiz toggle */}
                            <div className="col-12 d-flex align-items-center">
                                <div className="form-check form-switch fs-5">
                                    <input
                                        className="form-check-input border-secondary"
                                        type="checkbox"
                                        role="switch"
                                        checked={lessonForm.has_quiz}
                                        onChange={e => setLessonForm({ ...lessonForm, has_quiz: e.target.checked })}
                                        id="quizToggle"
                                    />
                                    <label className="form-check-label text-white ms-2" htmlFor="quizToggle">
                                        <i className="fas fa-question-circle me-2 text-warning"></i>
                                        Include a quiz question at the end of this lesson?
                                    </label>
                                </div>
                            </div>

                            {lessonForm.has_quiz && (
                                <div className="col-12 bg-dark bg-opacity-50 p-4 rounded border border-warning border-opacity-25">
                                    <h5 className="text-warning mb-3"><i className="fas fa-question-circle me-2"></i>Quiz Setup</h5>

                                    <div className="mb-3">
                                        <label className="form-label text-muted small text-uppercase">Question *</label>
                                        <input
                                            type="text"
                                            className="form-control bg-dark text-white border-secondary"
                                            value={lessonForm.quiz_question}
                                            onChange={e => setLessonForm({ ...lessonForm, quiz_question: e.target.value })}
                                            placeholder="e.g. What does HTML stand for?"
                                        />
                                    </div>

                                    <div className="row g-2 mb-3">
                                        {lessonForm.quiz_options.map((opt, i) => (
                                            <div key={i} className="col-md-6">
                                                <label className="form-label text-muted small text-uppercase">
                                                    {lessonForm.quiz_correct_index === i && <i className="fas fa-check-circle text-success me-1"></i>}
                                                    Option {String.fromCharCode(65 + i)}
                                                    {lessonForm.quiz_correct_index === i && <span className="ms-1 text-success small">(Correct)</span>}
                                                </label>
                                                <div className="input-group">
                                                    <div className="input-group-text bg-dark border-secondary">
                                                        <input
                                                            className="form-check-input mt-0 border-secondary"
                                                            type="radio"
                                                            name="correctAnswer"
                                                            checked={lessonForm.quiz_correct_index === i}
                                                            onChange={() => setLessonForm({ ...lessonForm, quiz_correct_index: i })}
                                                            title="Mark as correct answer"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className={`form-control bg-dark text-white border-secondary ${lessonForm.quiz_correct_index === i ? 'border-success' : ''}`}
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

                                    <div style={{ maxWidth: '200px' }}>
                                        <label className="form-label text-muted small text-uppercase">Passing Score (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="form-control bg-dark text-white border-secondary"
                                            value={lessonForm.quiz_pass_score}
                                            onChange={e => setLessonForm({ ...lessonForm, quiz_pass_score: parseInt(e.target.value) || 70 })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Footer actions */}
                            <div className="col-12 mt-3 pt-3 border-top border-secondary border-opacity-25 d-flex gap-2">
                                <button className="btn btn-outline-light" onClick={() => setLessonModal({ isOpen: false, lesson: null })}>
                                    <i className="fas fa-times me-2"></i>Cancel
                                </button>
                                <button className="btn btn-success flex-grow-1" onClick={handleSaveLesson}>
                                    <i className="fas fa-save me-2"></i>
                                    {lessonModal.lesson ? 'Save Changes' : 'Create Lesson'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Lesson Modal */}
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
        </>
    );
};

export default LessonsTab;
