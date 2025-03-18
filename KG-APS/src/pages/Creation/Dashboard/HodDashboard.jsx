import React, { useState, useEffect, useRef } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from "../../Handling/HandlingSidebar2/HandlingSidebar2.jsx";
Chart.register(ArcElement, Tooltip, Legend);

const CreationHodDashboard = () => {
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
  const [selectedCard, setSelectedCard] = useState(0);
  const [selectedYear, setSelectedYear] = useState(0);
  const [DomainCourses, setDomainCourses] = useState([]);
  const [creationViewMode, setCreationViewMode] = useState("course");
  const [facultyList, setFacultyList] = useState([]);
  const [ChartData, setChartsData] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const course = await axios.post(
          "http://localhost:8000/api/department_courses",
          data,
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
    };

    fetchData();
  }, []);

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

  const fetchChartData = async (selectedCourse) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/course_progress",
        selectedCourse,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

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



  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const faculty = await axios.post(
          "http://localhost:8000/api/faculty_info",
          { department_id: data.department_id },
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
    <div className="dashboard-container">
      <div className="dashboard-content">
      {windowWidth > 1500 ? <HandlingSidebar className="custom-sidebar-class" /> : <HandlingSidebar2 className="custom-sidebar-class" />}
        <h1>Department of {departmentMap[data.department_id]}</h1>
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
        {creationViewMode === "course" && <><label className="dropdown-label">

          Select a course to view progress:
        </label>
          <div style={{ marginLeft: "10px" }} className="cards-container" ref={courseSelectionRef}>
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
                    {yearOption.courses.map((courseOption, courseIndex) => (
                      <div
                        key={courseIndex}
                        className={`course-card ${selectedCard === courseIndex ? "expanded" : ""
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
          </div>
          <h3 ref={progressSectionRef}>Progress</h3>
          {MainChartData.labels.length > 0 ? (
            <div className="chart-grid">
              <div className="chart-container" style={{paddingBottom:"40px"}}>
                <Pie data={MainChartData} />
              </div>
            </div>
          ) : (
            <h1>No progress yet</h1>
          )}{" "}</>}
        {creationViewMode === "faculty" && (
          <>
            <p style={{margin:"10px"}} ref={courseSelectionRef}>Faculty view :</p>
            {facultyList.length > 0 &&
              facultyList.map((faculty, index) => (
                <div
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
                    <div className="card-details">
                      <p>Faculty ID: {faculty.uid}</p>
                    </div>
                  )}
                </div>
              ))}

            {ChartData.length > 0 && (
              <>
                <div className="chart-grid" ref={progressSectionRef}>
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
                </div>
              </>
            )}
          </>
        )}
      </div>
      <button className="scroll-up-button" onClick={scrollToCourseCard}>
        Back to Course
      </button>
    </div>
  );

};

export default CreationHodDashboard;
