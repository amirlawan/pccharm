import React from 'react';

const UsersTab = ({
    users,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    paginatedUsers,
    filteredUsers,
    totalPages,
    usersPerPage,
    drawerUser,
    drawerEnrollments,
    loadingDrawer,
    openUserDrawer,
    closeUserDrawer,
    adminModal,
    setAdminModal,
    resetModal,
    setResetModal,
    toggleAdminStatus,
    resetUserProgress,
    fetchUsers,
    user,
}) => {
    return (
        <>
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

            {/* Admin Role Change Modal */}
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

            {/* Reset Progress Modal */}
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
        </>
    );
};

export default UsersTab;
