import React, { useState, useEffect } from 'react';
import './Domainsidebar.css';

function Domainsidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropupOpen, setIsDropupOpen] = useState(false);

  const [mentorDetails, setMentorDetails] = useState({
    name: '',
    role: '',
    department: '',
    id: ''
  });

  useEffect(() => {
    setTimeout(() => {
      const fetchedData = {
        name: 'Marudhu',
        role: 'Domainmentor',
        department: 'Computer Science',
        id: '123456'
      };
      setMentorDetails(fetchedData);
    }, 0);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropup = () => {
    setIsDropupOpen(!isDropupOpen);
  };

  return (
    <div className="domain-sidebar-container">
      <div className={`domain-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="domain-sidebar-toggle-button" onClick={toggleSidebar}>
          {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        </button>

        {isSidebarOpen && (
          <div className="domain-sidebar-content">
            <h3>KG-APS</h3>
            <ul>
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#profile">Table</a></li>
              <li><a href="#logout">Logout</a></li>
            </ul>

            <div className="domain-sidebar-info" onClick={toggleDropup}>
              <div className="domain-sidebar-name">{mentorDetails.name}</div>
              {isDropupOpen && (
                <div className="domain-sidebar-dropup-content">
                  <img src="faculty-image-url.jpg" alt="Domainmentor" className="domain-sidebar-image" />
                  <p><strong>Role:</strong> {mentorDetails.role}</p>
                  <p><strong>Name:</strong> {mentorDetails.name}</p>
                  <p><strong>Department:</strong> {mentorDetails.department}</p>
                  <p><strong>ID:</strong> {mentorDetails.id}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Domainsidebar;
