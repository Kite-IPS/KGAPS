import React, { useState, useEffect, useRef } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from "../../Handling/HandlingSidebar2/HandlingSidebar2.jsx";
import "./Dashboard.css";

Chart.register(ArcElement, Tooltip, Legend);

const CreationDMDashboard = () => {
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
      smoothScrollTo(courseSelectionRef.current, 50); // Scroll back up
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

  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [DomainCourses, setDomainCourses] = useState([]);
  const [selectedCard, setSelectedCard] = useState(0);
  const progressSectionRef = useRef(null);
  const courseSelectionRef = useRef(null); // Reference for the course card section
  const [MainChartData, setMainChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "No Data to show",
        data: [],
        backgroundColor: [],
      },
    ],
  });

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

  const UpdateChart = async (option) => {
    console.log(option);
    await fetchChartData(option);
    if (progressSectionRef.current) {
      smoothScrollTo(progressSectionRef.current, 50);
    }
  };
  const yearMap = {
    1: "Freshman (1st Year)",
    2: "Sophomore (2nd Year)",
    3: "Junior (3rd Year)",
    4: "Senior (4th Year)",
  };

  const domainMap = {
    1: "PROGRAMMING",
    2: "DATA SCIENCE",
    3: "ELECTRONICS",
  };
  return (
    <>
      {windowWidth > 1500 ? <HandlingSidebar className="custom-sidebar-class" /> : <HandlingSidebar2 className="custom-sidebar-class" />}
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="">
            <div className="course-selector" ref={courseSelectionRef}>
              <h1>Domain Mentor Dashboard - {domainMap[data.domain_id]}</h1>
              <p className="HFTbutton-1">Course wise</p>
              {DomainCourses.length > 0 ? (
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
                          onClick={async () => { setSelectedYear(yearIndex); setSelectedCard(0); }}
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
                                  setSelectedOption(courseOption);
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
                  </div></>) : (<h1>No courses available</h1>)}
            </div>
          </div>

          {MainChartData.labels.length > 0 ? (<>
            <h3>Progress for {selectedOption.course_code} - {selectedOption.course_name}</h3>
            <div className="chart-grid">
              <div className="chart-container">
                <Pie data={MainChartData} />
              </div>
            </div></>
          ) : (
            selectedOption.course_code && (<h1>No progress yet</h1>)
          )}
        </div>
        <button className="scroll-up-button" onClick={scrollToCourseCard}>
          <FontAwesomeIcon icon={faCaretUp} />
        </button>
      </div>
    </>
  );
};

export default CreationDMDashboard;
