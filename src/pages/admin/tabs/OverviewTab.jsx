import React, { useState } from 'react';

const OverviewTab = ({
    loadingStats,
    dashboardStats,
    recentEnrollments = [],
    topCourses = [],
    activityLogs = [],
    systemHealth = { status: 'Operational', latencyMs: 38, dbConnected: true, lastPing: '' },
    categoryDistribution = [],
    totalPlatformValue = 0,
    fetchDashboardStats,
    setActiveTab,
    exportWaitlistCSV,
    handleClearWaitlist,
    setAnnouncementModal,
    setCourseModal,
    showToast,
    setInboxSubTab
}) => {
    const [activeInsightTab, setActiveInsightTab] = useState('activity');

    const handleExportAudit = () => {
        try {
            const reportData = {
                timestamp: new Date().toISOString(),
                health: systemHealth,
                stats: dashboardStats,
                topCourses: topCourses,
                recentEnrollments: recentEnrollments.map(e => ({
                    user: e.profiles?.full_name || e.user_id,
                    email: e.profiles?.email,
                    course: e.courses?.title,
                    progress: e.progress,
                    enrolled_at: e.enrolled_at
                })),
                totalPlatformValue: totalPlatformValue
            };
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', jsonString);
            downloadAnchor.setAttribute('download', `pccharm_platform_audit_${new Date().toISOString().slice(0,10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            if (showToast) showToast('Platform audit report downloaded.', 'success');
        } catch (err) {
            if (showToast) showToast('Failed to export audit report.', 'error');
        }
    };

    const completionRate = dashboardStats.totalEnrollments > 0 && typeof dashboardStats.completions === 'number'
        ? Math.round((dashboardStats.completions / dashboardStats.totalEnrollments) * 100)
        : (dashboardStats.totalEnrollments > 0 ? 100 : 0);

    return (
        <div className="animate-fade-in">
            {/* Header Control Bar */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 border-bottom border-secondary border-opacity-25 pb-3 gap-3">
                <div>
                    <h3 className="mb-1 text-white d-flex align-items-center gap-2">
                        <i className="fas fa-shield-halved text-info"></i>
                        Executive Command Center
                    </h3>
                    <p className="text-muted small mb-0">Full Platform Authority & Real-Time Operational Overview</p>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* System Health Status Badge */}
                    <div className="glass-card px-3 py-1 d-flex align-items-center gap-2 rounded-pill border border-success border-opacity-25">
                        <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }}></span>
                        <span className="text-success small fw-semibold">
                            {systemHealth.status} ({systemHealth.latencyMs}ms)
                        </span>
                    </div>

                    <button 
                        className="btn btn-outline-info btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                        onClick={fetchDashboardStats}
                        disabled={loadingStats}
                    >
                        <i className={`fas fa-sync-alt ${loadingStats ? 'fa-spin' : ''}`}></i>
                        <span>Refresh</span>
                    </button>

                    <button 
                        className="btn btn-sm btn-info text-dark fw-bold rounded-pill px-3 d-flex align-items-center gap-2"
                        onClick={handleExportAudit}
                    >
                        <i className="fas fa-file-export"></i>
                        <span>Export Audit</span>
                    </button>
                </div>
            </div>
            
            {/* 6 Executive Metric Cards */}
            <div className="row g-3 mb-4">
                {/* 1. Total Users */}
                <div className="col-6 col-md-4 col-xl-2">
                    <div className="glass-card p-3 text-center h-100 position-relative overflow-hidden hover-card">
                        <div className="text-info mb-2 fs-4"><i className="fas fa-users"></i></div>
                        {loadingStats ? (
                            <div className="spinner-border spinner-border-sm text-info my-2"></div>
                        ) : (
                            <h3 className="text-white m-0 fw-bold">{dashboardStats.totalUsers}</h3>
                        )}
                        <p className="text-muted small m-0 mt-1 text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Total Users</p>
                        <span className="badge bg-info bg-opacity-10 text-info mt-2" style={{ fontSize: '0.65rem' }}>
                            <i className="fas fa-user-check me-1"></i>{dashboardStats.activeLearners} Active
                        </span>
                    </div>
                </div>

                {/* 2. Total Enrollments */}
                <div className="col-6 col-md-4 col-xl-2">
                    <div className="glass-card p-3 text-center h-100 position-relative overflow-hidden hover-card">
                        <div className="text-warning mb-2 fs-4"><i className="fas fa-graduation-cap"></i></div>
                        {loadingStats ? (
                            <div className="spinner-border spinner-border-sm text-warning my-2"></div>
                        ) : (
                            <h3 className="text-white m-0 fw-bold">{dashboardStats.totalEnrollments}</h3>
                        )}
                        <p className="text-muted small m-0 mt-1 text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Enrollments</p>
                        <span className="badge bg-warning bg-opacity-10 text-warning mt-2" style={{ fontSize: '0.65rem' }}>
                            <i className="fas fa-chart-line me-1"></i>{completionRate}% Completion
                        </span>
                    </div>
                </div>

                {/* 3. Platform Value Index */}
                <div className="col-6 col-md-4 col-xl-2">
                    <div className="glass-card p-3 text-center h-100 position-relative overflow-hidden hover-card">
                        <div className="text-success mb-2 fs-4"><i className="fas fa-sack-dollar"></i></div>
                        {loadingStats ? (
                            <div className="spinner-border spinner-border-sm text-success my-2"></div>
                        ) : (
                            <h3 className="text-white m-0 fw-bold">${totalPlatformValue.toLocaleString()}</h3>
                        )}
                        <p className="text-muted small m-0 mt-1 text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Course Value Index</p>
                        <span className="badge bg-success bg-opacity-10 text-success mt-2" style={{ fontSize: '0.65rem' }}>
                            <i className="fas fa-tags me-1"></i>Enrolled Worth
                        </span>
                    </div>
                </div>

                {/* 4. Completions & Certificates */}
                <div className="col-6 col-md-4 col-xl-2">
                    <div className="glass-card p-3 text-center h-100 position-relative overflow-hidden hover-card">
                        <div className="text-primary mb-2 fs-4"><i className="fas fa-award"></i></div>
                        {loadingStats ? (
                            <div className="spinner-border spinner-border-sm text-primary my-2"></div>
                        ) : (
                            <h3 className="text-white m-0 fw-bold">{dashboardStats.completions}</h3>
                        )}
                        <p className="text-muted small m-0 mt-1 text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Certificates</p>
                        <span className="badge bg-primary bg-opacity-10 text-primary mt-2" style={{ fontSize: '0.65rem' }}>
                            <i className="fas fa-certificate me-1"></i>100% Completed
                        </span>
                    </div>
                </div>

                {/* 5. Waitlist Signups */}
                <div className="col-6 col-md-4 col-xl-2">
                    <div className="glass-card p-3 text-center h-100 position-relative overflow-hidden hover-card">
                        <div className="text-danger mb-2 fs-4"><i className="fas fa-bell"></i></div>
                        {loadingStats ? (
                            <div className="spinner-border spinner-border-sm text-danger my-2"></div>
                        ) : (
                            <h3 className="text-white m-0 fw-bold">{dashboardStats.waitlist}</h3>
                        )}
                        <p className="text-muted small m-0 mt-1 text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Waitlist Leads</p>
                        <button 
                            className="badge bg-danger bg-opacity-25 text-danger border-0 mt-2 hover-opacity pointer"
                            style={{ fontSize: '0.65rem' }}
                            onClick={() => exportWaitlistCSV && exportWaitlistCSV()}
                        >
                            <i className="fas fa-download me-1"></i>CSV Export
                        </button>
                    </div>
                </div>

                {/* 6. System Health */}
                <div className="col-6 col-md-4 col-xl-2">
                    <div className="glass-card p-3 text-center h-100 position-relative overflow-hidden hover-card">
                        <div className="text-info mb-2 fs-4"><i className="fas fa-server"></i></div>
                        <h3 className="text-white m-0 fw-bold">{systemHealth.latencyMs} <span className="fs-6 text-muted">ms</span></h3>
                        <p className="text-muted small m-0 mt-1 text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>DB Latency</p>
                        <span className="badge bg-success bg-opacity-10 text-success mt-2" style={{ fontSize: '0.65rem' }}>
                            <i className="fas fa-check-circle me-1"></i>Supabase Ready
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Authority Command Hub */}
            <div className="glass-card p-3 mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="text-white mb-0 d-flex align-items-center gap-2">
                        <i className="fas fa-bolt text-warning"></i>
                        Quick Authority Actions
                    </h6>
                    <small className="text-muted">Instant Platform Administration</small>
                </div>
                <div className="row g-2">
                    <div className="col-6 col-md-4 col-lg-2">
                        <button 
                            className="btn btn-dark w-100 text-start p-2.5 rounded border border-secondary border-opacity-25 hover-border-info d-flex align-items-center gap-2"
                            onClick={() => {
                                if (setActiveTab) setActiveTab('users');
                            }}
                        >
                            <i className="fas fa-user-gear text-info fs-5"></i>
                            <div className="text-truncate">
                                <div className="text-white small fw-semibold">Manage Users</div>
                                <small className="text-muted" style={{ fontSize: '0.65rem' }}>Roles & Access</small>
                            </div>
                        </button>
                    </div>

                    <div className="col-6 col-md-4 col-lg-2">
                        <button 
                            className="btn btn-dark w-100 text-start p-2.5 rounded border border-secondary border-opacity-25 hover-border-warning d-flex align-items-center gap-2"
                            onClick={() => {
                                if (setCourseModal) setCourseModal({ isOpen: true, course: null });
                            }}
                        >
                            <i className="fas fa-plus-circle text-warning fs-5"></i>
                            <div className="text-truncate">
                                <div className="text-white small fw-semibold">Add Course</div>
                                <small className="text-muted" style={{ fontSize: '0.65rem' }}>New Curriculum</small>
                            </div>
                        </button>
                    </div>

                    <div className="col-6 col-md-4 col-lg-2">
                        <button 
                            className="btn btn-dark w-100 text-start p-2.5 rounded border border-secondary border-opacity-25 hover-border-success d-flex align-items-center gap-2"
                            onClick={() => {
                                if (setAnnouncementModal) setAnnouncementModal({ isOpen: true, announcement: null });
                            }}
                        >
                            <i className="fas fa-bullhorn text-success fs-5"></i>
                            <div className="text-truncate">
                                <div className="text-white small fw-semibold">Broadcast Alert</div>
                                <small className="text-muted" style={{ fontSize: '0.65rem' }}>Site Announcement</small>
                            </div>
                        </button>
                    </div>

                    <div className="col-6 col-md-4 col-lg-2">
                        <button 
                            className="btn btn-dark w-100 text-start p-2.5 rounded border border-secondary border-opacity-25 hover-border-primary d-flex align-items-center gap-2"
                            onClick={() => {
                                if (setActiveTab) setActiveTab('inbox');
                                if (setInboxSubTab) setInboxSubTab('compose');
                            }}
                        >
                            <i className="fas fa-paper-plane text-primary fs-5"></i>
                            <div className="text-truncate">
                                <div className="text-white small fw-semibold">Send Message</div>
                                <small className="text-muted" style={{ fontSize: '0.65rem' }}>Targeted Inbox</small>
                            </div>
                        </button>
                    </div>

                    <div className="col-6 col-md-4 col-lg-2">
                        <button 
                            className="btn btn-dark w-100 text-start p-2.5 rounded border border-secondary border-opacity-25 hover-border-danger d-flex align-items-center gap-2"
                            onClick={() => {
                                if (setActiveTab) setActiveTab('settings');
                            }}
                        >
                            <i className="fas fa-sliders text-danger fs-5"></i>
                            <div className="text-truncate">
                                <div className="text-white small fw-semibold">System Settings</div>
                                <small className="text-muted" style={{ fontSize: '0.65rem' }}>Maintenance Mode</small>
                            </div>
                        </button>
                    </div>

                    <div className="col-6 col-md-4 col-lg-2">
                        <button 
                            className="btn btn-dark w-100 text-start p-2.5 rounded border border-secondary border-opacity-25 hover-border-info d-flex align-items-center gap-2"
                            onClick={handleExportAudit}
                        >
                            <i className="fas fa-database text-info fs-5"></i>
                            <div className="text-truncate">
                                <div className="text-white small fw-semibold">Backup DB</div>
                                <small className="text-muted" style={{ fontSize: '0.65rem' }}>JSON Export</small>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Dual Insights Hub */}
            <div className="row g-4 mb-4">
                {/* Left Column: Real-time Activity Feed & Recent Enrollments */}
                <div className="col-lg-8">
                    <div className="glass-card p-4 h-100">
                        {/* Tab Switcher Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
                            <div className="d-flex gap-3">
                                <button 
                                    className={`btn btn-link text-decoration-none p-0 fw-bold ${activeInsightTab === 'activity' ? 'text-info border-bottom border-info border-2 pb-1' : 'text-muted'}`}
                                    onClick={() => setActiveInsightTab('activity')}
                                >
                                    <i className="fas fa-stream me-2"></i>Live Platform Activity ({activityLogs.length})
                                </button>
                                <button 
                                    className={`btn btn-link text-decoration-none p-0 fw-bold ${activeInsightTab === 'enrollments' ? 'text-info border-bottom border-info border-2 pb-1' : 'text-muted'}`}
                                    onClick={() => setActiveInsightTab('enrollments')}
                                >
                                    <i className="fas fa-history me-2"></i>Recent Enrollments ({recentEnrollments.length})
                                </button>
                            </div>
                            <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => setActiveTab && setActiveTab(activeInsightTab === 'activity' ? 'inbox' : 'enrollments')}>
                                View All <i className="fas fa-arrow-right ms-1"></i>
                            </button>
                        </div>

                        {/* Content 1: Live Platform Activity */}
                        {activeInsightTab === 'activity' && (
                            <div>
                                {activityLogs.length > 0 ? (
                                    <div className="d-flex flex-column gap-3">
                                        {activityLogs.map((log) => (
                                            <div key={log.id} className="d-flex align-items-center justify-content-between p-3 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-10 hover-bg-light">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="glass-card p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                        <i className={log.icon}></i>
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold text-white small">{log.title}</div>
                                                        <small className="text-muted" style={{ fontSize: '0.8rem' }}>{log.desc}</small>
                                                    </div>
                                                </div>
                                                <span className="badge bg-secondary bg-opacity-25 text-muted" style={{ fontSize: '0.7rem' }}>
                                                    {log.time}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-5">
                                        <i className="fas fa-inbox fs-1 mb-3 opacity-25"></i>
                                        <p className="mb-0">No live activity events captured yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content 2: Recent Enrollments Table */}
                        {activeInsightTab === 'enrollments' && (
                            <div>
                                {loadingStats ? (
                                    <div className="text-center py-5"><div className="spinner-border text-info"></div></div>
                                ) : recentEnrollments.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover table-borderless align-middle mb-0">
                                            <thead className="border-bottom border-secondary border-opacity-25">
                                                <tr>
                                                    <th className="text-muted small text-uppercase pb-3">User</th>
                                                    <th className="text-muted small text-uppercase pb-3">Course</th>
                                                    <th className="text-muted small text-uppercase pb-3">Enrolled</th>
                                                    <th className="text-muted small text-uppercase pb-3">Progress</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentEnrollments.map((enrollment, idx) => (
                                                    <tr key={idx} className="border-bottom border-secondary border-opacity-10">
                                                        <td className="py-3">
                                                            <div className="fw-bold text-white">{enrollment.profiles?.full_name || 'Student'}</div>
                                                            <small className="text-muted">{enrollment.profiles?.email || 'N/A'}</small>
                                                        </td>
                                                        <td className="py-3 text-white">
                                                            {enrollment.courses?.title || 'Unknown Course'}
                                                        </td>
                                                        <td className="py-3 text-muted small">
                                                            {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : 'Recent'}
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="d-flex align-items-center">
                                                                <div className="progress flex-grow-1 me-2" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                                                    <div 
                                                                        className={`progress-bar ${enrollment.progress === 100 ? 'bg-success' : 'bg-info'}`} 
                                                                        style={{ width: `${enrollment.progress || 0}%` }}
                                                                    ></div>
                                                                </div>
                                                                <small className="text-muted" style={{ minWidth: '35px' }}>{enrollment.progress || 0}%</small>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-5">No recent enrollments recorded.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Top Courses & Category Distribution */}
                <div className="col-lg-4">
                    <div className="d-flex flex-column gap-4 h-100">
                        {/* Top Courses */}
                        <div className="glass-card p-4 flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-white mb-0 d-flex align-items-center gap-2">
                                    <i className="fas fa-fire text-warning"></i>
                                    Top Enrolled Courses
                                </h6>
                                <button className="btn btn-link btn-sm text-info text-decoration-none p-0" onClick={() => setActiveTab && setActiveTab('courses')}>
                                    Edit Courses
                                </button>
                            </div>
                            {loadingStats ? (
                                <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-warning"></div></div>
                            ) : topCourses.length > 0 ? (
                                <div className="d-flex flex-column gap-2.5">
                                    {topCourses.map((course, idx) => {
                                        const maxCount = topCourses[0].count || 1;
                                        const percent = Math.round((course.count / maxCount) * 100);
                                        return (
                                            <div key={course.id} className="bg-dark bg-opacity-40 p-2.5 rounded border border-secondary border-opacity-25">
                                                <div className="d-flex justify-content-between align-items-center mb-1.5">
                                                    <div className="fw-bold text-white text-truncate pe-2 small">
                                                        <span className="text-muted me-2">#{idx + 1}</span>
                                                        {course.title}
                                                    </div>
                                                    <span className="badge bg-warning bg-opacity-25 text-warning fw-semibold" style={{ fontSize: '0.7rem' }}>
                                                        {course.count} Students
                                                    </span>
                                                </div>
                                                <div className="progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                                    <div className="progress-bar bg-warning" style={{ width: `${percent}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-muted py-4 small">No course data available.</div>
                            )}
                        </div>

                        {/* Category Breakdown */}
                        <div className="glass-card p-4">
                            <h6 className="text-white mb-3 d-flex align-items-center gap-2">
                                <i className="fas fa-layer-group text-info"></i>
                                Category Health
                            </h6>
                            {categoryDistribution.length > 0 ? (
                                <div className="d-flex flex-column gap-2.5">
                                    {categoryDistribution.map((cat, idx) => (
                                        <div key={idx}>
                                            <div className="d-flex justify-content-between align-items-center small mb-1">
                                                <span className="text-muted">{cat.name}</span>
                                                <span className="text-white fw-semibold">{cat.count} ({cat.percent}%)</span>
                                            </div>
                                            <div className="progress" style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                                                <div 
                                                    className="progress-bar bg-info" 
                                                    style={{ width: `${cat.percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted small text-center py-3">Category metrics aggregating...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
