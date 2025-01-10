import React, { useState,useEffect } from 'react';
import './SupervisorDashboard.css';
import axios from 'axios';
import HandlingSidebar from '../../HandlingSidebar/HandlingSidebar';

function HandlingSupervisorDashboard() {
  const value = (current,total) => {
    if (total===0 || current === 0 || current>total){
      return 100;
    }
    return (current/total)*100;
  }
  const data = JSON.parse(sessionStorage.getItem('userData'));

  const [facultyDetails,setFacultyDetails] = useState(data); 
  console.log(facultyDetails);
  // Course data
  const [courseDataCurrent,setCourseDataCurrent] = useState([
    { course_code: 'CSE101', completed_hours: 20, total_hours: 40, bar_color: 'blue' },
    { course_code: 'CSE102', completed_hours: 10, total_hours: 40, bar_color: 'red' },
  ]);

  const [courseDataOverall,setCourseDataOverall] = useState([
    { course_code: 'CSE101', count: 20, total_count: 40 },
    { course_code: 'CSE102', count: 10, total_count: 40 },
  ]);

  

  const renderColorComment = (barColor) => {
    switch (barColor) {
      case 'black':
        return <p>Not yet started</p>;
      case 'red':
        return <p>Delayed</p>;
      case 'green':
        return <p>Ahead of time</p>;
      case 'blue':
        return <p>On Time</p>;
      default:
        return null;
    }
  };
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios({
          url: "http://localhost:8000/api/faculty_progress",
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          data: data,
        });
        if(res){
          setCourseDataCurrent(res.data.course_data_current);
          setCourseDataOverall(res.data.course_data_overall);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []); // Run only once when the component mounts

  return (
    <div className="handlingfaculty-dashboard-container">
      <>
      <HandlingSidebar></HandlingSidebar>
      <div className="handlingfaculty-dashboard-content">
        <div className="handlingfaculty-dashboard-nametext">
          <div className="handlingfaculty-dashboard-welcome-box">
            <p className="handlingfaculty-dashboard-greeting">Welcome hod - {facultyDetails.name}</p>
          </div>
        </div>
        <div className="handlingfaculty-dashboard-card-container">
          {courseDataCurrent.map((item, i) => (
            <div className="handlingfaculty-dashboard-card" key={i}>
              <div className="handlingfaculty-dashboard-card-header">Course {courseDataOverall[i].course_code}</div>
              <div className="handlingfaculty-dashboard-card-content">
                <p>Hours Completed: {item.completed_hours} / {item.total_hours}</p>
                <div className="handlingfaculty-dashboard-progressbar-horizontal">
                  <div style={{ width: `${value(item.completed_hours,item.total_hours)}%`, backgroundColor: item.bar_color }} />
                </div>
                {/* Color comment section */}
                <div className="handlingfaculty-dashboard-colorcomment">
                  {renderColorComment(item.bar_color)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
    </div>
  );
}

export default HandlingSupervisorDashboard;
