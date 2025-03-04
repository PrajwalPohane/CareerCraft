import React, { useState } from 'react';
import AssessmentCard from '../../components/AssessmentCard';
import { sscQuestions } from './SSCQuestions';
import './cp.css';
import CareerGuidanceReport from '../../components/CareerGuidanceReport';

const CareerPath = () => {
  const [education, setEducation] = useState('');
  const [stream, setStream] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});

  const handleEducationChange = (e) => {
    const educationLevel = e.target.value.toLowerCase();
    setEducation(educationLevel);
    setFormData({});
    setStream('');
    setResult(null);
    setAnswers({});
  };

  const handleStreamChange = (e) => {
    setStream(e.target.value.toLowerCase());
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAssessmentSubmit = async (assessmentAnswers) => {
    setAnswers(assessmentAnswers);
    setLoading(true);
    setError(null);

    try {
      const formattedResponses = Object.entries(assessmentAnswers).map(([index, answer]) => ({
        question: sscQuestions[index].text,
        answer: answer
      }));

      const response = await fetch('http://localhost:8000/api/interest/analyze_responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: formattedResponses
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult({
        recommendations: data.recommendations,
        showDetails: true
      });
    } catch (err) {
      setError(`Failed to analyze responses: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (education === 'hsc') {
        response = await fetch('http://localhost:8000/api/career/analyze_hsc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stream: stream,
            specialization: formData.scienceStream || '',
            interests: formData.interestField,
            academicPerformance: formData.academicPerformance,
            extracurricular: formData.extracurricular,
            careerAspiration: formData.careerAspiration
          })
        });
      } else {
        // For graduates and post-graduates
        response = await fetch('http://localhost:8000/api/career/generate-roadmap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            education: education,
            specialisation: formData.specialization,
            skills: formData.skills,
            experience: formData.experience,
            interests: formData.careerInterest
          })
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult({
        recommendations: data.recommendations,
        showDetails: true
      });

    } catch (err) {
      setError(`Failed to generate career guidance: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (name, value, onChange, placeholder, required = true) => (
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="form-input"
    />
  );

  const renderHSCQuestions = () => (
    <div className="form-group">
      <div className="form-field">
        <label>Stream:<span className="required">*</span></label>
        <select
          value={stream}
          onChange={handleStreamChange}
          required
          className="form-select"
        >
          <option value="">Select your stream</option>
          <option value="science">Science</option>
          <option value="commerce">Commerce</option>
          <option value="arts">Arts</option>
        </select>
      </div>

      {stream === 'science' && (
        <div className="form-field">
          <label>Science Stream:<span className="required">*</span></label>
          <select
            name="scienceStream"
            value={formData.scienceStream || ''}
            onChange={handleInputChange}
            required
            className="form-select"
          >
            <option value="">Select your specialization</option>
            <option value="pcm">PCM (Physics, Chemistry, Mathematics)</option>
            <option value="pcb">PCB (Physics, Chemistry, Biology)</option>
            <option value="pcmb">PCMB (Physics, Chemistry, Math, Biology)</option>
          </select>
        </div>
      )}

      <div className="form-field">
        <label>Interest Field:<span className="required">*</span></label>
        {renderInputField(
          'interestField',
          formData.interestField || '',
          handleInputChange,
          'Enter your field of interest'
        )}
      </div>

      <div className="form-field">
        <label>Academic Performance:</label>
        <select
          name="academicPerformance"
          value={formData.academicPerformance || ''}
          onChange={handleInputChange}
          className="form-select"
        >
          <option value="">Select your performance level</option>
          <option value="excellent">Excellent (Above 90%)</option>
          <option value="good">Good (70-90%)</option>
          <option value="average">Average (50-70%)</option>
          <option value="below_average">Below Average (Below 50%)</option>
        </select>
      </div>

      <div className="form-field">
        <label>Extracurricular Activities:</label>
        {renderInputField(
          'extracurricular',
          formData.extracurricular || '',
          handleInputChange,
          'Enter your extracurricular activities',
          false
        )}
      </div>

      <div className="form-field">
        <label>Career Aspirations:<span className="required">*</span></label>
        {renderInputField(
          'careerAspiration',
          formData.careerAspiration || '',
          handleInputChange,
          'Enter your career aspirations'
        )}
      </div>
    </div>
  );

  const renderOtherQuestions = () => (
    <div className="form-group">
      <div className="form-field">
        <label>Specialization:<span className="required">*</span></label>
        {renderInputField(
          'specialization',
          formData.specialization || '',
          handleInputChange,
          'Enter your specialization (e.g., Computer Science, Finance)'
        )}
      </div>

      <div className="form-field">
        <label>Skills:<span className="required">*</span></label>
        <textarea
          name="skills"
          value={formData.skills || ''}
          onChange={handleInputChange}
          placeholder="List your technical and soft skills (comma separated)"
          required
          className="form-textarea"
        />
      </div>

      <div className="form-field">
        <label>Experience:</label>
        <textarea
          name="experience"
          value={formData.experience || ''}
          onChange={handleInputChange}
          placeholder="Describe your work experience (if any)"
          className="form-textarea"
        />
      </div>

      <div className="form-field">
        <label>Career Interests:<span className="required">*</span></label>
        <textarea
          name="careerInterest"
          value={formData.careerInterest || ''}
          onChange={handleInputChange}
          placeholder="What are your career interests and goals?"
          required
          className="form-textarea"
        />
      </div>
    </div>
  );

  // Add a new component for additional questions
  const AdditionalQuestions = ({ onSubmit }) => {
    const [additionalData, setAdditionalData] = useState({
      academicPerformance: '',
      subjects: '',
      hobbies: '',
      careerGoals: ''
    });

    const handleChange = (e) => {
      setAdditionalData({
        ...additionalData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(additionalData);
    };

    return (
      <div className="additional-questions">
        <h3>Additional Information</h3>
        <p>Please provide some more details to help us guide you better.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Academic Performance:<span className="required">*</span></label>
            <select
              name="academicPerformance"
              value={additionalData.academicPerformance}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select your performance level</option>
              <option value="excellent">Excellent (Above 90%)</option>
              <option value="good">Good (70-90%)</option>
              <option value="average">Average (50-70%)</option>
              <option value="below_average">Below Average (Below 50%)</option>
            </select>
          </div>

          <div className="form-field">
            <label>Favorite Subjects:<span className="required">*</span></label>
            <input
              type="text"
              name="subjects"
              value={additionalData.subjects}
              onChange={handleChange}
              placeholder="Enter your favorite subjects"
              required
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label>Hobbies & Interests:</label>
            <textarea
              name="hobbies"
              value={additionalData.hobbies}
              onChange={handleChange}
              placeholder="Describe your hobbies and interests"
              className="form-textarea"
            />
          </div>

          <div className="form-field">
            <label>Career Goals:<span className="required">*</span></label>
            <textarea
              name="careerGoals"
              value={additionalData.careerGoals}
              onChange={handleChange}
              placeholder="What are your career goals?"
              required
              className="form-textarea"
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit Additional Information
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="cp-container">
      <div className="header-container1">
        <h1>Career Map</h1>
        <p>Get personalized career guidance based on your education level and interests.</p>
      </div>
      <div className="cp-content">
        <div className="cp-form">
          <div className="form-field">
            <label>Education Level:<span className="required">*</span></label>
            <select
              value={education}
              onChange={handleEducationChange}
              required
              className="form-select"
            >
              <option value="">Select your education level</option>
              <option value="ssc">SSC/10th</option>
              <option value="hsc">HSC/12th</option>
              <option value="other">Graduate/Post-Graduate</option>
            </select>
          </div>

          {education === 'ssc' && (
            <AssessmentCard 
              questions={sscQuestions} 
              onSubmit={handleAssessmentSubmit}
            />
          )}
          {education === 'hsc' && (
            <form onSubmit={handleSubmit}>
              {renderHSCQuestions()}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Get Career Guidance'}
              </button>
            </form>
          )}
          {education === 'other' && (
            <form onSubmit={handleSubmit}>
              {renderOtherQuestions()}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Get Career Guidance'}
              </button>
            </form>
          )}

          {loading && <div className="loading">Processing your request...</div>}
          {error && <div className="error">{error}</div>}
          {result && (
            <CareerGuidanceReport 
              recommendations={result.recommendations}
              education={education}
              specialisation={formData.specialization || 'Not specified'}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerPath;