import React, { useState, useEffect } from 'react';
import './AssessmentCard.css';

const AssessmentCard = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Add debug logging
  useEffect(() => {
    console.log('Questions received:', questions);
  }, [questions]);

  // Early return if questions aren't loaded yet
  if (!Array.isArray(questions) || !questions.length) {
    return <div className="loading">Loading questions...</div>;
  }

  const handleOptionSelect = (option) => {
    const newAnswers = {
      ...answers,
      [currentQuestionIndex]: option
    };
    setAnswers(newAnswers);
    
    // Add delay before moving to next question
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 500);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAnswers = () => {
    // Allow submission when all available questions are answered
    if (Object.keys(answers).length === questions.length) {
      onSubmit(answers);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const totalAnswered = Object.keys(answers).length;
  const canSubmit = totalAnswered === questions.length;

  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <h2>Career Interest Assessment</h2>
        <p className="assessment-intro">
          Please answer all questions to receive your comprehensive career guidance.
        </p>
      </div>
      
      <div className="question-display">
        <div className="question-counter">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>

        <div className="question-card">
          <p className="question-text">{currentQuestion.text}</p>
          <div className="options-container">
            {currentQuestion.options.map((option, optIndex) => (
              <label 
                key={optIndex} 
                className={`option-label ${answers[currentQuestionIndex] === option ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={option}
                  checked={answers[currentQuestionIndex] === option}
                  onChange={() => handleOptionSelect(option)}
                />
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button 
            type="button"
            className="nav-btn"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              type="button"
              className="nav-btn next"
              onClick={handleNext}
              disabled={!answers[currentQuestionIndex]}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="submit-btn"
              onClick={handleSubmitAnswers}
              disabled={!canSubmit}
            >
              Submit Assessment ({totalAnswered}/{questions.length} questions answered)
            </button>
          )}
        </div>
      </div>

      <div className="assessment-footer">
        <div className="progress-indicator">
          Questions Answered: {totalAnswered}/{questions.length}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(totalAnswered / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCard; 