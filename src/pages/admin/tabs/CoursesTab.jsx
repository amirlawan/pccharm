import React from 'react';

const CoursesTab = ({
    courses,
    courseModal,
    setCourseModal,
    courseForm,
    setCourseForm,
    deleteCourseModal,
    setDeleteCourseModal,
    handleNewCourse,
    handleEditCourse,
    saveCourse,
    handleDeleteCourseConfirm,
    executeDeleteCourse,
    toggleCourseVisibility,
    handleCourseSelect,
}) => {
    return (
        <>
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

            {/* Course Create/Edit Modal */}
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

            {/* Delete Course Modal */}
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
        </>
    );
};

export default CoursesTab;
