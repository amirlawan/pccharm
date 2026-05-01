import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Helmet } from 'react-helmet-async';

const Certificates = () => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCertificates = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }
            setUser(user);

            // Check if admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            const isUserAdmin = profile?.is_admin || false;
            setIsAdmin(isUserAdmin);

            // Fetch Enrollments
            try {
                const { data, error } = await supabase
                    .from('enrollments')
                    .select(`
                        course_id,
                        progress,
                        enrolled_at,
                        courses (
                            id,
                            title,
                            icon,
                            category
                        )
                    `)
                    .eq('user_id', user.id);

                if (!error && data && data.length > 0) {
                    // Flatten and filter
                    let certificates = data.map(item => ({
                        ...item.courses,
                        progress: item.progress || 0,
                        completionDate: item.enrolled_at
                    }));

                    // Exception for admin: show all as completed
                    if (!isUserAdmin) {
                        certificates = certificates.filter(c => c.progress >= 100);
                    }

                    setCompletedCourses(certificates);
                } else if (isUserAdmin) {
                    // Provide mock certificates for admin testing if they haven't enrolled in anything
                    const { data: mockCourses } = await supabase.from('courses').select('*').limit(3);
                    if (mockCourses) {
                        const mockCertificates = mockCourses.map(course => ({
                            ...course,
                            progress: 100,
                            completionDate: new Date().toISOString()
                        }));
                        setCompletedCourses(mockCertificates);
                    }
                }
            } catch (err) {
                console.error("Error fetching certificates:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, [navigate]);

    const handleDownloadClick = async (course) => {
        const element = document.getElementById(`certificate-${course.id}`);
        if (!element) return;

        setToastMessage(`Preparing PDF for ${course.title}...`);

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Calculate dimensions to maintain aspect ratio
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${course.title.replace(/\s+/g, '_')}_Certificate.pdf`);
            
            setToastMessage('Download complete!');
            setTimeout(() => setToastMessage(''), 3000);
        } catch (error) {
            console.error("Error generating PDF:", error);
            setToastMessage('Failed to generate PDF.');
            setTimeout(() => setToastMessage(''), 3000);
        }
    };

    if (loading) {
        return <div className="text-center" style={{ paddingTop: '150px' }}><div className="loader"></div></div>;
    }

    return (
        <section className="hero" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px' }}>
            <Helmet>
                <title>My Certificates | PcCharm™</title>
                <link rel="canonical" href="https://pccharm.vercel.app/certificates" />
            </Helmet>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <h2 className="mb-0">My Certificates</h2>
                    <Link to="/dashboard" className="btn btn-outline-light">Back to Dashboard</Link>
                </div>

                {toastMessage && (
                    <div className="alert alert-info position-fixed top-0 start-50 translate-middle-x mt-5" style={{ zIndex: 1050 }}>
                        {toastMessage}
                    </div>
                )}

                {completedCourses.length > 0 ? (
                    <div className="row g-4">
                        {completedCourses.map((course) => (
                            <div key={course.id} className="col-12 col-xl-10 mx-auto mb-5">
                                <div className="d-flex flex-column align-items-center">
                                    {/* The Certificate Document */}
                                    <div id={`certificate-${course.id}`} 
                                         className="p-3 w-100"
                                         style={{ 
                                             backgroundColor: '#0a1128', // Dark blue outer border
                                             boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                                             maxWidth: '1000px',
                                             aspectRatio: '1.414 / 1', // A4 Landscape ratio
                                             display: 'flex',
                                             flexDirection: 'column'
                                         }}>
                                         <div className="h-100 d-flex flex-column justify-content-center text-center p-4 p-md-5"
                                              style={{
                                                  backgroundColor: '#fdfdfd', // White document background
                                                  border: '3px solid #d4af37', // Gold inner border
                                                  color: '#333333',
                                                  position: 'relative'
                                              }}>
                                              
                                            {/* Header / Logo */}
                                            <div className="d-flex justify-content-center align-items-center mb-4">
                                                <img src="/icon.png" alt="PcCharm Logo" style={{ width: '45px', height: '45px', marginRight: '15px' }} />
                                                <h2 className="mb-0 fw-bold" style={{ color: '#0a1128', letterSpacing: '1px' }}>
                                                    PcCharm™ <span style={{ fontWeight: 400 }}>Academy</span>
                                                </h2>
                                            </div>

                                            <div className="mb-3">
                                                <h1 className="fw-bold" style={{ color: '#d4af37', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', textTransform: 'uppercase', letterSpacing: '3px', fontFamily: 'serif' }}>
                                                    Certificate of Completion
                                                </h1>
                                            </div>

                                            <h5 className="mb-3 text-muted fst-italic">This proudly certifies that</h5>
                                            
                                            <div className="mb-4 d-flex justify-content-center">
                                                <h1 className="fw-bold m-0" style={{ color: '#0a1128', borderBottom: '2px solid #d4af37', paddingBottom: '5px', minWidth: '60%', fontFamily: 'serif' }}>
                                                    {user?.user_metadata?.full_name || user?.email}
                                                </h1>
                                            </div>
                                            
                                            <p className="lead mb-5" style={{ fontSize: '1.1rem', color: '#555' }}>
                                                has successfully completed the comprehensive requirements for<br/>
                                                <strong style={{ color: '#0a1128', fontSize: '1.6rem', display: 'block', marginTop: '10px' }}>{course.title}</strong>
                                            </p>
                                            
                                            <div className="d-flex justify-content-between align-items-end mt-auto px-2 px-md-4">
                                                <div className="text-center" style={{ minWidth: '120px' }}>
                                                    <div style={{ borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '5px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                        {new Date(course.completionDate).toLocaleDateString()}
                                                    </div>
                                                    <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Date Earned</small>
                                                </div>
                                                
                                                <div className="text-center px-3">
                                                    <div style={{ 
                                                        width: '60px', height: '60px', 
                                                        background: 'radial-gradient(circle, #f9f2d0 0%, #d4af37 100%)', 
                                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        margin: '0 auto', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                    }}>
                                                        <i className="fas fa-star text-white fs-4"></i>
                                                    </div>
                                                </div>

                                                <div className="text-center" style={{ minWidth: '120px' }}>
                                                    <div style={{ borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '5px', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: "'Brush Script MT', cursive" }}>
                                                        PcCharm Official
                                                    </div>
                                                    <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Authorized Signature</small>
                                                </div>
                                            </div>
                                         </div>
                                    </div>

                                    {/* Download Button */}
                                    <div className="text-center mt-3">
                                        <button onClick={() => handleDownloadClick(course)} className="btn btn-gradient text-white rounded-pill px-4">
                                            <i className="fas fa-download me-2"></i> Download PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card text-center p-5">
                        <i className="fas fa-certificate fs-1 text-muted mb-3"></i>
                        <h4 className="mb-3">Complete a course to earn your first certificate.</h4>
                        <Link to="/academy" className="btn btn-gradient text-white mt-2">Explore Courses</Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Certificates;
