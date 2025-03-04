import React, { useState, useEffect } from 'react';
import './TestCard.css';

const TestCard = ({ questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  
  // Add debug logging for props
  useEffect(() => {
    console.log('Questions received:', questions);
  }, [questions]);

  if (!questions || questions.length === 0) {
    return <div className="loading">Loading questions...</div>;
  }

  const handleOptionSelect = (questionId, optionId) => {
    console.log(`Selected option ${optionId} for question ${questionId}`);
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNext = () => {
    console.log('handleNext called');
    console.log('Current question:', currentQuestion);
    console.log('Total questions:', questions.length);
    console.log('Current answers:', answers);

    const currentQ = questions[currentQuestion];
    if (!currentQ) {
      console.log('No current question found');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      console.log('Moving to next question');
      setCurrentQuestion(prev => prev + 1);
    } else {
      console.log('Test complete, formatting answers');
      const formattedAnswers = Object.entries(answers).map(([qId, optionId]) => {
        const question = questions.find(q => q.id === qId);
        const selectedOption = question.options.find(opt => opt.id === optionId);
        return {
          question: question.question,
          answer: selectedOption.text,
          questionId: qId,
          selectedOptionId: optionId
        };
      });
      console.log('Formatted answers:', formattedAnswers);
      onComplete(formattedAnswers);
    }
  };

  const currentQ = questions[currentQuestion];
  console.log('Current question object:', currentQ);

  return (
    <div className="test-card">
      <div className="test-header">
        <h3>Technical Assessment</h3>
        <span className="question-counter">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>
      
      <div className="question-content">
        <p className="question-text">{currentQ.question}</p>
        <div className="options-container">
          {currentQ.options.map((option) => (
            <div
              key={option.id}
              className={`option ${answers[currentQ.id] === option.id ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(currentQ.id, option.id)}
            >
              <span className="option-label">{option.id.toUpperCase()}</span>
              <span className="option-text">{option.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="test-controls">
        <button
          className="next-button"
          onClick={handleNext}
          disabled={!answers[currentQ.id]}
        >
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Test'}
        </button>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TestCard; 