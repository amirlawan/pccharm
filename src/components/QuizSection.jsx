import { useState } from 'react';

const QuizSection = ({ questions, onPass, onFail, isCompleted }) => {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const PASS_THRESHOLD = 70;

    if (!questions || questions.length === 0) {
        return (
            <div className="glass-card p-4 mt-4">
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <h5 className="mb-1">
                            <i className="fas fa-check-circle text-success me-2"></i>
                            Ready to Continue
                        </h5>
                        <p className="text-muted mb-0 small">No quiz for this lesson</p>
                    </div>
                    {!isCompleted && (
                        <button
                            className="btn btn-success"
                            onClick={() => onPass()}
                        >
                            Mark Complete <i className="fas fa-check ms-1"></i>
                        </button>
                    )}
                    {isCompleted && (
                        <span className="badge bg-success fs-6 py-2 px-3">
                            <i className="fas fa-check me-1"></i> Completed
                        </span>
                    )}
                </div>
            </div>
        );
    }

    const handleAnswer = (questionId, optionIndex) => {
        if (submitted) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = () => {
        let correct = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correct_index) {
                correct++;
            }
        });

        const percentage = Math.round((correct / questions.length) * 100);
        setScore(percentage);
        setSubmitted(true);
        setShowResults(true);

        if (percentage >= PASS_THRESHOLD) {
            onPass();
        } else {
            onFail && onFail();
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setSubmitted(false);
        setScore(null);
        setShowResults(false);
    };

    const allAnswered = Object.keys(answers).length === questions.length;

    return (
        <div className="glass-card p-4 mt-4">
            <div className="d-flex align-items-center mb-4">
                <i className="fas fa-question-circle text-info fs-4 me-3"></i>
                <div>
                    <h5 className="mb-0">Lesson Quiz</h5>
                    <small className="text-muted">Score {PASS_THRESHOLD}% or higher to complete this lesson</small>
                </div>
            </div>

            {isCompleted && !showResults && (
                <div className="alert alert-success d-flex align-items-center">
                    <i className="fas fa-check-circle me-2"></i>
                    You've already completed this lesson!
                </div>
            )}

            {showResults && (
                <div className={`alert ${score >= PASS_THRESHOLD ? 'alert-success' : 'alert-warning'} mb-4`}>
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <strong>
                                {score >= PASS_THRESHOLD ? (
                                    <><i className="fas fa-trophy me-2"></i>Great job!</>
                                ) : (
                                    <><i className="fas fa-redo me-2"></i>Almost there!</>
                                )}
                            </strong>
                            <p className="mb-0">
                                You scored <strong>{score}%</strong>
                                {score < PASS_THRESHOLD && ` - Need ${PASS_THRESHOLD}% to pass`}
                            </p>
                        </div>
                        {score < PASS_THRESHOLD && (
                            <button className="btn btn-warning btn-sm" onClick={handleRetry}>
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="quiz-questions">
                {questions.map((q, qIndex) => (
                    <div key={q.id} className="mb-4 p-3 bg-dark bg-opacity-50 rounded">
                        <p className="fw-medium mb-3">
                            <span className="badge bg-info me-2">{qIndex + 1}</span>
                            {q.question}
                        </p>
                        <div className="d-flex flex-column gap-2">
                            {q.options.map((option, oIndex) => {
                                const isSelected = answers[q.id] === oIndex;
                                const isCorrect = q.correct_index === oIndex;
                                let buttonClass = 'btn btn-outline-light text-start';

                                if (submitted) {
                                    if (isCorrect) {
                                        buttonClass = 'btn btn-success text-start';
                                    } else if (isSelected && !isCorrect) {
                                        buttonClass = 'btn btn-danger text-start';
                                    }
                                } else if (isSelected) {
                                    buttonClass = 'btn btn-info text-start';
                                }

                                return (
                                    <button
                                        key={oIndex}
                                        className={buttonClass}
                                        onClick={() => handleAnswer(q.id, oIndex)}
                                        disabled={submitted}
                                    >
                                        <span className="me-2">{String.fromCharCode(65 + oIndex)}.</span>
                                        {option}
                                        {submitted && isCorrect && (
                                            <i className="fas fa-check ms-2"></i>
                                        )}
                                        {submitted && isSelected && !isCorrect && (
                                            <i className="fas fa-times ms-2"></i>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {!submitted && !isCompleted && (
                <button
                    className="btn btn-gradient w-100 mt-3"
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                >
                    {allAnswered ? 'Submit Answers' : `Answer all ${questions.length} questions`}
                </button>
            )}
        </div>
    );
};

export default QuizSection;
