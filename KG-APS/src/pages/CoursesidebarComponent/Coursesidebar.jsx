import React, { useState, useEffect } from 'react';
import './Coursesidebar.css';

function Coursesidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const [coordinatorDetails, setCoordinatorDetails] = useState({
    name: '',
    role: '',
    department: '',
    id: ''
  });

  useEffect(() => {
    setTimeout(() => {
      const fetchedData = {
        name: 'Adithya',
        role: 'CourseCoordinator',
        department: 'Computer Science',
        id: '123456'
      };
      setCoordinatorDetails(fetchedData);
    }, 0);
  }, []);

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
            <div className="course-sidebar-info" onClick={toggleDropup}>
              <div className="course-sidebar-name">{coordinatorDetails.name}</div>
              {isDropupOpen && (
                <div className="course-sidebar-dropup-content">
                  <img src="faculty-image-url.jpg" alt="Course Coordinator" className="course-sidebar-image" />
                  <p><strong>Role:</strong> {coordinatorDetails.role}</p>
                  <p><strong>Name:</strong> {coordinatorDetails.name}</p>
                  <p><strong>Department:</strong> {coordinatorDetails.department}</p>
                  <p><strong>ID:</strong> {coordinatorDetails.id}</p>
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
