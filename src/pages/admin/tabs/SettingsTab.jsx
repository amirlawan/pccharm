import React from 'react';

const SettingsTab = ({
    settingsLoading,
    activeSettingsSection,
    setActiveSettingsSection,
    siteSettings,
    setSiteSettings,
    saveSiteSettings,
    user,
    adminProfileName,
    setAdminProfileName,
    updateAdminProfile,
    passwordForm,
    setPasswordForm,
    handleChangePassword,
    notifPrefs,
    setNotifPrefs,
    saveNotificationPrefs,
    clearWaitlistModal,
    setClearWaitlistModal,
    resetProgressModal,
    setResetProgressModal,
    resetConfirmText,
    setResetConfirmText,
    handleClearWaitlist,
    handleResetAllProgress,
    handleExportBackup,
    isSiteSettingsDirty,
    isProfileDirty,
    isNotifDirty,
}) => {
    return (
        <>
            <div className="animate-fade-in">
                <h3 className="text-white mb-4"><i className="fas fa-cog me-2 text-info"></i>Settings</h3>

                {settingsLoading ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                        <div className="spinner-border text-info" role="status"><span className="visually-hidden">Loading...</span></div>
                        <span className="text-muted ms-3">Loading settings...</span>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-4">

                        {/* Section Navigation */}
                        <div className="glass-card p-2 d-flex flex-wrap gap-2">
                            {[
                                { id: 'site', label: 'Site Settings', icon: 'fa-globe', dirty: isSiteSettingsDirty() },
                                { id: 'account', label: 'Admin Account', icon: 'fa-user-shield', dirty: isProfileDirty() },
                                { id: 'notifications', label: 'Email & Notifications', icon: 'fa-envelope', dirty: isNotifDirty() },
                                { id: 'danger', label: 'Danger Zone', icon: 'fa-exclamation-triangle' },
                            ].map(s => (
                                <button
                                    key={s.id}
                                    className={`btn btn-sm ${activeSettingsSection === s.id ? (s.id === 'danger' ? 'btn-danger' : 'btn-info') : 'btn-outline-secondary text-white'} position-relative`}
                                    onClick={() => setActiveSettingsSection(s.id)}
                                >
                                    <i className={`fas ${s.icon} me-2`}></i>{s.label}
                                    {s.dirty && <span className="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-dark rounded-circle"><span className="visually-hidden">unsaved</span></span>}
                                </button>
                            ))}
                        </div>

                        {/* === SECTION 1: Site Settings === */}
                        {activeSettingsSection === 'site' && (
                            <div className="glass-card p-4">
                                <h5 className="text-white mb-4"><i className="fas fa-globe me-2 text-info"></i>Site Settings</h5>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small text-uppercase">Site Name</label>
                                        <input type="text" className="form-control bg-dark text-white border-secondary" value={siteSettings.site_name || ''} onChange={e => setSiteSettings({ ...siteSettings, site_name: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small text-uppercase">Tagline</label>
                                        <input type="text" className="form-control bg-dark text-white border-secondary" value={siteSettings.site_tagline || ''} onChange={e => setSiteSettings({ ...siteSettings, site_tagline: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small text-uppercase">Support Email</label>
                                        <input type="email" className="form-control bg-dark text-white border-secondary" value={siteSettings.support_email || ''} onChange={e => setSiteSettings({ ...siteSettings, support_email: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small text-uppercase">Hero CTA Button Text</label>
                                        <input type="text" className="form-control bg-dark text-white border-secondary" value={siteSettings.hero_cta_text || ''} onChange={e => setSiteSettings({ ...siteSettings, hero_cta_text: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small text-uppercase">Hero CTA Link</label>
                                        <input type="text" className="form-control bg-dark text-white border-secondary" value={siteSettings.hero_cta_link || ''} onChange={e => setSiteSettings({ ...siteSettings, hero_cta_link: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small text-uppercase">Announcement Bar Text</label>
                                        <input type="text" className="form-control bg-dark text-white border-secondary" value={siteSettings.announcement_bar_text || ''} onChange={e => setSiteSettings({ ...siteSettings, announcement_bar_text: e.target.value })} />
                                    </div>

                                    <div className="col-12"><hr className="border-secondary border-opacity-25 my-2" /></div>

                                    <div className="col-md-4">
                                        <div className="form-check form-switch d-flex align-items-center gap-2">
                                            <input className="form-check-input border-secondary fs-5" type="checkbox" checked={siteSettings.announcement_bar_enabled === 'true'} onChange={e => setSiteSettings({ ...siteSettings, announcement_bar_enabled: e.target.checked ? 'true' : 'false' })} id="annBarToggle" />
                                            <label className="form-check-label text-white" htmlFor="annBarToggle">Announcement Bar</label>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-check form-switch d-flex align-items-center gap-2">
                                            <input className="form-check-input border-secondary fs-5" type="checkbox" checked={siteSettings.allow_new_signups === 'true'} onChange={e => setSiteSettings({ ...siteSettings, allow_new_signups: e.target.checked ? 'true' : 'false' })} id="signupsToggle" />
                                            <label className="form-check-label text-white" htmlFor="signupsToggle">Allow New Signups</label>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-check form-switch d-flex align-items-center gap-2">
                                            <input className="form-check-input border-danger fs-5" type="checkbox" checked={siteSettings.maintenance_mode === 'true'} onChange={e => setSiteSettings({ ...siteSettings, maintenance_mode: e.target.checked ? 'true' : 'false' })} id="maintToggle" />
                                            <label className="form-check-label text-danger fw-bold" htmlFor="maintToggle">Maintenance Mode</label>
                                        </div>
                                        <small className="text-danger d-block mt-1"><i className="fas fa-exclamation-triangle me-1"></i>Shows a maintenance page to all non-admin users.</small>
                                    </div>

                                    <div className="col-12 pt-3 border-top border-secondary border-opacity-25">
                                        <button className="btn btn-success" onClick={saveSiteSettings} disabled={!isSiteSettingsDirty()}><i className="fas fa-save me-2"></i>Save Site Settings</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === SECTION 2: Admin Account === */}
                        {activeSettingsSection === 'account' && (
                            <div className="d-flex flex-column gap-4">
                                <div className="glass-card p-4">
                                    <h5 className="text-white mb-4"><i className="fas fa-user-shield me-2 text-info"></i>Admin Profile</h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small text-uppercase">Email</label>
                                            <input type="email" className="form-control bg-dark text-white border-secondary" value={user?.email || ''} disabled readOnly />
                                            <small className="text-muted">Email cannot be changed from here.</small>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small text-uppercase">Display Name</label>
                                            <input type="text" className="form-control bg-dark text-white border-secondary" value={adminProfileName} onChange={e => setAdminProfileName(e.target.value)} placeholder="Your display name" />
                                        </div>
                                        <div className="col-12 pt-2">
                                            <button className="btn btn-success" onClick={updateAdminProfile} disabled={!isProfileDirty()}><i className="fas fa-save me-2"></i>Update Profile</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-4">
                                    <h5 className="text-white mb-4"><i className="fas fa-lock me-2 text-warning"></i>Change Password</h5>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label text-muted small text-uppercase">Current Password</label>
                                            <input type="password" className="form-control bg-dark text-white border-secondary" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label text-muted small text-uppercase">New Password</label>
                                            <input type="password" className="form-control bg-dark text-white border-secondary" value={passwordForm.newPass} onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })} placeholder="Min. 8 characters" />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label text-muted small text-uppercase">Confirm New Password</label>
                                            <input type="password" className="form-control bg-dark text-white border-secondary" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
                                        </div>
                                        <div className="col-12 pt-2">
                                            <button className="btn btn-warning text-dark" onClick={handleChangePassword} disabled={!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm}><i className="fas fa-key me-2"></i>Change Password</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === SECTION 3: Email & Notifications === */}
                        {activeSettingsSection === 'notifications' && (
                            <div className="glass-card p-4">
                                <h5 className="text-white mb-4"><i className="fas fa-envelope me-2 text-info"></i>Email & Notifications</h5>
                                <div className="d-flex flex-column gap-3 mb-4">
                                    <div className="form-check form-switch d-flex align-items-center gap-2">
                                        <input className="form-check-input border-secondary fs-5" type="checkbox" checked={notifPrefs.notify_admin_new_user === 'true'} onChange={e => setNotifPrefs({ ...notifPrefs, notify_admin_new_user: e.target.checked ? 'true' : 'false' })} id="notifNewUser" />
                                        <label className="form-check-label text-white" htmlFor="notifNewUser">Email me when a new user signs up</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2">
                                        <input className="form-check-input border-secondary fs-5" type="checkbox" checked={notifPrefs.notify_admin_waitlist === 'true'} onChange={e => setNotifPrefs({ ...notifPrefs, notify_admin_waitlist: e.target.checked ? 'true' : 'false' })} id="notifWaitlist" />
                                        <label className="form-check-label text-white" htmlFor="notifWaitlist">Email me when course waitlist gets 10+ signups</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2">
                                        <input className="form-check-input border-secondary fs-5" type="checkbox" checked={notifPrefs.notify_admin_completion === 'true'} onChange={e => setNotifPrefs({ ...notifPrefs, notify_admin_completion: e.target.checked ? 'true' : 'false' })} id="notifCompletion" />
                                        <label className="form-check-label text-white" htmlFor="notifCompletion">Email me when a user completes a course</label>
                                    </div>
                                </div>
                                <p className="text-muted small mb-3"><i className="fas fa-info-circle me-1"></i>Email notifications require a transactional email service (Resend, SendGrid, etc.) to be configured. These settings save your preferences for when you integrate one.</p>
                                <button className="btn btn-success" onClick={saveNotificationPrefs} disabled={!isNotifDirty()}><i className="fas fa-save me-2"></i>Save Notification Preferences</button>
                            </div>
                        )}

                        {/* === SECTION 4: Danger Zone === */}
                        {activeSettingsSection === 'danger' && (
                            <div className="border border-danger rounded p-4" style={{ background: 'rgba(220,53,69,0.05)' }}>
                                <h5 className="text-danger mb-4"><i className="fas fa-exclamation-triangle me-2"></i>Danger Zone</h5>
                                <div className="d-flex flex-column gap-4">
                                    {/* Clear Waitlist */}
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <div>
                                            <h6 className="text-white mb-1">Clear All Waitlist Emails</h6>
                                            <p className="text-muted small mb-0">Permanently deletes all emails from the course waitlist. This cannot be undone.</p>
                                        </div>
                                        <button className="btn btn-outline-danger flex-shrink-0" onClick={() => setClearWaitlistModal(true)}>
                                            <i className="fas fa-trash me-2"></i>Clear Waitlist
                                        </button>
                                    </div>

                                    {/* Reset Progress */}
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <div>
                                            <h6 className="text-white mb-1">Reset All User Progress</h6>
                                            <p className="text-muted small mb-0">Sets progress to 0% and clears completed lessons for every enrolled student.</p>
                                        </div>
                                        <button className="btn btn-outline-danger flex-shrink-0" onClick={() => setResetProgressModal(true)}>
                                            <i className="fas fa-redo me-2"></i>Reset Progress
                                        </button>
                                    </div>

                                    {/* Export Backup */}
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <div>
                                            <h6 className="text-white mb-1">Export Full Database Backup (JSON)</h6>
                                            <p className="text-muted small mb-0">Downloads all profiles, enrollments, lessons, announcements, and settings as a JSON file. Non-destructive.</p>
                                        </div>
                                        <button className="btn btn-outline-warning flex-shrink-0" onClick={handleExportBackup}>
                                            <i className="fas fa-download me-2"></i>Export Backup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Clear Waitlist Confirmation */}
            {clearWaitlistModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-danger border-opacity-50" style={{ maxWidth: '450px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-trash text-danger fs-1 mb-3"></i>
                            <h4 className="text-white">Clear All Waitlist?</h4>
                            <p className="text-muted">This will permanently delete <strong className="text-white">all waitlist emails</strong>. This cannot be undone.</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => setClearWaitlistModal(false)}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1" onClick={handleClearWaitlist}>Yes, Clear All</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset All Progress Confirmation */}
            {resetProgressModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 mx-3 border-danger border-opacity-50" style={{ maxWidth: '480px', width: '100%', animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="text-center mb-4">
                            <i className="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
                            <h4 className="text-white">Reset ALL User Progress?</h4>
                            <p className="text-muted">This will set progress to 0% and clear completed lessons for <strong className="text-white">every enrolled student</strong>. This cannot be undone.</p>
                            <p className="text-warning small fw-bold">Type <code className="text-danger">RESET ALL</code> to confirm:</p>
                            <input type="text" className="form-control bg-dark text-white border-secondary text-center" value={resetConfirmText} onChange={e => setResetConfirmText(e.target.value)} placeholder="RESET ALL" />
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-light flex-grow-1" onClick={() => { setResetProgressModal(false); setResetConfirmText(''); }}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1" onClick={handleResetAllProgress} disabled={resetConfirmText !== 'RESET ALL'}>Confirm Reset</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingsTab;
