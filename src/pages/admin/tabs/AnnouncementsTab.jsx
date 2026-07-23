import React from 'react';

const AnnouncementsTab = ({
    announcements,
    announcementModal,
    setAnnouncementModal,
    announcementForm,
    setAnnouncementForm,
    deleteAnnouncementModal,
    setDeleteAnnouncementModal,
    handleNewAnnouncement,
    handleEditAnnouncement,
    handleSaveAnnouncement,
    toggleAnnouncementActive,
    handleDeleteAnnouncement,
}) => {
    return (
        <>
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

            {/* Announcement Create/Edit Modal */}
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

            {/* Delete Announcement Modal */}
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
        </>
    );
};

export default AnnouncementsTab;
