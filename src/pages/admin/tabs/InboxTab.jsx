import React from 'react';
import { coursesData } from '../../../data/courses';

const InboxTab = ({
    inboxSubTab,
    setInboxSubTab,
    sentNotifications,
    inboxLoading,
    inboxSearch,
    setInboxSearch,
    inboxPage,
    setInboxPage,
    composeForm,
    setComposeForm,
    composeTargetEmail,
    setComposeTargetEmail,
    composeEmailError,
    setComposeEmailError,
    composePreview,
    setComposePreview,
    deleteNotifModal,
    setDeleteNotifModal,
    sendNotification,
    deleteNotification,
    lookupUserByEmail,
}) => {
    return (
        <>
            <div className="animate-fade-in">
                <h3 className="text-white mb-4"><i className="fas fa-inbox me-2 text-info"></i>Inbox & Notifications</h3>

                {/* Sub-tabs */}
                <ul className="nav nav-pills mb-4 gap-2">
                    <li className="nav-item">
                        <button className={`nav-link ${inboxSubTab === 'compose' ? 'active bg-info border-0' : 'text-white'}`} onClick={() => setInboxSubTab('compose')}>
                            <i className="fas fa-pen me-2"></i>Compose
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${inboxSubTab === 'sent' ? 'active bg-info border-0' : 'text-white'}`} onClick={() => setInboxSubTab('sent')}>
                            <i className="fas fa-paper-plane me-2"></i>Sent ({sentNotifications.length})
                        </button>
                    </li>
                </ul>

                {/* COMPOSE TAB */}
                {inboxSubTab === 'compose' && (
                    <div className="glass-card p-4">
                        <h5 className="text-white mb-4"><i className="fas fa-paper-plane me-2 text-info"></i>Compose Notification</h5>
                        <div className="row g-3">
                            <div className="col-md-8">
                                <label className="form-label text-muted small text-uppercase">Title *</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="Notification title" value={composeForm.title} onChange={e => setComposeForm({ ...composeForm, title: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-muted small text-uppercase">Type</label>
                                <select className="form-select bg-dark text-white border-secondary" value={composeForm.type} onChange={e => setComposeForm({ ...composeForm, type: e.target.value })}>
                                    <option value="info">ℹ️ Info</option>
                                    <option value="warning">⚠️ Warning</option>
                                    <option value="success">✅ Success</option>
                                    <option value="danger">🚨 Danger</option>
                                </select>
                            </div>
                            <div className="col-12">
                                <label className="form-label text-muted small text-uppercase">Message Body *</label>
                                <textarea className="form-control bg-dark text-white border-secondary" rows="4" placeholder="Write your notification message..." value={composeForm.body} onChange={e => setComposeForm({ ...composeForm, body: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase">Send To</label>
                                <select className="form-select bg-dark text-white border-secondary" value={composeForm.target_type} onChange={e => { setComposeForm({ ...composeForm, target_type: e.target.value, target_value: '' }); setComposeTargetEmail(''); setComposeEmailError(''); }}>
                                    <option value="all">🌐 All Users</option>
                                    <option value="category">📚 Users enrolled in a course</option>
                                    <option value="specific">👤 Specific User (by email)</option>
                                </select>
                            </div>
                            {composeForm.target_type === 'category' && (
                                <div className="col-md-6">
                                    <label className="form-label text-muted small text-uppercase">Select Course</label>
                                    <select className="form-select bg-dark text-white border-secondary" value={composeForm.target_value} onChange={e => setComposeForm({ ...composeForm, target_value: e.target.value })}>
                                        <option value="">-- Select Course --</option>
                                        {coursesData.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                </div>
                            )}
                            {composeForm.target_type === 'specific' && (
                                <div className="col-md-6">
                                    <label className="form-label text-muted small text-uppercase">User Email</label>
                                    <input type="email" className={`form-control bg-dark text-white border-secondary ${composeEmailError ? 'border-danger' : ''}`} placeholder="user@example.com" value={composeTargetEmail} onChange={e => { setComposeTargetEmail(e.target.value); setComposeEmailError(''); }} onBlur={e => lookupUserByEmail(e.target.value)} />
                                    {composeEmailError && <small className="text-danger">{composeEmailError}</small>}
                                    {composeForm.target_value && !composeEmailError && <small className="text-success"><i className="fas fa-check me-1"></i>User found</small>}
                                </div>
                            )}

                            {/* Preview */}
                            {composePreview && composeForm.title && (
                                <div className="col-12">
                                    <label className="form-label text-muted small text-uppercase">Preview</label>
                                    <div className="p-3 rounded" style={{
                                        borderLeft: `4px solid ${{ info: '#0d6efd', warning: '#ffc107', success: '#198754', danger: '#dc3545' }[composeForm.type]}`,
                                        background: 'rgba(255,255,255,0.03)',
                                    }}>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <span className={`badge bg-${composeForm.type}`}>{composeForm.type.toUpperCase()}</span>
                                            <small className="text-muted">Just now</small>
                                        </div>
                                        <h6 className="text-white fw-bold mb-1">{composeForm.title}</h6>
                                        <p className="text-light mb-0" style={{ opacity: 0.85 }}>{composeForm.body}</p>
                                    </div>
                                </div>
                            )}

                            <div className="col-12 d-flex gap-2 pt-2 border-top border-secondary border-opacity-25">
                                <button className="btn btn-outline-info" onClick={() => setComposePreview(!composePreview)}>
                                    <i className={`fas ${composePreview ? 'fa-eye-slash' : 'fa-eye'} me-2`}></i>{composePreview ? 'Hide Preview' : 'Preview'}
                                </button>
                                <button className="btn btn-success" onClick={sendNotification} disabled={!composeForm.title.trim() || !composeForm.body.trim()}>
                                    <i className="fas fa-paper-plane me-2"></i>Send Notification
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SENT TAB */}
                {inboxSubTab === 'sent' && (
                    <div className="glass-card p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                            <h5 className="text-white mb-0"><i className="fas fa-history me-2"></i>Sent Notifications</h5>
                            <input type="text" className="form-control bg-dark text-white border-secondary" style={{ maxWidth: '250px' }} placeholder="Search by title..." value={inboxSearch} onChange={e => { setInboxSearch(e.target.value); setInboxPage(0); }} />
                        </div>
                        {inboxLoading ? (
                            <div className="text-center py-4"><div className="spinner-border text-info" role="status"></div></div>
                        ) : (() => {
                            const filtered = sentNotifications.filter(n => n.title.toLowerCase().includes(inboxSearch.toLowerCase()));
                            const pageSize = 20;
                            const totalPages = Math.ceil(filtered.length / pageSize);
                            const paged = filtered.slice(inboxPage * pageSize, (inboxPage + 1) * pageSize);
                            return (
                                <>
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover align-middle mb-0">
                                            <thead>
                                                <tr className="text-muted small text-uppercase">
                                                    <th>Title</th><th>Type</th><th>Sent To</th><th>Sent At</th><th>Read By</th><th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paged.map(n => (
                                                    <tr key={n.id}>
                                                        <td className="text-white fw-bold">{n.title}</td>
                                                        <td><span className={`badge bg-${n.type}`}>{n.type}</span></td>
                                                        <td className="text-muted small">{n.target_type === 'all' ? 'All Users' : n.target_type === 'category' ? `Course: ${coursesData.find(c => c.id === n.target_value)?.title || n.target_value}` : `User: ${n.target_value?.substring(0, 8)}...`}</td>
                                                        <td className="text-muted small">{new Date(n.created_at).toLocaleDateString()}</td>
                                                        <td><span className="badge bg-secondary">{n.readCount}</span></td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteNotifModal({ isOpen: true, notif: n })} title="Delete">
                                                                <i className="fas fa-trash-alt"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {paged.length === 0 && <tr><td colSpan="6" className="text-center py-4 text-muted">No sent notifications found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="d-flex justify-content-center gap-2 mt-3">
                                            <button className="btn btn-sm btn-outline-info" disabled={inboxPage === 0} onClick={() => setInboxPage(p => p - 1)}><i className="fas fa-chevron-left"></i></button>
                                            <span className="text-muted small align-self-center">Page {inboxPage + 1} of {totalPages}</span>
                                            <button className="btn btn-sm btn-outline-info" disabled={inboxPage >= totalPages - 1} onClick={() => setInboxPage(p => p + 1)}><i className="fas fa-chevron-right"></i></button>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Delete Notification Modal */}
            {deleteNotifModal.isOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-danger border-opacity-50" style={{ maxWidth: '400px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-trash-alt text-danger fs-1 mb-3"></i>
                            <h4 className="text-white">Delete Notification?</h4>
                            <p className="text-muted">Permanently delete "<strong className="text-white">{deleteNotifModal.notif?.title}</strong>"? Read receipts will also be removed.</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => setDeleteNotifModal({ isOpen: false, notif: null })}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1" onClick={deleteNotification}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InboxTab;
