import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home/home';
import Job from './pages/job/job';
import CareerPath from './pages/cp/cp';
import ChatBot from './components/ChatBot';
import Login from './login';
import { JobProvider } from './context/JobContext';
import './App.css';
import Mentors from './pages/mentors/mentors';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const App = () => {
  useEffect(() => {
    localStorage.setItem('isLoggedIn', 'false');
    
    const handleBeforeUnload = () => {
      localStorage.setItem('isLoggedIn', 'false');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <JobProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <div className="container">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/career" element={<CareerPath />} />
                        <Route path="/job" element={<Job />} />
                        <Route path="/course" element={<Course />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/mentors" element={<Mentors />} />
                      </Routes>
                    </div>
                    <ChatBot />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </JobProvider>
  );
};

const Course = () => <div>Course Page</div>;
const Profile = () => <div>Profile Page</div>;

export default App;
