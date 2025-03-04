import React, { createContext, useState, useContext } from 'react';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [savedJobs, setSavedJobs] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('savedJobs');
    return saved ? JSON.parse(saved) : [];
  });

  const updateJobs = (jobs) => {
    setSavedJobs(jobs);
    localStorage.setItem('savedJobs', JSON.stringify(jobs));
  };

  return (
    <JobContext.Provider value={{ savedJobs, updateJobs }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => useContext(JobContext); 