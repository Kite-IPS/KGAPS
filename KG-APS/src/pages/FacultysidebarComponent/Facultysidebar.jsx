import React, { useState } from 'react';
import './Facultysidebar.css'; 

function Facultysidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar open by default
  const [isDropupOpen, setIsDropupOpen] = useState(false); // Dropup state

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropup = () => {
    setIsDropupOpen(!isDropupOpen);
  };

  return (
    <div className="faculty-sidebar-container">
      <div className={`faculty-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="faculty-sidebar-toggle-button" onClick={toggleSidebar}>
          {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        </button>

        {isSidebarOpen && (
          <div className="faculty-sidebar-content">
            <h3>KG-APS</h3>
            <ul>
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#profile">Table</a></li>
              <li><a href="#logout">Logout</a></li>
            </ul>

            {/* Faculty Name at the Bottom */}
            <div className="faculty-sidebar-info" onClick={toggleDropup}>
              <div className="faculty-sidebar-name">John Doe</div>
              {isDropupOpen && (
                <div className="faculty-sidebar-dropup-content">
                  <img src="faculty-image-url.jpg" alt="Faculty" className="faculty-sidebar-image" />
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

export default Facultysidebar;
