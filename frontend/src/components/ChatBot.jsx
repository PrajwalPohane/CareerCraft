import React, { useState, useEffect } from 'react';
import { RiRobot3Fill } from "react-icons/ri";
import { IoSend } from 'react-icons/io5';
import { FiMinimize2, FiPaperclip, FiTrash2 } from 'react-icons/fi';
import './ChatBot.css';
import TestCard from './TestCard';
import { getTestQuestions } from './TestQuestions';
import AssessmentResults from './AssessmentResults';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const fileInputRef = React.useRef(null);
  const [hasResume, setHasResume] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [jobPosition, setJobPosition] = useState('');
  const [testInProgress, setTestInProgress] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  // Initial greeting and prompts
  const initialMessages = [
    {
      text: "👋 Hello! I'm your AI Career Assistant. I can help you find the perfect job match.",
      sender: "bot"
    },
    {
      text: "Please type your desired job position first, then attach your resume.",
      sender: "bot"
    }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initialMessages.forEach((msg, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, msg]);
        }, index * 1000);
      });
    }
  }, [isOpen]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!inputText.trim()) {
      setMessages(prev => [...prev, {
        text: "Please type your desired job position before attaching your resume.",
        sender: "bot",
        isError: true
      }]);
      event.target.value = '';
      return;
    }

    if (file) {
      if (file.type === "application/pdf" || file.type === "application/msword" || 
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        
        setMessages(prev => [...prev, {
          text: `Attached resume: ${file.name}`,
          sender: "user",
          isFile: true,
          fileName: file.name
        }]);
        
        // Store the file for later use
        setResumeFile(file);
        setHasResume(true);
      } else {
        setMessages(prev => [...prev, {
          text: "Please upload a resume in PDF or DOC format only.",
          sender: "bot",
          isError: true
        }]);
      }
    }
    event.target.value = '';
  };

  const handleTestComplete = async (answers) => {
    setShowTest(false);
    
    try {
      setMessages(prev => [...prev, {
        text: "Analyzing your test responses...",
        sender: "bot"
      }]);

      console.log("Submitting answers for evaluation:", answers);

      const analysisResponse = await fetch('http://localhost:8000/api/mock/evaluate_responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          responses: answers,
          topic: jobPosition,
          skills: resumeData.Skills || []
        })
      });

      const analysisData = await analysisResponse.json();
      
      if (!analysisResponse.ok) {
        throw new Error(analysisData.detail || 'Failed to analyze test responses');
      }

      // Show assessment results
      setMessages(prev => [...prev, 
        { 
          text: "✅ Test completed! Here's your detailed assessment:",
          sender: "bot"
        },
        {
          text: <AssessmentResults 
            feedback={analysisData.feedback}
            jobPosition={jobPosition}
            resumeData={resumeData}
          />,
          sender: "bot",
          isComponent: true
        }
      ]);

    } catch (error) {
      console.error('Error in test completion:', error);
      setMessages(prev => [...prev, {
        text: `Error analyzing test results: ${error.message}. Please try again.`,
        sender: "bot",
        isError: true
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      setMessages(prev => [...prev, {
        text: "Please type your desired job position.",
        sender: "bot",
        isError: true
      }]);
      return;
    }

    if (!hasResume || !resumeFile) {
      setMessages(prev => [...prev, {
        text: "Please attach your resume after typing the job position.",
        sender: "bot",
        isError: true
      }]);
      return;
    }

    setMessages(prev => [...prev, { 
      text: `Desired Position: ${inputText}`, 
      sender: "user" 
    }]);

    try {
      // First analyze the resume
      setMessages(prev => [...prev, {
        text: "Analyzing your resume... This may take a moment.",
        sender: "bot"
      }]);

      const formData = new FormData();
      formData.append('file', resumeFile);

      const llmResponse = await fetch('http://localhost:8000/api/llm/upload_resume', {
        method: 'POST',
        body: formData
      });

      const responseData = await llmResponse.json();
      
      if (!llmResponse.ok) {
        throw new Error(responseData.detail || 'Failed to analyze resume');
      }

      console.log('Resume analysis:', responseData);
      
      if (!responseData.parsed_information || !responseData.parsed_information.Skills) {
        throw new Error('Could not extract required information from resume');
      }

      setResumeData(responseData.parsed_information);
      setJobPosition(inputText);

      // Generate test questions
      try {
        setMessages(prev => [...prev, {
          text: "Generating technical assessment questions...",
          sender: "bot"
        }]);

        const mockResponse = await fetch('http://localhost:8000/api/mock/generate_questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            topic: inputText,
            skills: responseData.parsed_information.Skills || []
          })
        });

        const mockData = await mockResponse.json();
        
        if (!mockResponse.ok) {
          throw new Error(mockData.detail || 'Failed to generate test questions');
        }

        console.log('Generated questions:', mockData);
        setTestQuestions(mockData.questions);

        setMessages(prev => [...prev, {
          text: "I've analyzed your resume and prepared a technical assessment. Would you like to start the test now?",
          sender: "bot"
        }]);

        setShowTest(true);

      } catch (error) {
        console.error('Error generating questions:', error);
        setMessages(prev => [...prev, {
          text: `Error generating assessment: ${error.message}`,
          sender: "bot",
          isError: true
        }]);
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: `Error: ${error.message}. Please make sure your resume is properly formatted and try again.`,
        sender: "bot",
        isError: true
      }]);
    }

    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setHasResume(false);
    setShowTest(false);
    setTestQuestions([]);
    setResumeFile(null);
    setResumeData(null);
    // Re-initialize with greeting messages
    initialMessages.forEach((msg, index) => {
      setTimeout(() => {
        setMessages(prev => [...prev, msg]);
      }, index * 1000);
    });
  };

  const renderContent = () => {
    if (showTest) {
      return (
        <div className="test-container">
          <TestCard 
            questions={testQuestions}
            onComplete={handleTestComplete}
          />
        </div>
      );
    }

    return (
      <div className="chat-messages">
        {messages.map((message, index) => (
          <p 
            key={index} 
            className={`message ${message.isError ? 'error' : ''}`}
            style={{
              textAlign: message.sender === 'user' ? 'right' : 'left',
              marginBottom: '0.5rem'
            }}
          >
            {message.isComponent ? (
              message.text
            ) : message.isFile ? (
              <span className="file-message">
                📎 {message.fileName}
              </span>
            ) : (
              message.text
            )}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      <div className="chatbot-icon" onClick={() => setIsOpen(!isOpen)}>
        <RiRobot3Fill />
      </div>
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <span>AI Career Assistant</span>
          <div className="header-buttons">
            <button 
              className="clear-button" 
              onClick={handleClearChat}
              title="Clear Chat"
            >
              <FiTrash2 />
            </button>
            <button 
              className="minimize-button" 
              onClick={() => setIsOpen(false)}
              title="Minimize"
            >
              <FiMinimize2 />
            </button>
          </div>
        </div>
        {renderContent()}
        <div className="chat-input-container">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
          />
          <button 
            className="attach-button"
            onClick={() => fileInputRef.current.click()}
            title="Attach Resume"
            disabled={!inputText.trim()}
          >
            <FiPaperclip />
          </button>
          <input
            type="text"
            className="chat-input"
            placeholder="Type your desired job position first..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="send-button" 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || !hasResume}
          >
            <IoSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;