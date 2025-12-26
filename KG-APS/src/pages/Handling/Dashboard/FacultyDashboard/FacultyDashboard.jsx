import React, { useState, useEffect } from 'react';
import './FacultyDashboard.css';
import api from '@/apiConfig';
import HandlingSidebar from "../../HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from '../../HandlingSidebar2/HandlingSidebar2.jsx';

function HandlingFacultyDashboard() {
  const data = JSON.parse(sessionStorage.getItem('userData'));
  const [facultyDetails, setFacultyDetails] = useState(data); 
  const [courseDataCurrent, setCourseDataCurrent] = useState([]);
  const [assignmentData,setAssignmentData] = useState([]);
  const [resultsData,setResultsData] = useState([]);
  const [courseDataOverall, setCourseDataOverall] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("topics");

  const value = (current, total) => {
    if (total === 0 || current === 0 || current > total) {
      return 100;
    }
    return (current / total) * 100;
  };

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

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
  
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.post("/api/faculty_progress", data, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (res) {
          setCourseDataCurrent(res.data.course_data_current);
          setCourseDataOverall(res.data.course_data_overall);
          setAssignmentData(res.data.assignment_data);
          setResultsData(res.data.results_data);
        }
      }catch (error) {
        console.error('Error fetching data:', error);
      } finally{
        setLoading(false);
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

  const convertToClass1 = (item) => yearMap[item.toString()[1]];
  const convertToClass2 = (item) => departmentMap[item.toString()[0]];
  const convertToClass3 = (item) => sectionMap[item.toString()[2]];

  return (
    <>
      {windowWidth > 1500 ? <HandlingSidebar /> : <HandlingSidebar2 />} 
      <div className="handlingfaculty-dashboard-container">
        <div className="handlingfaculty-dashboard-content">
        <div className="handlingfaculty-dashboard-nametext" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '20px' }}>
            <button className={`HFTbutton-1 ${viewMode === "topics" ? "selected" : ""}`} onClick={() => setViewMode("topics")}>
              Topics
            </button>
            <button className={`HFTbutton-2 ${viewMode === "assignments" ? "selected" : ""}`} onClick={() => setViewMode("assignments")}>
              Assessments
            </button>
            <button className={`HFTbutton-2 ${viewMode === "results" ? "selected" : ""}`} onClick={() => setViewMode("results")}>
              Results
            </button>
          </div>
          {loading ? (
            <h1>Loading...</h1>
          ) : error && (
            <h1>{error}</h1>
          ) }{viewMode === "topics" && courseDataOverall.length > 0 ? (
            <>
              <div className="handlingfaculty-dashboard-aggregate">
                <p>Aggregate Progress</p>
                <div className="handlingfaculty-dashboard-aggregate-content">
                  <p>Overall Progress: {(aggregateData()[0].topic_count * 100).toFixed(0)}%</p>
                  <div className="handlingfaculty-dashboard-progressbar-horizontal">
                    <div style={{ width: `${(aggregateData()[0].topic_count * 100).toFixed(2)}%`, backgroundColor: 'purple' }} />
                  </div>
                  <p>Average Status: {aggregateData()[0].comment}</p>
                </div>
              </div>
              <br />
              <div className="handlingfaculty-dashboard-card-container">
                {courseDataCurrent.map((item, i) => (
                  <div className="handlingfaculty-dashboard-card" key={i}>
                    <div className="handlingfaculty-dashboard-card-header">
                      <span className="grid-item">{item.course_code}</span>
                      <span className="grid-item">{item.course_name}</span>
                      <span className="grid-item">{convertToClass1(item.class_id)}</span>
                      <span className="grid-item">{convertToClass2(item.class_id)}</span>
                      <span className="grid-item">{convertToClass3(item.class_id)}</span>
                    </div>
                    <div className="handlingfaculty-dashboard-card-content">
                      <p>Hours Completed: {item.completed_hours} / {item.total_hours}</p>
                      <div className="handlingfaculty-dashboard-progressbar-horizontal">
                        <div style={{ width: `${value(item.completed_hours, item.total_hours).toFixed(2)}%`, backgroundColor: item.bar_color }} />
                      </div>
                      <p>Topics Completed: {courseDataOverall[i].count}/{courseDataOverall[i].total_count}</p>
                      <div className="handlingfaculty-dashboard-progressbar-horizontal">
                        <div style={{ width: `${((courseDataOverall[i].count / courseDataOverall[i].total_count) * 100).toFixed(2)}%`, backgroundColor: 'green' }} />
                      </div>
                      <div className="handlingfaculty-dashboard-colorcomment">
                        {renderColorComment(item.bar_color)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : viewMode === "topics" && (
            <h1>No progress!</h1>
          )}
          {viewMode === "assignments" && assignmentData.length > 0 ? ( <>
            <h1>Assessment data</h1>
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
          </>
          ): viewMode==="assignments" && (<h1>No progress!</h1>)}
           {viewMode === "results" && resultsData.length > 0 ? ( <>
            <h1>Result data</h1>
            <div className="handlingfaculty-dashboard-card-container">
                {resultsData.map((item, i) => (
                  <div className="handlingfaculty-dashboard-card" key={i}>
                    <div className="handlingfaculty-dashboard-card-header">
                      <span className="grid-item">{item.course_code}</span>
                      <span className="grid-item">{item.course_name}</span>
                      <span className="grid-item">{convertToClass1(item.class_id)}</span>
                      <span className="grid-item">{convertToClass2(item.class_id)}</span>
                      <span className="grid-item">{convertToClass3(item.class_id)}</span>
                    </div>
                    <div className="handlingfaculty-dashboard-card-content">
                      <p>Average pass percentage: {item.avg_pass_percentage}%</p>
                      <div className="handlingfaculty-dashboard-progressbar-horizontal">
                        <div style={{ width: `${item.avg_pass_percentage}%`, backgroundColor: 'green' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </>
          ): viewMode==="results" && (<h1>No progress!</h1>)}
        </div>
      </div>
    </>
  );
}

export default HandlingFacultyDashboard;
