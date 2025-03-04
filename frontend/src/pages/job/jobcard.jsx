import React from 'react';
import { FaBuilding, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';
import './jobcard.css';

const JobCard = ({ job }) => {
  return (
    <div className="card">
      <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
        <div className="card-content">
          <h3 className="job-title">{job.title}</h3>
          <div className="job-details">
            <div className="job-info">
              <FaBuilding className="icon" />
              <span>{job.company}</span>
            </div>
            <div className="job-info">
              <FaMapMarkerAlt className="icon" />
              <span>{job.location}</span>
            </div>
            <div className="job-info">
              <FaMoneyBillWave className="icon" />
              <span>{job.salary}</span>
            </div>
          </div>
          <div className="apply-now">Apply Now →</div>
        </div>
      </a>
    </div>
  );
};

export default JobCard;
