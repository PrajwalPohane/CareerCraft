import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

// Import your images here
const slideImages = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
  'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=600',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600'
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

  // Slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % slideImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Hardcoded credentials
  const validEmail = 'admin@example.com';
  const validPassword = 'password123';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === validEmail && password === validPassword) {
      // Store login state in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  // Add logout function that can be exported
  const logout = () => {
    localStorage.setItem('isLoggedIn', 'false');
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="slideshow-container">
        {slideImages.map((img, index) => (
          <div
            key={index}
            className={`slide ${index === currentImage ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          >
            <div className="slide-overlay"></div>
          </div>
        ))}
      </div>
      <div className="login-box">
        <h2>Welcome to CareerCraft</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export const handleLogout = () => {
  localStorage.setItem('isLoggedIn', 'false');
  window.location.href = '/login';
};

export default Login;
