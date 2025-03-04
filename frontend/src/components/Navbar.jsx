import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AiTwotoneHome } from 'react-icons/ai';
import { PiPath } from "react-icons/pi";
import { HiMiniBriefcase } from 'react-icons/hi2';
import { SiCoursera } from 'react-icons/si';
import { CgProfile } from 'react-icons/cg';
import { FaChalkboardTeacher } from 'react-icons/fa';
import './Navbar.css';


const Navbar = () => {
  const [active, setActive] = useState('/');

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={() => setActive('/')}>
          CareerCraft
        </Link>
      </div>
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link
            to="/"
            className={active === '/' ? 'active' : ''}
            onClick={() => setActive('/')}
          >
            <AiTwotoneHome /> Home
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/career"
            className={active === '/career' ? 'active' : ''}
            onClick={() => setActive('/career')}
          >
            <PiPath /> Career Map
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/job"
            className={active === '/job' ? 'active' : ''}
            onClick={() => setActive('/job')}
          >
            <HiMiniBriefcase /> Job
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/mentors"
            className={active === '/mentors' ? 'active' : ''}
            onClick={() => setActive('/mentors')}
          >
            <FaChalkboardTeacher /> Mentors
          </Link>
        </li>
        
      </ul>
      <div className="navbar-profile">
        <Link to="/profile">
          <CgProfile />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;