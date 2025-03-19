import React, { useState, useEffect, useRef } from "react";
import "./SupervisorDashboard.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp } from "@fortawesome/free-solid-svg-icons";
import HandlingSidebar from "../../HandlingSidebar/HandlingSidebar";

function HandlingSupervisorDashboard() {
  const smoothScrollTo = (element, duration = 50) => {
    const targetY = element.getBoundingClientRect().top + window.scrollY;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3); // Smooth ease-out effect

    const scrollStep = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1); // Cap progress at 1
      const easeProgress = easeOutCubic(progress);

      window.scrollTo(0, startY + distance * easeProgress);

      if (elapsedTime < duration) {
        requestAnimationFrame(scrollStep);
      }
    };

    requestAnimationFrame(scrollStep);
  };
  const scrollToCourseCard = () => {
    if (courseSelectionRef.current) {
      console.log("Scrolling to course selection section...");
      smoothScrollTo(courseSelectionRef.current, 50); // Increase duration for smoother scrolling
    } else {
      console.log("courseSelectionRef is not available");
    }
  };
  const [courseDataCurrent, setCourseDataCurrent] = useState([]);
  const [courseDataOverall, setCourseDataOverall] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [department_id, setDepartment_id] = useState(1);
  const [selectedYear, setSelectedYear] = useState(0);
  const [departmentProgressOverall, setDepartmentProgressOverall] = useState(
    []
  );
  const [departmentProgressCurrent, setDepartmentProgressCurrent] = useState(
    []
  );
  const [assignmentData, setAssignmentData] = useState([]);
  const [resultsData, setResultsData] = useState([]);
  const [selectedOption, setSelectedOption] = useState({});
  const [facultyData, setFacultyData] = useState({});
  const [DomainCourses, setDomainCourses] = useState([]);
  const [selectedCard, setSelectedCard] = useState(0);
  const [viewMode, setViewMode] = useState("course");
  const progressSectionRef = useRef(null);
  const courseSelectionRef = useRef(null); // Reference for the course card section
  const [contentViewMode, setContentViewMode] = useState("topics");
  const value = (current, total) => {
    if (total === 0 || current === 0 || current > total) {
      return 100;
    }
    return (current / total) * 100;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const course = await axios.post(
          "http://localhost:8000/api/department_courses",
          { department_id: department_id },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setDomainCourses(course.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      try {
        const progress = await axios.post(
          "http://localhost:8000/api/department_overall_progress",
          { department_id: department_id },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        if ("department_overall" in progress.data) {
          setDepartmentProgressOverall(progress.data.department_overall);
          setDepartmentProgressCurrent(progress.data.department_current);
        } else {
          setDepartmentProgressOverall([]);
          setDepartmentProgressCurrent([]);
        }
        console.log(departmentProgressCurrent, departmentProgressOverall);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [department_id]);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const faculty = await axios.post(
          "http://localhost:8000/api/faculty_info",
          { department_id: department_id },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(faculty.data);
        setFacultyList(faculty.data);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      }
    };
    fetchFaculty();
  }, [viewMode]);

  const fetchChartDataCourse = async (selectedCourse) => {
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

  const fetchChartDataClass = async (class_id) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/class_progress",
        { class_id: class_id },
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
  const fetchFacultyData = async (option) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/faculty_progress",
        option,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.data) {
        setCourseDataCurrent(res.data.course_data_current);
        setCourseDataOverall(res.data.course_data_overall);
        setAssignmentData(res.data.assignment_data);
        setResultsData(res.data.results_data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const UpdateChart = async (option) => {
    console.log(option);
    if ("course_code" in option) {
      await fetchChartDataCourse(option);
    } else if ("uid" in option) {
      setFacultyData(option);
      await fetchFacultyData(option);
    } else {
      await fetchChartDataClass(option);
    }
    // Ensure the DOM has updated before scrolling
    setTimeout(() => {
      if (progressSectionRef.current) {
        smoothScrollTo(progressSectionRef.current, 50);
      }
    });
  };

  useEffect(() => {
    const resetData = () => {
      setCourseDataCurrent([]);
      setCourseDataOverall([]);
      setAssignmentData([]);
      setResultsData([]);
    };
    resetData();
  }, [viewMode, department_id]);

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

  const convertToClass1 = (item) => yearMap[item.toString()[1]];
  const convertToClass2 = (item) => departmentMap[item.toString()[0]];
  const convertToClass3 = (item) => sectionMap[item.toString()[2]];

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
  return (
    <>
      <HandlingSidebar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="">
            <h1>Supervisor Dashboard</h1>
            <div className="department-selector">
              <label className="dropdown-label">Select a department:</label>
              <select
                onChange={(e) => {
                  setDepartment_id(e.target.value);

                }}
              >
                {Object.keys(departmentMap).map((departmentKey) => (
                  <option key={departmentKey} value={departmentKey}>
                    {departmentMap[departmentKey]}
                  </option>
                ))}
              </select>
            </div>
            {departmentProgressOverall.length > 0 && (
              <div className="handlingfaculty-dashboard-aggregate" ref={progressSectionRef}>
                <div className="handlingfaculty-dashboard-aggregate-content">
                  <p>
                    Overall Department Progress:
                    {(departmentProgressOverall[0].count == 0 && (
                      <span>0%</span>
                    )) ||
                      (departmentProgressOverall[0].count > 0 && (
                        <span>
                          {(
                            (departmentProgressOverall[0].count /
                              departmentProgressOverall[0].total_count) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      ))}
                  </p>
                  <div className="handlingfaculty-dashboard-progressbar-horizontal">
                    <div
                      style={{
                        width: `${(
                          (departmentProgressOverall[0].count /
                            departmentProgressOverall[0].total_count) *
                          100
                        ).toFixed(0)}%`,
                        backgroundColor: "darkblue",
                      }}
                    />
                  </div>
                  <p>
                    Status:{" "}
                    {departmentProgressCurrent[0].completed_hours -
                      departmentProgressCurrent[0].total_hours >
                      0 && <span style={{ color: "red" }}>Delayed</span>}
                    {departmentProgressCurrent[0].completed_hours -
                      departmentProgressCurrent[0].total_hours <
                      0 && (
                        <span style={{ color: "lightgreen" }}>Ahead of time</span>
                      )}
                    {!departmentProgressCurrent[0].completed_hours == null &&
                      departmentProgressCurrent[0].completed_hours -
                      departmentProgressCurrent[0].total_hours ===
                      0 && <span style={{ color: "green" }}>On time</span>}
                    {departmentProgressCurrent[0].completed_hours == null &&
                      departmentProgressCurrent[0].completed_hours -
                      departmentProgressCurrent[0].total_hours ===
                      0 && (
                        <span style={{ color: "black" }}>Not yet started</span>
                      )}
                  </p>
                </div>
              </div>
            )}
            <div className="course-selector">
              <button
                className="HFTbutton-1"
                onClick={() => setViewMode("course")}
              >
                Course wise
              </button>
              <button
                className="HFTbutton-2"
                onClick={() => setViewMode("class")}
              >
                Class wise
              </button>
              <button
                className="HFTbutton-2"
                onClick={() => setViewMode("faculty")}
              >
                Faculty wise
              </button>
              {viewMode === "class" &&
                (department_id == 6 ? (
                  <>
                    <div className="cards-container">
                      <div ref={courseSelectionRef}>
                        <button
                          className="class-section"
                          onClick={() => {
                            setSelectedOption(111);
                            fetchChartDataClass(111);
                          }}
                        >
                          1st Year - CSE A
                        </button>
                        <button
                          className="class-section"
                          onClick={() => {
                            setSelectedOption(112);
                            fetchChartDataClass(112);
                          }}
                        >
                          1st Year - CSE B
                        </button>
                      </div>
                      <div>
                        <button
                          className="class-section"
                          onClick={() => {
                            setSelectedOption(211);
                            fetchChartDataClass(211);
                          }}
                        >
                          1st Year - AI&DS A
                        </button>
                        <button
                          className="class-section"
                          onClick={() => {
                            setSelectedOption(212);
                            fetchChartDataClass(212);
                          }}
                        >
                          1st Year - AI&DS B
                        </button>
                      </div>
                      <div>
                        <button
                          className="class-section"
                          onClick={() => {
                            setSelectedOption(311);
                            fetchChartDataClass(311);
                          }}
                        >
                          1st Year - ECE A
                        </button>
                        <button
                          className="class-section"
                          onClick={() => {
                            setSelectedOption(312);
                            fetchChartDataClass(312);
                          }}
                        >
                          1st Year - ECE B
                        </button>
                      </div>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(411);
                          fetchChartDataClass(411);
                        }}
                      >
                        1st Year - CSBS
                      </button>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(511);
                          fetchChartDataClass(511);
                        }}
                      >
                        1st Year - IT
                      </button>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(711);
                          fetchChartDataClass(711);
                        }}
                      >
                        1st Year - MECH
                      </button>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(811);
                          fetchChartDataClass(811);
                        }}
                      >
                        1st Year - CYS
                      </button>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(911);
                          fetchChartDataClass(911);
                        }}
                      >
                        1st Year - AI&ML
                      </button>
                    </div>
                  </>
                ) : department_id == 1 ||
                  department_id == 2 ||
                  department_id == 3 ? (
                  <>
                    <div>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(department_id * 100 + 11);
                          fetchChartDataClass(department_id * 100 + 11);
                        }}
                      >
                        1st Year - {departmentMap[department_id]} A
                      </button>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(department_id * 100 + 12);
                          fetchChartDataClass(department_id * 100 + 12);
                        }}
                      >
                        1st Year - {departmentMap[department_id]} B
                      </button>
                    </div>
                    <div>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(department_id * 100 + 21);
                          fetchChartDataClass(department_id * 100 + 21);
                        }}
                      >
                        2nd Year - {departmentMap[department_id]} A
                      </button>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(department_id * 100 + 22);
                          fetchChartDataClass(department_id * 100 + 22);
                        }}
                      >
                        2nd Year - {departmentMap[department_id]} B
                      </button>
                    </div>
                    <div>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(department_id * 100 + 31);
                          fetchChartDataClass(department_id * 100 + 31);
                        }}
                      >
                        3rd Year - {departmentMap[department_id]} A
                      </button>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(department_id * 100 + 32);
                          fetchChartDataClass(department_id * 100 + 32);
                        }}
                      >
                        3rd Year - {departmentMap[department_id]} B
                      </button>
                    </div>
                    <div>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(department_id * 100 + 41);
                          fetchChartDataClass(department_id * 100 + 41);
                        }}
                      >
                        4th Year - {departmentMap[department_id]} A
                      </button>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(department_id * 100 + 42);
                          fetchChartDataClass(department_id * 100 + 42);
                        }}
                      >
                        4th Year - {departmentMap[department_id]} B
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(department_id * 100 + 11);
                          fetchChartDataClass(department_id * 100 + 11);
                        }}
                      >
                        1st Year - {departmentMap[department_id]} A
                      </button>
                    </div>
                    <div>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(department_id * 100 + 21);
                          fetchChartDataClass(department_id * 100 + 21);
                        }}
                      >
                        2nd Year - {departmentMap[department_id]} A
                      </button>
                    </div>
                    <div>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(department_id * 100 + 31);
                          fetchChartDataClass(department_id * 100 + 31);
                        }}
                      >
                        3rd Year - {departmentMap[department_id]} A
                      </button>
                    </div>
                    <div>
                      <button
                        className="class-section"
                        onClick={() => {
                          setSelectedOption(department_id * 100 + 41);
                          fetchChartDataClass(department_id * 100 + 41);
                        }}
                      >
                        4th Year - {departmentMap[department_id]} A
                      </button>
                    </div>
                  </>
                ))}

              {DomainCourses.length > 0 ? (
                viewMode === "course" ? (
                  <>
                    <label className="dropdown-label">
                      Select a course to view progress:
                    </label>
                    <div className="cards-container" ref={courseSelectionRef}>
                      {DomainCourses.map((yearOption, yearIndex) => (
                        <div key={yearIndex} className="year-section">
                          <div
                            className={`year-card ${selectedYear === yearIndex ? "expanded" : ""
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
                                    className={`course-card ${selectedCard === courseIndex
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
              {viewMode === "faculty" && (
                <>
                  {facultyList.length > 0 &&
                    facultyList.map((faculty, index) => (
                      <div ref={courseSelectionRef}
                        key={index}
                        className={`course-card ${selectedCard === faculty.uid ? "expanded" : ""
                          }`}
                        onClick={async () => {
                          setSelectedCard(faculty.uid);
                          console.log(faculty);
                          UpdateChart(faculty);
                        }}
                      >
                        <h3>{faculty.name}</h3>
                        {selectedCard === faculty.uid && (
                          <div className="card-details">
                            <p>Faculty ID: {faculty.uid}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  {viewMode === "topics" && courseDataOverall.length > 0 ? (
                    <>
                      <div className="handlingfaculty-dashboard-aggregate" ref={progressSectionRef}>
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
                      <br />
                    </>
                  ) : (
                    viewMode === "topics" && <h1>No progress!</h1>
                  )}
                </>
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
              className="HFTbutton-2"
              onClick={() => setContentViewMode("assignments")}
            >
              Assessments
            </button>
            <button
              className="HFTbutton-1"
              onClick={() => setContentViewMode("results")}
            > Results
            </button>
          </div>
          {contentViewMode === "topics" &&
            courseDataOverall.length > 0 &&
            courseDataCurrent.length > 0 ? (
            <>
              {viewMode === "course" && (
                <h1>
                  Course{" "}
                  {courseDataOverall[0].course_code +
                    " - " +
                    courseDataOverall[0].course_name}
                </h1>
              )}
              <div className="handlingfaculty-dashboard-aggregate" ref={progressSectionRef}>
                <p ref={progressSectionRef}>Aggregate Progress</p>
                <div className="handlingfaculty-dashboard-aggregate-content">
                  <p ref={progressSectionRef}>
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
              {viewMode === "faculty" && (
                <span>
                  Faculty - {facultyData.uid} - {facultyData.name}
                </span>
              )}
              <div className="handlingfaculty-dashboard-card-container">
                {courseDataCurrent.map((item, i) => (
                  <div className="handlingfaculty-dashboard-card" key={i}>
                    <div className="handlingfaculty-dashboard-card-header">
                      <p ref={progressSectionRef}>
                        {(viewMode === "course" || viewMode === "class") && (
                          <span>
                            Faculty - {item.uid} - {item.name}
                          </span>
                        )}{" "}
                        {convertToClass(item.class_id)} - {item.course_code} -{" "}
                        {item.course_name}
                      </p>
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
                        Overall Progress for Assessment: {item.avg_progress}%
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
        <button className="scroll-up-button" onClick={scrollToCourseCard}>
          <FontAwesomeIcon icon={faCaretUp} />
        </button>
      </div>
    </>
  );
}

export default HandlingSupervisorDashboard;
