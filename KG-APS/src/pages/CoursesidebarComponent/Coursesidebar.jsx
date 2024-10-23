import React, { useState } from 'react';
import './Coursesidebar.css'; 

function Coursesidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isDropupOpen, setIsDropupOpen] = useState(false); 

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropup = () => {
    setIsDropupOpen(!isDropupOpen);
  };

  return (
    <div className="course-sidebar-container">
      <div className={`course-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="course-sidebar-toggle-button" onClick={toggleSidebar}>
          {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        </button>

        {isSidebarOpen && (
          <div className="course-sidebar-content">
            <h3>KG-APS</h3>
            <ul>
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#profile">Table</a></li>
              <li><a href="#logout">Logout</a></li>
            </ul>

            {/* Faculty Name at the Bottom */}
            <div className="course-sidebar-info" onClick={toggleDropup}>
              <div className="course-sidebar-name">John Doe</div>
              {isDropupOpen && (
                <div className="course-sidebar-dropup-content">
                  <img src="faculty-image-url.jpg" alt="Faculty" className="course-sidebar-image" />
                  <p><strong>Role:</strong> CourseCoordinator</p>
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

export default Coursesidebar;