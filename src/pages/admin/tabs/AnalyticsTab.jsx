import React, { Suspense } from 'react';

const Line = React.lazy(() => import('react-chartjs-2').then(m => ({ default: m.Line })));
const Bar = React.lazy(() => import('react-chartjs-2').then(m => ({ default: m.Bar })));

const AnalyticsTab = ({
    analyticsLoading,
    enrollmentTimeData,
    coursePopularityData,
    completionRateData,
    fetchAnalyticsData,
}) => {
    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h3 className="text-white mb-0"><i className="fas fa-chart-line me-2 text-info"></i>Analytics</h3>
                <button className="btn btn-outline-info" onClick={fetchAnalyticsData} disabled={analyticsLoading}>
                    <i className={`fas fa-sync-alt me-2 ${analyticsLoading ? 'fa-spin' : ''}`}></i>Refresh
                </button>
            </div>

            {analyticsLoading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="spinner-border text-info" role="status"><span className="visually-hidden">Loading...</span></div>
                    <span className="text-muted ms-3">Loading analytics data...</span>
                </div>
            ) : (
                <Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-info"></div></div>}>
                    <div className="row g-4">
                        {/* Chart 1: Enrollments Over Time */}
                        <div className="col-12">
                            <div className="glass-card p-4">
                                <h5 className="text-white mb-3"><i className="fas fa-chart-area me-2 text-info"></i>Enrollments Over Time <span className="text-muted small fw-normal">(Last 30 Days)</span></h5>
                                <div style={{ height: '300px' }}>
                                    {enrollmentTimeData ? (
                                        <Line
                                            data={enrollmentTimeData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: {
                                                        backgroundColor: 'rgba(30,30,50,0.95)',
                                                        titleColor: '#fff',
                                                        bodyColor: '#ccc',
                                                        borderColor: 'rgba(54,162,235,0.3)',
                                                        borderWidth: 1,
                                                        padding: 12,
                                                        cornerRadius: 8,
                                                    }
                                                },
                                                scales: {
                                                    x: {
                                                        ticks: { color: '#888', maxRotation: 45, font: { size: 11 } },
                                                        grid: { color: 'rgba(255,255,255,0.05)' },
                                                    },
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: { color: '#888', stepSize: 1, font: { size: 11 } },
                                                        grid: { color: 'rgba(255,255,255,0.05)' },
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="d-flex justify-content-center align-items-center h-100 text-muted">No enrollment data available.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Chart 2: Course Popularity */}
                        <div className="col-lg-6">
                            <div className="glass-card p-4 h-100">
                                <h5 className="text-white mb-3"><i className="fas fa-fire me-2 text-warning"></i>Course Popularity <span className="text-muted small fw-normal">(Top 10)</span></h5>
                                <div style={{ height: '320px' }}>
                                    {coursePopularityData && coursePopularityData.labels.length > 0 ? (
                                        <Bar
                                            data={coursePopularityData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                indexAxis: 'y',
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: {
                                                        backgroundColor: 'rgba(30,30,50,0.95)',
                                                        titleColor: '#fff',
                                                        bodyColor: '#ccc',
                                                        borderColor: 'rgba(255,255,255,0.1)',
                                                        borderWidth: 1,
                                                        padding: 12,
                                                        cornerRadius: 8,
                                                    }
                                                },
                                                scales: {
                                                    x: {
                                                        beginAtZero: true,
                                                        ticks: { color: '#888', stepSize: 1, font: { size: 11 } },
                                                        grid: { color: 'rgba(255,255,255,0.05)' },
                                                    },
                                                    y: {
                                                        ticks: { color: '#ccc', font: { size: 12 } },
                                                        grid: { display: false },
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="d-flex justify-content-center align-items-center h-100 text-muted">No course data available.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Chart 3: Completion Rate */}
                        <div className="col-lg-6">
                            <div className="glass-card p-4 h-100">
                                <h5 className="text-white mb-3"><i className="fas fa-trophy me-2 text-success"></i>Completion Rate by Course</h5>
                                <div style={{ height: '320px' }}>
                                    {completionRateData && completionRateData.labels.length > 0 ? (
                                        <Bar
                                            data={completionRateData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                indexAxis: 'y',
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: {
                                                        backgroundColor: 'rgba(30,30,50,0.95)',
                                                        titleColor: '#fff',
                                                        bodyColor: '#ccc',
                                                        borderColor: 'rgba(255,255,255,0.1)',
                                                        borderWidth: 1,
                                                        padding: 12,
                                                        cornerRadius: 8,
                                                        callbacks: {
                                                            label: (ctx) => `${ctx.raw}% completed`
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    x: {
                                                        beginAtZero: true,
                                                        max: 100,
                                                        ticks: { color: '#888', callback: (v) => v + '%', font: { size: 11 } },
                                                        grid: { color: 'rgba(255,255,255,0.05)' },
                                                    },
                                                    y: {
                                                        ticks: { color: '#ccc', font: { size: 12 } },
                                                        grid: { display: false },
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="d-flex justify-content-center align-items-center h-100 text-muted">No completion data available.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="col-12">
                            <div className="glass-card p-3 d-flex justify-content-center gap-4 flex-wrap">
                                <span className="d-flex align-items-center gap-2 text-muted small">
                                    <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#22c55e', display: 'inline-block' }}></span> ≥70% Completion
                                </span>
                                <span className="d-flex align-items-center gap-2 text-muted small">
                                    <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#eab308', display: 'inline-block' }}></span> 40–69% Completion
                                </span>
                                <span className="d-flex align-items-center gap-2 text-muted small">
                                    <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#ef4444', display: 'inline-block' }}></span> &lt;40% Completion
                                </span>
                            </div>
                        </div>
                    </div>
                </Suspense>
            )}
        </div>
    );
};

export default AnalyticsTab;
