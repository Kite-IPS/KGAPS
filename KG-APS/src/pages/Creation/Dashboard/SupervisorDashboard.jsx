import React, { useState, useEffect, useRef } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from '../../Handling/HandlingSidebar2/HandlingSidebar2.jsx';
import HandlingSupervisorDashboard from "../../Handling/Dashboard/SupervisorDashboard/SupervisorDashboard";
Chart.register(ArcElement, Tooltip, Legend);

const CreationSupervisorDashboard = () => {
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
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [overallView, setOverallView] = useState("creation");
  const [selectedCard, setSelectedCard] = useState(0);
  const [selectedYear, setSelectedYear] = useState(0);
  const [ChartData, setChartsData] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [creationViewMode, setCreationViewMode] = useState("course");
  const [selectedDepartment, setSelectedDepartment] = useState(1);
  const [selectedOption, setSelectedOption] = useState({});
  const [DomainCourses, setDomainCourses] = useState([]);
  const [overallProgress, setOverallProgress] = useState([]);
  const progressSectionRef = useRef(null);
  const courseSelectionRef = useRef(null); // Reference for the course card section
  const [MainChartData, setMainChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "",
        data: [],
        backgroundColor: [],
      },
    ],
  });

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
          "http://localhost:8000/api/department_courses",
          { department_id: selectedDepartment },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(course.data);
        setDomainCourses(course.data);
        if (course.data.length > 0) {
          await fetchChartData(course.data[0].courses[0]); // Initial chart load
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      try {
        const progress = await axios.post(
          "http://localhost:8000/api/all_department_overall_progress",
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        if ("overall_progress" in progress.data) {
          setOverallProgress(progress.data.overall_progress);
        } else {
          setOverallProgress([]);
        }
        console.log(overallProgress);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedDepartment]);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const faculty = await axios.post(
          "http://localhost:8000/api/faculty_info",
          { department_id: selectedDepartment },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(faculty.data);
        setFacultyList(faculty.data);
        setMainChartData({
          labels: [],
          datasets: [
            {
              label: "",
              data: [],
              backgroundColor: [],
            },
          ],
        });
        setChartsData([]);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      }
    }
    fetchFaculty();
  }, [creationViewMode]);

  const fetchChartData = async (selectedCourse) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/course_progress",
        selectedCourse,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setSelectedOption(selectedCourse);
      const { status_code, count, color } = res.data.main;

      setMainChartData({
        labels: status_code,
        datasets: [
          {
            label: "Overall Progress",
            data: count,
            backgroundColor: color,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const fetchData = async (option) => {
    try {
      const res = await axios({
        url: "http://localhost:8000/api/faculty_progress",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: option,
      });

      const response = res.data;
      const { status_code, count, color } = response.main;
      const otherCharts = JSON.parse(response.other);

      // Set main chart data
      setMainChartData({
        labels: status_code,
        datasets: [
          {
            label: "Overall Progress",
            data: count,
            backgroundColor: color,
          },
        ],
      });

      // Map each course in `otherCharts` to a chart configuration
      const chartConfigs = Object.keys(otherCharts).map((courseKey) => {
        const courseData = otherCharts[courseKey];
        const labels = [];
        const dataValues = [];
        const backgroundColors = [];

        Object.keys(courseData).forEach((statusKey) => {
          const [statusCount, statusColor] = courseData[statusKey];
          dataValues.push(statusCount);
          backgroundColors.push(statusColor);
        });

        return {
          labels,
          datasets: [
            {
              label: `Progress for ${courseKey}`,
              data: dataValues,
              backgroundColor: backgroundColors,
            },
          ],
        };
      });
      console.log(chartConfigs);
      setChartsData(chartConfigs);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const UpdateChart = async (option) => {
    console.log(option, creationViewMode);
    if (creationViewMode === "course") {
      await fetchChartData(option);
    }
    if (creationViewMode === "faculty") {
      console.log("getting faculty progress");
      await fetchData(option);
    }
    // Ensure the DOM has updated before scrolling
    setTimeout(() => {
      if (progressSectionRef.current) {
        smoothScrollTo(progressSectionRef.current, 50);
      }
    });
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
  return (
    <div>
      {windowWidth > 1500 ? <HandlingSidebar /> : <HandlingSidebar2 />}
      <div
        className="overall-progress-wrapper"
        style={{
          display: "flex",
          overflowX: "auto",  // Enables horizontal scrolling
          whiteSpace: "nowrap",  // Prevents wrapping to a new row
          padding: "10px",
          gap: "15px", // Adds space between containers
          marginTop: "10vh",
          scrollbarWidth: "thin", // For Firefox scrollbar styling
          scrollbarColor: "#888 #f1f1f1" // Scrollbar color
        }}
      >
        {overallProgress.map(
          (item) =>
            item.department_overall && (
              <div
                key={item.department_id}
                className="overall-progress-container-1"
                style={{
                  minWidth: "250px",  // Ensures fixed width for horizontal scrolling
                  maxWidth: "350px",  // Restricts max width
                  maxHeight: "600px", // Keeps container small
                  overflowY: "auto", // Makes individual containers scrollable if needed
                  padding: "10px",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                  backgroundColor: "#fff",
                  flexShrink: 0 // Prevents containers from shrinking
                }}
              >
                <h1>Department of {departmentMap[item.department_id]}</h1>
                {item.creation && (
                  <>
                    <h3>Overall Course Materials</h3>
                    <div className="overall-progress-chart" style={{ height: "200px", marginLeft: "auto", marginRight: "auto" }}>
                      <Pie
                        data={{
                          labels: item.creation.status_code,
                          datasets: [
                            {
                              label: "Overall Progress",
                              data: item.creation.count,
                              backgroundColor: item.creation.color,
                            },
                          ],
                        }}
                      />
                    </div>
                  </>
                )}
                <div className="handlingfaculty-dashboard-aggregate-content">
                  <p>
                    Overall Course Handling Progress :
                    {(item.department_overall[0].count == 0 && (
                      <span>0%</span>
                    )) ||
                      (item.department_overall[0].count > 0 && (
                        <span>
                          {(
                            (item.department_overall[0].count /
                              item.department_current[0].total_count) *
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
                          (item.department_overall[0].count /
                            item.department_overall[0].total_count) *
                          100
                        ).toFixed(0)}%`,
                        backgroundColor: "darkblue",
                      }}
                    />
                  </div>
                  <p>
                    Status:{" "}
                    {item.department_current[0].completed_hours -
                      item.department_current[0].total_hours >
                      0 && <span style={{ color: "red" }}>Delayed</span>}
                    {item.department_current[0].completed_hours -
                      item.department_current[0].total_hours <
                      0 && (
                        <span style={{ color: "lightgreen" }}>Ahead of time</span>
                      )}
                    {!item.department_current[0].completed_hours == null &&
                      item.department_current[0].completed_hours -
                      item.department_current[0].total_hours ===
                      0 && <span style={{ color: "green" }}>On time</span>}
                    {item.department_current[0].completed_hours == null &&
                      item.department_current[0].completed_hours -
                      item.department_current[0].total_hours ===
                      0 && (
                        <span style={{ color: "black" }}>Not yet started</span>
                      )}
                  </p>
                </div>
                <div className="handlingfaculty-dashboard-aggregate-content">
                  <p>
                    Overall Course Assessment Progress :
                    {(!item.assignment_data[0].avg_progress && <span>0%</span>) ||
                      (item.assignment_data[0].avg_progress > 0 && (
                        <span>{item.assignment_data[0].avg_progress}%</span>
                      ))}
                  </p>
                  <div className="handlingfaculty-dashboard-progressbar-horizontal">
                    <div
                      style={{
                        width: `${item.assignment_data[0].avg_progress}%`,
                        backgroundColor: "darkblue",
                      }}
                    />
                  </div>
                </div>
                <div className="handlingfaculty-dashboard-aggregate-content">
                  <p>
                    Overall Course Result Progress :
                    {(!item.results_data[0].avg_pass_percentage && <span>0%</span>) ||
                      (item.results_data[0].avg_pass_percentage > 0 && (
                        <span>{item.results_data[0].avg_pass_percentage}%</span>
                      ))}
                  </p>
                  <div className="handlingfaculty-dashboard-progressbar-horizontal">
                    <div
                      style={{
                        width: `${item.results_data[0].avg_pass_percentage}%`,
                        backgroundColor: "darkblue",
                      }}
                    />
                  </div>
                </div>
              </div>
            )
        )}
      </div>
      <div className="super">
        <button
          className="HFTbutton-1"
          onClick={() => setOverallView("creation")}
        >
          Creation
        </button>
        <button
          className="HFTbutton-1"
          onClick={() => setOverallView("handling")}
        >
          Handling
        </button>
      </div>
      {
        overallView === "creation" && (
          <>
          <h1>Creation Section</h1>
            <div className="dashboard-container">
              <div className="dashboard-content">

                <h1>Supervisor Dashboard</h1>
                <div className="course-selector">
                  <button
                    className="HFTbutton-1"
                    onClick={() => setCreationViewMode("course")}
                  >
                    Course wise
                  </button>
                  <button
                    className="HFTbutton-2"
                    onClick={() => setCreationViewMode("faculty")}
                  >
                    Faculty wise
                  </button>
                  <div className="department-selector">
                    <label className="dropdown-label">Select a department:</label>
                    <select onChange={(e) => setSelectedDepartment(e.target.value)}>
                      {Object.keys(departmentMap).map((departmentKey) => (
                        <option key={departmentKey} value={departmentKey}>
                          {departmentMap[departmentKey]}
                        </option>
                      ))}
                    </select>
                  </div>
                  {creationViewMode === "course" && (
                    <>
                      <label className="dropdown-label">
                        Select a course to view progress:
                      </label>
                      <div className="cards-container" ref={courseSelectionRef}>
                        {DomainCourses.length > 0 ? (
                          DomainCourses.map((yearOption, yearIndex) => (
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
                                              Course Code: {courseOption.course_code}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <h1>No courses yet</h1>
                        )}
                      </div>

                      {DomainCourses.length > 0 ? (
                        MainChartData.labels.length > 0 ? (
                          <>
                            {selectedOption && (
                              <h3 ref={progressSectionRef}>
                                Progress for {selectedOption.course_code} -{" "}
                                {selectedOption.course_name}
                              </h3>
                            )}
                            <div className="chart-grid">
                              <div className="chart-container">
                                <Pie data={MainChartData} />
                              </div>
                            </div>
                          </>
                        ) : (
                          <h1>No progress yet</h1>
                        )
                      ) : null}
                    </>
                  )}
                  {creationViewMode === "faculty" && (
                    <>
                      {facultyList.length > 0 &&
                        facultyList.map((faculty, index) => (
                          <div ref={progressSectionRef} 
                            key={index}
                            className={`course-card ${selectedCard === faculty.uid ? "expanded" : ""
                              }`}
                            onClick={async () => {
                              setSelectedCard(faculty.uid);
                              UpdateChart(faculty);
                            }}
                          >
                            <h3>{faculty.name}</h3>
                            {selectedCard === faculty.uid && (
                              <div className="card-details" >
                                <p ref={courseSelectionRef}>Faculty ID: {faculty.uid}</p>
                              </div>
                            )}
                          </div>
                        ))}

                      {ChartData.length > 0 && <>
                        <div className="chart-grid">
                          <div className="chart-container">
                            <Pie data={MainChartData} />
                          </div>
                        </div>
                        <div className="sub-progress-section" style={{ width: "100vw" }}>
                          {ChartData.map((chartData, index) => (
                            <div key={index} className="sub-progress-chart">
                              <h3>{chartData.datasets[0].label}</h3>
                              <Pie data={chartData} />
                            </div>
                          ))}
                        </div></>}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )
      }

      {
        overallView === "handling" && (
          <>
            <h1>Handling Section</h1>
            <div className="handling-container">
              <HandlingSupervisorDashboard />
            </div>
          </>
        )
      }
      <button className="scroll-up-button" onClick={scrollToCourseCard}>
        Back to Course
      </button>
    </div >
  );
};

export default CreationSupervisorDashboard;
