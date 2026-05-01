import { Link } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/* 
MIGRATION REQUIRED: Run this in Supabase SQL editor to create the waitlist table:

CREATE TABLE public.course_waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.course_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert into course_waitlist" ON public.course_waitlist FOR INSERT WITH CHECK (true);
*/

const CourseCard = ({ course, index, isEnrolled, onEnroll }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(''); // '' | 'submitting' | 'success' | 'validation_error' | 'server_error'
    const [errorMessage, setErrorMessage] = useState('');

    const handleNotifySubmit = async (e) => {
        e.preventDefault();
        
        // Basic email validation
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setStatus('validation_error');
            return;
        }

        setStatus('submitting');
        
        const { error } = await supabase
            .from('course_waitlist')
            .insert([{ email }]);

        if (error) {
            console.error('Waitlist error:', error);
            setErrorMessage(error.message || error.details || 'Unknown database error');
            setStatus('server_error');
        } else {
            setStatus('success');
            setEmail('');
        }
    };

    if (course.isPlaceholder || course.is_placeholder) {
        return (
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={(index % 3) * 50}>
                <div className="glass-card course-item-card position-relative h-100 d-flex flex-column text-center">
                    <i className="fas fa-bell course-icon text-warning mb-3" style={{ fontSize: '2.5rem' }}></i>
                    <h5 className="mb-3">More Coming Soon</h5>
                    <p className="text-muted small mb-4">We're constantly building new courses! Join the waitlist to be the first to know when they drop.</p>
                    
                    <div className="mt-auto">
                        {status === 'success' ? (
                            <div className="alert alert-success py-2 mb-0 border-0 bg-success bg-opacity-25 text-success">
                                <i className="fas fa-check-circle me-2"></i> You're on the list!
                            </div>
                        ) : (
                            <form onSubmit={handleNotifySubmit}>
                                <div className="input-group input-group-sm mb-1">
                                    <input 
                                        type="email" 
                                        className={`form-control ${(status === 'validation_error' || status === 'server_error') ? 'is-invalid' : ''} bg-dark text-white border-secondary`}
                                        placeholder="Your email address" 
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (status === 'validation_error' || status === 'server_error') setStatus('');
                                        }}
                                        disabled={status === 'submitting'}
                                        required
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-warning text-dark fw-bold"
                                        disabled={status === 'submitting'}
                                    >
                                        {status === 'submitting' ? <i className="fas fa-spinner fa-spin"></i> : 'Notify Me'}
                                    </button>
                                </div>
                                {status === 'validation_error' && <small className="text-danger d-block text-start mt-1">Please enter a valid email.</small>}
                                {status === 'server_error' && <small className="text-danger d-block text-start mt-1">{errorMessage}</small>}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={(index % 3) * 50}>
            <div className="glass-card course-item-card position-relative h-100 d-flex flex-column">
                <i className={`${course.icon || 'fas fa-book'} course-icon`}></i>
                {course.badge && (
                    <span className="badge bg-info text-dark position-absolute top-0 end-0 mt-2 me-2">
                        {course.badge}
                    </span>
                )}
                <h5>{course.title}</h5>
                {course.level && (
                    <div className="mb-2">
                        <span className={`badge ${
                            course.level === 'Beginner' ? 'bg-success' :
                            course.level === 'Intermediate' ? 'bg-warning text-dark' :
                            'bg-danger'
                        }`}>
                            {course.level}
                        </span>
                    </div>
                )}
                <p>{course.description}</p>

                <div className="mt-auto">
                    {isEnrolled ? (
                        <Link to="/dashboard" className="btn btn-sm btn-gradient w-100">
                            Continue Learning
                        </Link>
                    ) : (
                        <button
                            onClick={() => onEnroll(course.id)}
                            className="btn btn-sm btn-outline-light w-100"
                        >
                            Enroll Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
