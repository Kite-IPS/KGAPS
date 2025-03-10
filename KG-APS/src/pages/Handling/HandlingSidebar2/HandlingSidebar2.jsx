import React, { useState } from 'react';
import './HandlingSidebar2.css';
import { useLocation } from 'react-router-dom';

function HandlingSidebar2() {
  const temp = useLocation().pathname.split('/')[1];
  const data = JSON.parse(sessionStorage.getItem('userData'));
  const facultyDetails = data;

  function role(role) {
    switch (role) {
      case 2:
        return 'Course Coordinator';
      case 3:
        return 'Department Mentor';
      case 4:
        return 'HOD';
      case 5:
        return 'Supervisor';
      default:
        return 'Faculty';
    }
  }

  function department(department) {
    switch (department) {
      case 1:
        return 'CSE';
      case 2:
        return 'ECE';
      case 3:
        return 'AI&DS';
      case 4:
        return 'IT';
      case 5:
        return 'CSBS';
      case 6:
        return 'MECH';
      default:
        return 'Dept not added yet';
    }
  }

  const roleMapping = {
    1: 'faculty',
    2: 'course-coordinator',
    3: 'domain-mentor',
    4: 'hod',
    5: 'supervisor'
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropupOpen, setIsDropupOpen] = useState(false);

  return (
      <div className={`handling-sidebar-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className={`handling-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button
          className="handling-sidebar-toggle-button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? '<' : '☰'}
        </button>
        {isSidebarOpen && (
          <div className="handling-sidebar-content">
            <h3>KG-APS</h3>
            <ul>
              <li>
                <a href={`/${temp}/${roleMapping[facultyDetails.role_id]}/dashboard`}>Dashboard</a>
              </li>
              <li>
                <a href={`/${temp}/${roleMapping[facultyDetails.role_id]}/table`}>Table</a>
              </li>
              <li>
                <a href="/">Logout</a>
              </li>
            </ul>
            <div className="handling-sidebar-info" onClick={() => setIsDropupOpen(!isDropupOpen)}>
              <div className="handling-sidebar-name">{facultyDetails.name}</div>
              {isDropupOpen && (
                <div className="handling-sidebar-dropup-content">
                  <img
                    src="faculty-image-url.jpg"
                    alt="Faculty"
                    className="handling-sidebar-image"
                  />
                  <p>
                    <strong>Role:</strong> {role(facultyDetails.role_id)}
                  </p>
                  <p>
                    <strong>Name:</strong> {facultyDetails.name}
                  </p>
                  <p>
                    <strong>Department:</strong> {department(facultyDetails.department_id)}
                  </p>
                  <p>
                    <strong>ID:</strong> {facultyDetails.uid}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
  );
}

export default HandlingSidebar2;