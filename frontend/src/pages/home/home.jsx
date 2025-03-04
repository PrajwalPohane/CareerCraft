import React from 'react';
import './home.css';
import Card from './Card';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to CareerCraft</h1>
      <p>
        Discover opportunities that match your skills and aspirations.<br />
        Browse through curated tech positions from leading companies.
      </p>
      <h1>Why Choose Us</h1>
      <div className="card-container">
        <Card title="Career Path Planning" description="AI-driven personalized career roadmaps, skills gap analysis and development suggestions." />
        <Card title="AI ChatBot & Resume Analysis" description="Resume optimization with industry-specific suggestions along with mock assessment test on the skills." />
        <Card title="Job Search " description="Job recommendations based on skills and preferences. Easy Job search options." />
      </div>
    </div>
  );
};

export default Home;