import React, { useState, useEffect } from 'react';
import './HandlingSidebar.css';

function HandlingSidebar() {
  const data = JSON.parse(sessionStorage.getItem('userData'));

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const [facultyDetails, setFacultyDetails] = useState(data);

  return (
    <div className="handling-sidebar-container">
      <div className={`handling-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="handling-sidebar-toggle-button" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        </button>
        {isSidebarOpen && (
          <div className="handling-sidebar-content">
            <h3>KG-APS</h3>
            <ul>
              <li><a href="/handlingsidebar">Dashboard</a></li>
              <li><a href="#profile">Table</a></li>
              <li><a href="#logout">Logout</a></li>
            </ul>
            <div className="handling-sidebar-info" onClick={() => setIsDropupOpen(!isDropupOpen)}>
              <div className="handling-sidebar-name">{facultyDetails.name}</div>
              {isDropupOpen && (
                <div className="handling-sidebar-dropup-content">
                  <img src="faculty-image-url.jpg" alt="Faculty" className="handling-sidebar-image" />
                  <p><strong>Role:</strong> {facultyDetails.role}</p>
                  <p><strong>Name:</strong> {facultyDetails.name}</p>
                  <p><strong>Department:</strong> {facultyDetails.department}</p>
                  <p><strong>ID:</strong> {facultyDetails.id}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HandlingSidebar;