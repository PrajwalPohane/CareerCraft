import React from 'react';
import './CareerGuidanceReport.css';
import { FiDownload } from 'react-icons/fi';
import { jsPDF } from 'jspdf';

// Import career-related icons with more reliable URLs
const careerIcons = {
  education: "https://cdn-icons-png.flaticon.com/512/3976/3976631.png",
  skills: "https://cdn-icons-png.flaticon.com/512/3095/3095221.png",
  career: "https://cdn-icons-png.flaticon.com/512/4233/4233839.png",
  certification: "https://cdn-icons-png.flaticon.com/512/1378/1378644.png",
  experience: "https://cdn-icons-png.flaticon.com/512/1063/1063786.png",
  networking: "https://cdn-icons-png.flaticon.com/512/1256/1256650.png",
  leadership: "https://cdn-icons-png.flaticon.com/512/4861/4861446.png",
  innovation: "https://cdn-icons-png.flaticon.com/512/1995/1995515.png"
};

// Add a fallback icon in case the main icon fails to load
const fallbackIcon = "https://cdn-icons-png.flaticon.com/512/1548/1548784.png";

// Update the getRecommendationIcon function to include error handling
const getRecommendationIcon = (title) => {
  const titleLower = title.toLowerCase();
  let iconUrl = careerIcons.innovation; // Default to innovation icon

  if (titleLower.includes('education')) iconUrl = careerIcons.education;
  else if (titleLower.includes('skill')) iconUrl = careerIcons.skills;
  else if (titleLower.includes('career')) iconUrl = careerIcons.career;
  else if (titleLower.includes('certification')) iconUrl = careerIcons.certification;
  else if (titleLower.includes('experience')) iconUrl = careerIcons.experience;
  else if (titleLower.includes('network')) iconUrl = careerIcons.networking;
  else if (titleLower.includes('lead')) iconUrl = careerIcons.leadership;

  return iconUrl;
};

const CareerGuidanceReport = ({ recommendations, education, specialisation }) => {
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

      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach(line => {
        if (yPos > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(line, margin, yPos);
        yPos += lineHeight;
      });
      yPos += 5;
    };

    // Add title
    addText('Career Guidance Report', 24, true);
    yPos += 10;

    // Add profile info
    addText(`Education Level: ${education}`, 14, true);
    addText(`Specialization: ${specialisation}`, 14, true);
    yPos += 10;

    // Add recommendations sections
    const sections = recommendations.split(/\d+\./);
    sections.forEach(section => {
      if (section.trim()) {
        const [title, ...content] = section.split('\n');
        addText(title.trim(), 16, true);
        addText(content.join('\n').trim());
        yPos += 10;
      }
    });

    doc.save('career-guidance-report.pdf');
  };

  // Add an error handler for images
  const handleImageError = (e) => {
    e.target.src = fallbackIcon;
  };

  return (
    <div className="guidance-report">
      <div className="report-header">
        <h2>Your Career Roadmap</h2>
        <button className="download-btn" onClick={generatePDF}>
          <FiDownload /> Download Roadmap
        </button>
      </div>

      <div className="profile-section">
        <h3>Profile Information</h3>
        <div className="profile-details">
          <div className="detail-item">
            <span className="label">Education Level:</span>
            <span className="value">{education}</span>
          </div>
          <div className="detail-item">
            <span className="label">Specialization:</span>
            <span className="value">{specialisation}</span>
          </div>
        </div>
      </div>

      <div className="recommendations-section">
        {recommendations.split(/\d+\./).map((section, index) => {
          if (!section.trim()) return null;
          const [title, ...content] = section.split('\n');
          return (
            <div key={index} className="timeline-connector">
              <div className="recommendation-block">
                <div className="recommendation-icon">
                  <img 
                    src={getRecommendationIcon(title)} 
                    alt={title.trim()}
                    title={title.trim()}
                    onError={handleImageError}
                    loading="lazy"
                  />
                </div>
                <div className="recommendation-content">
                  <h3>{title.trim()}</h3>
                  <div className="content">
                    {content.map((line, i) => (
                      <p key={i}>{line.trim()}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CareerGuidanceReport; 