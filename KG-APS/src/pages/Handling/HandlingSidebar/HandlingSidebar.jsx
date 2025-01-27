import React, { useState } from 'react';
import './HandlingSidebar.css';
import { useLocation } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

function HandlingSidebar() {
  const location = useLocation();
  const temp = location.pathname.split('/')[1];

  const facultyDetails = JSON.parse(sessionStorage.getItem('userData'));

  const roleMapping = {
    1: 'Faculty',
    2: 'Course Coordinator',
    3: 'Domain mentor',
    4: 'HOD',
    5: 'Supervisor',
  };

  const departmentMapping = {
    1: 'CSE',
    2: 'ECE',
    3: 'AI&DS',
    4: 'IT',
    5: 'CSBS',
    6: 'MECH',
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname.includes(path);

  return (<>
    <div className="handling-navbar-container">
      <nav className="handling-navbar">
        <div className="handling-navbar-brand">KG-APS</div>
        <ul className="handling-navbar-links">
          <li>
            <a
              href={`/${temp}/${roleMapping[facultyDetails.role_id]?.toLowerCase().replace(' ', '-')}/dashboard`}
              className={`nav-button ${isActive('dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href={`/${temp}/${roleMapping[facultyDetails.role_id]?.toLowerCase().replace(' ', '-')}/table`}
              className={`nav-button ${isActive('table') ? 'active' : ''}`}
            >
              Table
            </a>
          </li>
        </ul>
        <div
          className="handling-navbar-info"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          role="button"
          aria-expanded={isDropdownOpen}
        >
          <FaUserCircle className="handling-navbar-icon" />
          {isDropdownOpen && (
            <div className="handling-navbar-dropdown">
              <div className="faculty-info">
                <img
                  src={facultyDetails.image_url || '/default-profile.png'}
                  alt="Faculty"
                  className="faculty-img"
                />
                <p>
                  <strong>Name:</strong> {facultyDetails.name || 'N/A'}
                </p>
                <p>
                  <strong>Department:</strong>{' '}
                  {departmentMapping[facultyDetails.department_id] || 'Not Assigned'}
                </p>
                <p>
                  <strong>Role:</strong> {roleMapping[facultyDetails.role_id] || 'N/A'}
                </p>
                <p>
                  <strong>ID:</strong> {facultyDetails.uid || 'N/A'}
                </p>
              </div>
              <div className="logout-container">
                <a href="/" aria-label="Logout">
                  <FaSignOutAlt /> Logout
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
    </>
  );
}

export default HandlingSidebar;