import { Link } from 'react-router-dom';

const CourseCard = ({ course, index, isEnrolled, onEnroll }) => {
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
                <p>{course.description}</p>

                {!course.isPlaceholder && (
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
                )}
            </div>
        </div>
    );
};

export default CourseCard;
