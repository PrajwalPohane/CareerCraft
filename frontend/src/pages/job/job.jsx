import React, { useState } from 'react';
import JobCard from './JobCard';
import { IoSearch } from 'react-icons/io5';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useJobs } from '../../context/JobContext';
import './job.css';

const Job = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { savedJobs, updateJobs } = useJobs();

  const searchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/search_jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position: searchQuery,
          country: 'IN',
          location: locationQuery,
          maxItems: 6
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      updateJobs(data); // Save to context and localStorage
    } catch (err) {
      setError('Error fetching jobs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchJobs();
  };

  return (
    <div className="job-container">
      <div className="header-container">
        <h1>Job Listings</h1>
        <form onSubmit={handleSearch} className="search-container">
          <div className="search-fields">
            <div className="search-field">
              <IoSearch className="search-icon" />
              <input
                type="text"
                placeholder="Job Title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                required
              />
            </div>
            <div className="search-field">
              <FaMapMarkerAlt className="search-icon" />
              <input
                type="text"
                placeholder="Location (optional)..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <button type="submit" className="search-button">
            Search Jobs
          </button>
        </form>
      </div>
      
      <div className="job-list-container">
        {loading && <div className="loading">Loading jobs...</div>}
        {error && <div className="error">{error}</div>}
        <div className="job-list">
          {savedJobs.map((job, index) => (
            <JobCard key={index} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Job;