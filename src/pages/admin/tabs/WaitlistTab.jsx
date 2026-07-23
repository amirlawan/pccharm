import React from 'react';

const WaitlistTab = ({
    filteredWaitlist,
    waitlistSearch,
    setWaitlistSearch,
    deleteWaitlistModal,
    setDeleteWaitlistModal,
    handleDeleteWaitlistEntry,
    exportWaitlistCSV,
}) => {
    return (
        <>
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

            {/* Delete Waitlist Entry Modal */}
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
        </>
    );
};

export default WaitlistTab;
