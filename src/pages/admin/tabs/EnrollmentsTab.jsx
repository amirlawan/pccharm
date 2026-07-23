import React from 'react';

const EnrollmentsTab = ({
    filteredEnrollments,
    courses,
    enrollmentSearchQuery,
    setEnrollmentSearchQuery,
    enrollmentCourseFilter,
    setEnrollmentCourseFilter,
    enrollmentStatusFilter,
    setEnrollmentStatusFilter,
    currentPageEnrollments,
    setCurrentPageEnrollments,
    enrollmentsPerPage,
    resetEnrollmentModal,
    setResetEnrollmentModal,
    removeEnrollmentModal,
    setRemoveEnrollmentModal,
    handleResetEnrollment,
    handleRemoveEnrollment,
}) => {
    return (
        <>
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

            {/* Reset Enrollment Modal */}
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

            {/* Remove Enrollment Modal */}
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
        </>
    );
};

export default EnrollmentsTab;
