import React, { useState } from 'react';
import './Domainsidebar.css'; 

function Domainsidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isDropupOpen, setIsDropupOpen] = useState(false); 

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

            {/* Faculty Name at the Bottom */}
            <div className="domain-sidebar-info" onClick={toggleDropup}>
              <div className="domain-sidebar-name">John Doe</div>
              {isDropupOpen && (
                <div className="domain-sidebar-dropup-content">
                  <img src="faculty-image-url.jpg" alt="Faculty" className="domain-sidebar-image" />
                  <p><strong>Role:</strong> Domainmentor</p>
                  <p><strong>Name:</strong> John Doe</p>
                  <p><strong>Department:</strong> Computer Science</p>
                  <p><strong>ID:</strong> 123456</p>
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