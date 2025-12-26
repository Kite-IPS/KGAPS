import React, { useState, useEffect, useRef } from "react";
import { Pie } from "react-chartjs-2";
import api from '@/apiConfig';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from "../../Handling/HandlingSidebar2/HandlingSidebar2.jsx";
import "./Dashboard.css";

Chart.register(ArcElement, Tooltip, Legend);

const CreationDMDashboard = () => {
  // Extraordinary Professional Chart Options - Main Charts
  const modernChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        align: 'center',
        labels: {
          padding: 20,
          font: {
            size: 13,
            family: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
            weight: '600'
          },
          color: '#1a202c',
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 14,
          boxHeight: 14,
          textAlign: 'left',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label} — ${percentage}%`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.backgroundColor[i],
                  hidden: false,
                  index: i,
                  pointStyle: 'rectRounded',
                  lineWidth: 0
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(17, 24, 39, 0.98)',
        titleColor: '#ffffff',
        bodyColor: '#f3f4f6',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 2,
        padding: {
          top: 16,
          bottom: 16,
          left: 18,
          right: 18
        },
        cornerRadius: 14,
        titleMarginBottom: 12,
        bodySpacing: 8,
        bodyFont: {
          size: 14,
          family: "'Poppins', 'Inter', sans-serif",
          weight: '500',
          lineHeight: 1.8
        },
        titleFont: {
          size: 16,
          weight: '700',
          family: "'Poppins', 'Inter', sans-serif"
        },
        displayColors: true,
        boxWidth: 16,
        boxHeight: 16,
        boxPadding: 8,
        usePointStyle: true,
        caretSize: 10,
        caretPadding: 14,
        callbacks: {
          title: function(context) {
            return `📊 ${context[0].label}`;
          },
          label: function(context) {
            if (context.parsed !== null) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `   Count: ${context.parsed}   |   ${percentage}%`;
            }
            return '';
          },
          afterLabel: function(context) {
            if (context.parsed !== null) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              return `   Total: ${total}`;
            }
            return '';
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeInOutQuart',
      delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 200 + Math.random() * 100;
        }
        return delay;
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      }
    },
    elements: {
      arc: {
        borderWidth: 0,
        borderColor: 'transparent',
        hoverBorderWidth: 8,
        hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        hoverOffset: 25,
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        shadowBlur: 15,
        shadowColor: 'rgba(0, 0, 0, 0.15)'
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    cutout: '0%'
  };
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
  const [courseProgressData, setCourseProgressData] = useState([]);
  const [mainChartData, setMainChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Course Progress",
        data: [],
        backgroundColor: [],
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const course = await api.post(
          "/api/domain_courses",
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
      const res = await api.post(
        "/api/course_progress",
        selectedCourse,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(res.data);
      const { status_code, count, color } = res.data.main;

      // Transform the data for progress bars
      const totalCount = count.reduce((a, b) => a + b, 0);
      const progressData = status_code.map((status, index) => ({
        status: status,
        count: count[index],
        color: color[index],
        percentage: totalCount > 0 ? (count[index] / totalCount) * 100 : 0
      }));

      setCourseProgressData(progressData);

      // Set chart data for pie chart
      setMainChartData({
        labels: status_code,
        datasets: [
          {
            label: "Course Progress",
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
              <button className="course-wise-button">Course wise</button> {/* Updated line */}
              {DomainCourses.length > 0 ? (
                <>
                  <label className="dropdown-label">
                    Select a course to view progress:
                  </label>
                  <div className="cards-container" ref={courseSelectionRef}>
                    {DomainCourses.map((yearOption, yearIndex) => (
                      <div key={yearIndex} className="year-section">
                        <div
                          className={`year-card ${selectedYear === yearIndex ? "expanded" : ""}`}
                          onClick={async () => { setSelectedYear(yearIndex); setSelectedCard(0); }}
                        >
                          <h3>{yearMap[yearOption.year]}</h3>
                        </div>
                        {selectedYear === yearIndex && (
                          <div className="courses-container">
                            {yearOption.courses.map((courseOption, courseIndex) => (
                              <div
                                key={courseIndex}
                                className={`course-card ${selectedCard === courseIndex ? "expanded" : ""}`}
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
                  </div>
                </>
              ) : (
                <h1>No courses available</h1>
              )}
            </div>
          </div>

          {courseProgressData.length > 0 ? (<>
            <h3>Progress for {selectedOption.course_code} - {selectedOption.course_name}</h3>
            
            {/* Chart and Progress Section Layout */}
            <div className="chart-and-progress-container">
              {/* Left side - Chart */}
              <div className="chart-section">
                <div className="chart-container">
                  <Pie data={mainChartData} options={modernChartOptions} />
                </div>
              </div>
              
              {/* Right side - Progress Details */}
              <div className="progress-section">
                <div className="handlingfaculty-dashboard-aggregate">
                  <p>Course Progress Breakdown</p>
                  <div className="handlingfaculty-dashboard-aggregate-content">
                    {courseProgressData.map((item, index) => (
                      <div key={index} className="progress-item">
                        <p>{item.status}: {item.count} ({item.percentage.toFixed(1)}%)</p>
                        <div className="handlingfaculty-dashboard-progressbar-horizontal">
                          <div
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
