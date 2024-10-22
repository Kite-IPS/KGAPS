import React, { useState } from 'react';
import './Faculty.css'; 

function Faculty() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="faculty-container">
   
      <div className={`faculty-sidebar ${isSidebarOpen ? 'open' : ''}`}>
       
        <button className="toggle-button" onClick={toggleSidebar}>
          {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        </button>

        {isSidebarOpen && (
          <div className="sidebar-content">
            <h3>KG-APS</h3>
            <ul>
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#profile">Table</a></li>
              <li><a href="#logout">Logout</a></li>
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}

export default Faculty;