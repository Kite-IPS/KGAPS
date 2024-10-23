import React, { useState, useEffect } from 'react';
import './Facultysidebar.css';

function Facultysidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropupOpen, setIsDropupOpen] = useState(false);

  const [facultyDetails, setFacultyDetails] = useState({
    name: '',
    role: '',
    department: '',
    id: '',
  });

  const courseDataCurrent = [
    { course_code: 'CSE101', completed_hours: 20, total_hours: 40, bar_color: 'blue' },
    { course_code: 'CSE102', completed_hours: 10, total_hours: 40, bar_color: 'red' },
    { course_code: 'CSE103', completed_hours: 30, total_hours: 40, bar_color: 'green' },
  ];

  const courseDataOverall = [
    { course_code: 'CSE101', count: 20, total_count: 40 },
    { course_code: 'CSE102', count: 10, total_count: 40 },
    { course_code: 'CSE103', count: 30, total_count: 40 },
  ];

  useEffect(() => {
    setTimeout(() => {
      const fetchedData = {
        name: 'Nishanth',
        role: 'Faculty',
        department: 'Computer Science',
        id: '123456',
      };
      setFacultyDetails(fetchedData);
    }, 0);
  }, []);

  return (
    <div className="faculty-sidebar-container">
      <div className={`faculty-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="faculty-sidebar-toggle-button" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
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
            <div className="faculty-sidebar-info" onClick={() => setIsDropupOpen(!isDropupOpen)}>
              <div className="faculty-sidebar-name">{facultyDetails.name}</div>
              {isDropupOpen && (
                <div className="faculty-sidebar-dropup-content">
                  <img src="faculty-image-url.jpg" alt="Faculty" className="faculty-sidebar-image" />
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

      <div className={`faculty-sidebar-right-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="faculty-sidebar-nametext">
          <div className="faculty-sidebar-welcome-box">
            <p className="faculty-sidebar-greeting">Welcome Faculty - {facultyDetails.name}</p>
          </div>
        </div>
        <div className="faculty-sidebar-card-container">
          {courseDataCurrent.map((item, i) => (
            <div className="faculty-sidebar-card" key={i}>
              <div className="faculty-sidebar-card-header">Course {courseDataOverall[i].course_code}</div>
              <div className="faculty-sidebar-card-content">
                <p>Hours Completed: {item.completed_hours} / {item.total_hours}</p>
                <div className="faculty-sidebar-progressbar-horizontal">
                  <div style={{ width: `${(item.completed_hours / item.total_hours) * 100}%`, backgroundColor: item.bar_color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Facultysidebar;
