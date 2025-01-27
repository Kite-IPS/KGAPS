import React, { useState,useEffect } from 'react';
import './CCDashboard.css';
import axios from 'axios';
import HandlingSidebar from "../../HandlingSidebar/HandlingSidebar.jsx";

function HandlingCCDashboard() {
  const data = JSON.parse(sessionStorage.getItem('userData'));
  const [viewMode, setViewMode] = useState("topics");
  const [courseDataCurrent,setCourseDataCurrent] = useState([]);
  const [courseDataOverall,setCourseDataOverall] = useState([]); 
  const [assignmentData,setAssignmentData] = useState([]);
  const [course,setCourse] = useState(null);
  
  
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
  
  const value = (current,total) => {
    if (total===0 || current === 0 || current>total){
      return 100;
    }
    return (current/total)*100;
  } 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const course = await axios({
          url: "http://localhost:8000/api/coordinator_courses",
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          data: data,
        });
        console.log(course.data);
        setCourse(course.data);
        const res = await axios({
          url: "http://localhost:8000/api/course_progress",
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          data: course.data[0],
        });
        console.log(res.data);
        if(res){
          setCourseDataCurrent(res.data.course_data_current);
          setCourseDataOverall(res.data.course_data_overall);
          setAssignmentData(res.data.assignment_data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []); // Run only once when the component mounts

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
    
    console.log(aggrdata);
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
    return yearMap[class_id[1]]+" "+departmentMap[class_id[0]]+" "+sectionMap[class_id[2]];
  };
  
  const convertToClass1 = (item) => yearMap[item.toString()[1]];
  const convertToClass2 = (item) => departmentMap[item.toString()[0]];
  const convertToClass3 = (item) => sectionMap[item.toString()[2]];
  return (
    <>
    <HandlingSidebar />
    <div className="handlingfaculty-dashboard-container">
      <div className="handlingfaculty-dashboard-content">
        <div className="handlingfaculty-dashboard-nametext">
          <div className="handlingfaculty-dashboard-welcome-box">
            <p className="handlingfaculty-dashboard-greeting">Welcome Coordinator - {data.name}</p>
          </div>
          <button className="HFTbutton-1" onClick={() => setViewMode("topics")}>
          Topics
        </button>
        <button className="HFTbutton-2" onClick={() => setViewMode("assignments")}>
          Assignments
        </button>
        </div>
        {viewMode==="topics" && courseDataOverall.length>0 && courseDataCurrent.length>0?(
        <>  
        <h1>Course {courseDataOverall[0].course_code+" - "+courseDataOverall[0].course_name}</h1>
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
              <div className="handlingfaculty-dashboard-card-header"> Faculty {item.uid+" "+item.name}  {convertToClass(item.class_id)}</div>
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
        </div></>): viewMode==="topics" && (<h1>No progress!</h1>)}
        {
          viewMode === "assignments" && assignmentData.length > 0? (<>
          <div className="handlingfaculty-dashboard-card-container">
                {assignmentData.map((item, i) => (
                  <div className="handlingfaculty-dashboard-card" key={i}>
                    <div className="handlingfaculty-dashboard-card-header">
                      <span className="grid-item">{item.course_code}</span>
                      <span className="grid-item">{item.course_name}</span>
                      <span className="grid-item">{convertToClass1(item.class_id)}</span>
                      <span className="grid-item">{convertToClass2(item.class_id)}</span>
                      <span className="grid-item">{convertToClass3(item.class_id)}</span>
                    </div>
                    <div className="handlingfaculty-dashboard-card-content">
                      <p>Overall Progress for Assignment: {item.avg_progress}%</p>
                      <div className="handlingfaculty-dashboard-progressbar-horizontal">
                        <div style={{ width: `${item.avg_progress}%`, backgroundColor: 'green' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </>) : viewMode === "assignments" && (<h1>No assignments!</h1>)
        }
      </div>
    </div></>
  );
}

export default HandlingCCDashboard;