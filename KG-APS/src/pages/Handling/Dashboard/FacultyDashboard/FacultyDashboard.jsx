import React, { useState, useEffect } from 'react';
import './FacultyDashboard.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HandlingSidebar from "../../HandlingSidebar/HandlingSidebar.jsx";

function HandlingFacultyDashboard() {

  const value = (current, total) => {
    if (total === 0 || current === 0 || current > total) {
      return 100;
    }
    return (current / total) * 100;
  }

  const data = JSON.parse(sessionStorage.getItem('userData'));

  const [facultyDetails, setFacultyDetails] = useState(data); 
  const [courseDataCurrent, setCourseDataCurrent] = useState([]);

  const [courseDataOverall, setCourseDataOverall] = useState([]);

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
        if (res) {
          setCourseDataCurrent(res.data.course_data_current);
          setCourseDataOverall(res.data.course_data_overall);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  const aggregateData = () => {
    let aggrdata = [];
    var count = 0;
    var total_count = 0;
    var hours_count = 0;

    for(let i=0;i<courseDataOverall.length;i++){
      count += courseDataOverall[i].count;
      total_count += courseDataOverall[i].total_count;
      var temp = courseDataCurrent[i].completed_hours/courseDataCurrent[i].total_hours;
      if (temp>1){hours_count+=1;}
      else if (temp<1){hours_count-=1;}
    }
    var comment = "";
    var topic_count = count/total_count;
    if (hours_count<0){ comment = "Ahead of time";}
    else if (hours_count>0){ comment = "Lagging";}
    else if (hours_count===0){ comment = "On Time";}
    else { comment = "Not yet started";}

    aggrdata.push({ topic_count: topic_count, comment:comment });
    return aggrdata;
  }

  const departmentMap = {
    1: "CSE",
    2: "AI & DS",
    3: "ECE",
    4: "CSBS",
    5: "IT",
    6: "S&H",
    7: "MECH",
    8: "CYS",
    9: "AI & ML",
  };

  const yearMap = {
    1: "1st Year",
    2: "2nd Year",
    3: "3rd Year",
    4: "4th Year",
    };
  
  const sectionMap = {
    1: "A",
    2: "B"
  };

  const convertToClass = (item) => {
    const class_id = item.toString();
    return yearMap[class_id[1]]+" - "+departmentMap[class_id[0]]+" "+sectionMap[class_id[2]];
  };

  return (
    <>
      <HandlingSidebar />
      <div className="handlingfaculty-dashboard-container">
        <div className="handlingfaculty-dashboard-content">
          <div className="handlingfaculty-dashboard-nametext">
            <div className="handlingfaculty-dashboard-welcome-box">
              <p className="handlingfaculty-dashboard-greeting">Welcome Faculty - {facultyDetails.name}</p>
            </div>
          </div>
          {courseDataOverall.length>0?(
        <>  
        
        <div className="handlingfaculty-dashboard-aggregate">
          <p>Aggregate Progress</p>
          <div className="handlingfaculty-dashboard-aggregate-content">
          <p>Overall Progress: {(aggregateData()[0].topic_count*100).toFixed(0)}%</p>
          <div className="handlingfaculty-dashboard-progressbar-horizontal">
                  <div style={{ width: `${(aggregateData()[0].topic_count*100).toFixed(2)}%`, backgroundColor: 'purple' }} />
          </div>
            <p>Average Status: {(aggregateData()[0].comment)}</p>

          </div>
        </div>  
        <div className="handlingfaculty-dashboard-card-container">
          {courseDataCurrent.map((item, i) => (
            <div className="handlingfaculty-dashboard-card" key={i}>
              <div className="handlingfaculty-dashboard-card-header">Course: {courseDataCurrent[i].course_code+" - "+courseDataCurrent[i].course_name+" - "+convertToClass(courseDataCurrent[i].class_id)}</div>
              <div className="handlingfaculty-dashboard-card-content">
                <p>Hours Completed: {item.completed_hours} / {item.total_hours}</p>
                <div className="handlingfaculty-dashboard-progressbar-horizontal">
                  <div style={{ width: `${value(item.completed_hours,item.total_hours).toFixed(2)}%`, backgroundColor: item.bar_color }} />
                </div>
                <p>Topics Completed: {courseDataOverall[i].count}/{courseDataOverall[i].total_count}</p>
                <div className="handlingfaculty-dashboard-progressbar-horizontal">
                  <div style={{ width: `${((courseDataOverall[i].count/courseDataOverall[i].total_count)*100).toFixed(2)}%`, backgroundColor: 'green' }} />
                </div>
                <div className="handlingfaculty-dashboard-colorcomment">
                  {renderColorComment(item.bar_color)}
                </div>
              </div>
            </div>
          ))}
        </div></>):(<h1>No progress!</h1>)}
      </div>
    </div></>
  );
}

export default HandlingFacultyDashboard;
