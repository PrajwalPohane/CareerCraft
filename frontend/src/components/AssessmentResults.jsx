import React from 'react';
import './AssessmentResults.css';
import { FiDownload } from 'react-icons/fi';
import { jsPDF } from 'jspdf';

const AssessmentResults = ({ feedback, jobPosition, resumeData }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;
    const lineHeight = 10;

    const addText = (text, fontSize = 12, isBold = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFont(undefined, 'normal');
      }
      
      // Check if we need a new page
      if (yPos > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }

      doc.text(text, margin, yPos);
      yPos += lineHeight;
    };

    const addWrappedText = (text, fontSize = 12) => {
      const maxWidth = pageWidth - (margin * 2);
      const splitText = doc.splitTextToSize(text, maxWidth);
      
      splitText.forEach(line => {
        if (yPos > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.setFontSize(fontSize);
        doc.text(line, margin, yPos);
        yPos += lineHeight;
      });
      yPos += lineHeight/2; // Add some spacing
    };

    // Title
    addText('Technical Assessment Report', 24, true);
    yPos += lineHeight;

    // Basic Info
    addText(`Position: ${jobPosition}`, 14);
    addText(`Date: ${new Date().toLocaleDateString()}`, 14);
    yPos += lineHeight;

    // Score
    addText('Overall Performance', 16, true);
    addText(`Score: ${feedback.overall_score} (${feedback.score_percentage})`);
    yPos += lineHeight;

    // Strengths
    addText('Strengths', 16, true);
    feedback.strengths.forEach(strength => {
      addWrappedText(`• ${strength}`);
    });
    yPos += lineHeight;

    // Areas for Improvement
    addText('Areas for Improvement', 16, true);
    feedback.areas_for_improvement.forEach(area => {
      addWrappedText(`• ${area}`);
    });
    yPos += lineHeight;

    // Learning Resources
    addText('Recommended Learning Resources', 16, true);
    feedback.learning_resources.forEach(resource => {
      addText(`${resource.topic}:`, 12, true);
      resource.resources.forEach(item => {
        addWrappedText(`• ${item}`);
      });
      yPos += lineHeight/2;
    });

    // Career Paths
    addText('Suggested Career Paths', 16, true);
    feedback.career_path_suggestions.forEach(path => {
      addText(path.role, 12, true);
      addWrappedText(path.description);
      addWrappedText(`Required Skills: ${path.required_skills.join(', ')}`);
      yPos += lineHeight;
    });

    // Detailed Feedback
    addText('Detailed Feedback', 16, true);
    addWrappedText(feedback.detailed_feedback);

    // Save the PDF
    const fileName = `${jobPosition.replace(/\s+/g, '_')}_Assessment_Report.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="assessment-results">
      <div className="results-header">
        <h2>Technical Assessment Results</h2>
        <button onClick={generatePDF} className="download-btn">
          <FiDownload /> Download Report
        </button>
      </div>

      <div className="score-section">
        <h3>Overall Score</h3>
        <div className="score">
          <span className="score-number">{feedback.overall_score}</span>
          <span className="score-percentage">{feedback.score_percentage}</span>
        </div>
      </div>

      <div className="strengths-section">
        <h3>Strengths Demonstrated</h3>
        <ul>
          {feedback.strengths.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="improvement-section">
        <h3>Areas for Improvement</h3>
        <ul>
          {feedback.areas_for_improvement.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      <div className="resources-section">
        <h3>Recommended Learning Resources</h3>
        {feedback.learning_resources.map((resource, index) => (
          <div key={index} className="resource-group">
            <h4>{resource.topic}</h4>
            <ul>
              {resource.resources.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="career-paths-section">
        <h3>Suggested Career Paths</h3>
        {feedback.career_path_suggestions.map((path, index) => (
          <div key={index} className="career-path">
            <h4>{path.role}</h4>
            <p>{path.description}</p>
            <div className="required-skills">
              {path.required_skills.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="detailed-feedback">
        <h3>Detailed Feedback</h3>
        <p>{feedback.detailed_feedback}</p>
      </div>
    </div>
  );
};

export default AssessmentResults; 