import React, { useState,useEffect } from 'react';
import './HODDashboard.css';
import axios from 'axios';
import HandlingSidebar from '../../HandlingSidebar/HandlingSidebar';


function HandlingHODDashboard() {
  const [courseDataCurrent,setCourseDataCurrent] = useState([]);
  const [courseDataOverall,setCourseDataOverall] = useState([]); 
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [DomainCourses, setDomainCourses] = useState([]);
  const [selectedCard, setSelectedCard] = useState(0);
  const value = (current,total) => {
    if (total===0 || current === 0 || current>total){
      return 100;
    }
    return (current/total)*100;
  } 


  useEffect(() => {
    const fetchData = async () => {
      try {
        const course = await axios.post(
          "http://localhost:8000/api/domain_courses",
          data,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setDomainCourses(course.data);
        if (course.data.length > 0) {
          setSelectedOption(course.data[0].courses[0]);
          await fetchChartData(course.data[0].courses[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const fetchChartData = async (selectedCourse) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/course_progress",
        selectedCourse,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(res.data);
      setCourseDataCurrent(res.data.course_data_current);
      setCourseDataOverall(res.data.course_data_overall);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const UpdateChart = async (option) => {
    console.log(option);
    await fetchChartData(option);
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
  const yearMap = {
    1: "Freshman (1st Year)",
    2: "Sophomore (2nd Year)",
    3: "Junior (3rd Year)",
    4: "Senior (4th Year)",
    };

  const domainMap = {
    1:"PROGRAMMING",
    2:"DATA SCIENCE",
    3:"ELECTRONICS",
  };
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
  };
  return (
    <>
      <HandlingSidebar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="">
            <div className="course-selector">
              <h1>Domain Mentor Dashboard - {domainMap[data.domain_id]}</h1>
              {DomainCourses.length > 0 ?(
                <>
                <label className="dropdown-label">
                Select a course to view progress:
              </label>
              <div className="cards-container">
                {DomainCourses.map((yearOption, yearIndex) => (
                  <div key={yearIndex} className="year-section">
                    <div
                      className={`year-card ${
                        selectedYear === yearIndex ? "expanded" : ""
                      }`}
                      onClick={async () => {setSelectedYear(yearIndex);setSelectedCard(0);}}
                    >
                      <h3>{yearMap[yearOption.year]}</h3>
                    </div>
                    {selectedYear === yearIndex && (
                      <div className="courses-container">
                        {yearOption.courses.map((courseOption, courseIndex) => (
                          <div
                            key={courseIndex}
                            className={`course-card ${
                              selectedCard === courseIndex ? "expanded" : ""
                            }`}
                            onClick={async () => {
                              setSelectedCard(courseIndex);
                              UpdateChart(courseOption);
                            }}
                          >
                            <h3>{courseOption.course_name}</h3>
                            {selectedCard === courseIndex && (
                              <div className="card-details">
                                <p>Course Code: {courseOption.course_code}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div></>):(<h1>No courses available</h1>)}
            </div>
          </div>
          
          {courseDataOverall.length>0?(
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
              <div className="handlingfaculty-dashboard-card-header"> Faculty - {item.uid} - {item.name}</div>
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
      </div>
    </>
  );
}

export default HandlingHODDashboard;
