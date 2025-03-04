import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { mentorsData } from '../../data/mentorsData';
import './mentors.css';

const Mentors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const filtered = mentorsData.filter(mentor =>
      mentor.name.toLowerCase().includes(query.toLowerCase()) ||
      mentor.expertise.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
    setHasSearched(true);
  };

  return (
    <div className="mentors-container">
      <div className="mentors-info">
        <h1>Find Your Career Mentor</h1>
        <p>
          Connect with experienced professionals who can guide you through your career journey. 
          Our mentors provide valuable insights, feedback, and personalized advice to help you 
          achieve your career goals.
        </p>
      </div>

      <div className="search-container">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search mentors by name or expertise..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mentors-grid">
        {hasSearched && searchResults.length === 0 && (
          <div className="no-results">
            <p>No mentors found matching your search criteria.</p>
          </div>
        )}
        
        {searchResults.map(mentor => (
          <div key={mentor.id} className="mentor-card">
            <img src={mentor.image} alt={mentor.name} className="mentor-image" />
            <div className="mentor-info">
              <h3>{mentor.name}</h3>
              <p className="expertise">{mentor.expertise}</p>
              <p className="experience">Experience: {mentor.experience}</p>
              <div className="mentor-footer">
                <span className="rating">★ {mentor.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mentors; 