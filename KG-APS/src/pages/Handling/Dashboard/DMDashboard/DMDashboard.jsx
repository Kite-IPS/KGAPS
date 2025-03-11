import React, { useState, useEffect } from "react";
import "./DMDashboard.css";
import axios from "axios";
import HandlingSidebar from "../../HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from "../../HandlingSidebar2/HandlingSidebar2.jsx";

function HandlingDMDashboard() {
  const [courseDataCurrent, setCourseDataCurrent] = useState([]);
  const [courseDataOverall, setCourseDataOverall] = useState([]);
  const [assignmentData, setAssignmentData] = useState([]);
  const [resultsData, setResultsData] = useState([]);
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [viewMode, setViewMode] = useState("course");
  const [contentViewMode, setContentViewMode] = useState("topics");
  const [DomainCourses, setDomainCourses] = useState([]);
  const [selectedCard, setSelectedCard] = useState(0);
  const [facultyDetails, setFacultyDetails] = useState(data); 
  const value = (current, total) => {
    if (total === 0 || current === 0 || current > total) {
      return 100;
    }
    return (current / total) * 100;
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
        const course = await axios.post(
          "http://localhost:8000/api/domain_courses",
          data,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setDomainCourses(course.data);
        console.log(course.data);
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
      setAssignmentData(res.data.assignment_data);
      setResultsData(res.data.results_data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const UpdateChart = async (option) => {
    console.log(option);
    setSelectedOption(option);
    await fetchChartData(option);
  };
  const renderColorComment = (barColor) => {
    switch (barColor) {
      case "black":
        return <p>Not yet started</p>;
      case "red":
        return <p>Delayed</p>;
      case "green":
        return <p>Ahead of time</p>;
      case "blue":
        return <p>On Time</p>;
      default:
        return null;
    }
  };
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
    2: "B",
  };

  const convertToClass = (item) => {
    const class_id = item.toString();
    return (
      yearMap[class_id[1]] +
      " - " +
      departmentMap[class_id[0]] +
      " " +
      sectionMap[class_id[2]]
    );
  };

  const domainMap = {
    1: "PROGRAMMING",
    2: "DATA SCIENCE",
    3: "ELECTRONICS",
  };
  const aggregateData = () => {
    let aggrdata = [];
    var count = 0;
    var total_count = 0;
    var hours_count = 0;

    for (let i = 0; i < courseDataOverall.length; i++) {
      count += courseDataOverall[i].count;
      total_count += courseDataOverall[i].total_count;
      var temp =
        courseDataCurrent[i].completed_hours / courseDataCurrent[i].total_hours;
      if (temp > 1) {
        hours_count += 1;
      } else if (temp < 1) {
        hours_count -= 1;
      }
    }
    var comment = "";
    var topic_count = count / total_count;
    if (hours_count < 0) {
      comment = "Ahead of time";
    } else if (hours_count > 0) {
      comment = "Lagging";
    } else if (hours_count === 0) {
      comment = "On Time";
    } else {
      comment = "Not yet started";
    }

    aggrdata.push({ topic_count: topic_count, comment: comment });

    console.log(aggrdata);
    return aggrdata;
  };
  const convertToClass1 = (item) => yearMap[item.toString()[1]];
  const convertToClass2 = (item) => departmentMap[item.toString()[0]];
  const convertToClass3 = (item) => sectionMap[item.toString()[2]];
  return (
    <>
      {windowWidth > 1500 ? <HandlingSidebar /> : <HandlingSidebar2 />} 
      <div className="DMDASH dashboard-container">
      <div className="handlingfaculty-dashboard-nametext">
            <div className="handlingfaculty-dashboard-welcome-box">
              <p className="handlingfaculty-dashboard-greeting">Welcome Faculty - {facultyDetails.name}</p>
            </div>
      </div>
        <div className="dashboard-content">

          <div className="">
            <div className="course-selector">
              <h1>Domain Mentor Dashboard - {domainMap[data.domain_id]}</h1>
              <p className="HFTbutton-1">Course wise</p>
              {DomainCourses.length > 0 ? (
                viewMode === "course" ? (
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
                            onClick={async () => {
                              setSelectedYear(yearIndex);
                              setSelectedCard(0);
                            }}
                          >
                            <h3>{yearMap[yearOption.year]}</h3>
                          </div>
                          {selectedYear === yearIndex && (
                            <div className="courses-container">
                              {yearOption.courses.map(
                                (courseOption, courseIndex) => (
                                  <div
                                    key={courseIndex}
                                    className={`course-card ${
                                      selectedCard === courseIndex
                                        ? "expanded"
                                        : ""
                                    }`}
                                    onClick={async () => {
                                      setSelectedCard(courseIndex);
                                      UpdateChart(courseOption);
                                    }}
                                  >
                                    <h3>{courseOption.course_name}</h3>
                                    {selectedCard === courseIndex && (
                                      <div className="card-details">
                                        <p>
                                          Course Code:{" "}
                                          {courseOption.course_code}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <></>
                )
              ) : (
                <h1>No courses available</h1>
              )}
            </div>
          </div>
          <div>
            <button
              className="HFTbutton-1"
              onClick={() => setContentViewMode("topics")}
            >
              Topics
            </button>
            <button
              className="HFTbutton-1"
              onClick={() => setContentViewMode("assignments")}
            >
              Assessments
            </button>
            <button
              className="HFTbutton-1"
              onClick={() => setContentViewMode("results")}
            >
              Results
            </button>
          </div>
          <h1>
                Course{" "}
                {selectedOption.course_code +
                  " - " +
                 selectedOption.course_name}
              </h1>
          {contentViewMode === "topics" &&
          courseDataOverall.length > 0 &&
          courseDataCurrent.length > 0 ? (
            <>

              <div className="handlingfaculty-dashboard-aggregate" style={{ maxWidth: "40vw", width: "40vw" }}
>
                <p>Aggregate Progress</p>
                <div className="handlingfaculty-dashboard-aggregate-content">
                  <p>
                    Overall Progress:{" "}
                    {(aggregateData()[0].topic_count * 100).toFixed(0)}%
                  </p>
                  <div className="handlingfaculty-dashboard-progressbar-horizontal">
                    <div
                      style={{
                        width: `${(
                          aggregateData()[0].topic_count * 100
                        ).toFixed(2)}%`,
                        backgroundColor: "purple",
                      }}
                    />
                  </div>
                  <p>Average Status: {aggregateData()[0].comment}</p>
                </div>
              </div>
              <div className="handlingfaculty-dashboard-card-container">
                {courseDataCurrent.map((item, i) => (
                  <div className="handlingfaculty-dashboard-card" key={i}>
                    <div className="handlingfaculty-dashboard-card-header">
                      {" "}
                      Faculty - {item.uid} - {item.name} -{" "}
                      {convertToClass(item.class_id)}
                    </div>
                    <div className="handlingfaculty-dashboard-card-content">
                      <p>
                        Hours Completed: {item.completed_hours} /{" "}
                        {item.total_hours}
                      </p>
                      <div className="handlingfaculty-dashboard-progressbar-horizontal">
                        <div
                          style={{
                            width: `${value(
                              item.completed_hours,
                              item.total_hours
                            ).toFixed(2)}%`,
                            backgroundColor: item.bar_color,
                          }}
                        />
                      </div>
                      <p>
                        Topics Completed: {courseDataOverall[i].count}/
                        {courseDataOverall[i].total_count}
                      </p>
                      <div className="handlingfaculty-dashboard-progressbar-horizontal">
                        <div
                          style={{
                            width: `${(
                              (courseDataOverall[i].count /
                                courseDataOverall[i].total_count) *
                              100
                            ).toFixed(2)}%`,
                            backgroundColor: "green",
                          }}
                        />
                      </div>
                      <div className="handlingfaculty-dashboard-colorcomment">
                        {renderColorComment(item.bar_color)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            contentViewMode === "topics" && <h1>No progress!</h1>
          )}
          {contentViewMode === "assignments" && assignmentData.length > 0 ? (
            <>
              <h1>Assessment Data</h1>
              <div className="handlingfaculty-dashboard-card-container">
                {assignmentData.map((item, i) => (
                  <div className="handlingfaculty-dashboard-card" key={i}>
                    <div className="handlingfaculty-dashboard-card-header">
                      <span className="grid-item">{item.course_code}</span>
                      <span className="grid-item">{item.course_name}</span>
                      <span className="grid-item">
                        {convertToClass1(item.class_id)}
                      </span>
                      <span className="grid-item">
                        {convertToClass2(item.class_id)}
                      </span>
                      <span className="grid-item">
                        {convertToClass3(item.class_id)}
                      </span>
                    </div>
                    <div className="handlingfaculty-dashboard-card-content">
                      <p>
                        Overall Progress for Assignment: {item.avg_progress}%
                      </p>
                      <div className="handlingfaculty-dashboard-progressbar-horizontal">
                        <div
                          style={{
                            width: `${item.avg_progress}%`,
                            backgroundColor: "green",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            contentViewMode === "assignments" && <h1>No assessments!</h1>
          )}
          {contentViewMode === "results" && resultsData.length > 0 ? (
            <>
              <h1>Result Data</h1>
              <div className="handlingfaculty-dashboard-card-container">
                {resultsData.map((item, i) => (
                  <div className="handlingfaculty-dashboard-card" key={i}>
                    <div className="handlingfaculty-dashboard-card-header">
                      <span className="grid-item">{item.course_code}</span>
                      <span className="grid-item">{item.course_name}</span>
                      <span className="grid-item">
                        {convertToClass1(item.class_id)}
                      </span>
                      <span className="grid-item">
                        {convertToClass2(item.class_id)}
                      </span>
                      <span className="grid-item">
                        {convertToClass3(item.class_id)}
                      </span>
                    </div>
                    <div className="handlingfaculty-dashboard-card-content">
                      <p>
                        Average pass percentage: {item.avg_pass_percentage}%
                      </p>
                      <div className="handlingfaculty-dashboard-progressbar-horizontal">
                        <div
                          style={{
                            width: `${item.avg_pass_percentage}%`,
                            backgroundColor: "green",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            contentViewMode === "results" && <h1>No Results!</h1>
          )}
        </div>
      </div>
    </>
  );
}

export default HandlingDMDashboard;
