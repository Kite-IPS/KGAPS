import React, { useState, useEffect, useRef } from "react";
import { Pie } from "react-chartjs-2";
import api from '@/apiConfig';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from "../../Handling/HandlingSidebar2/HandlingSidebar2.jsx";
import "./Dashboard.css";
Chart.register(ArcElement, Tooltip, Legend);

const CreationHodDashboard = () => {
  // Extraordinary Professional Chart Options - Main Charts
  const modernChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
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
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
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

  // Extraordinary Professional Chart Options - Small Charts with Doughnut Style
  const smallChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        align: 'center',
        labels: {
          padding: 16,
          font: {
            size: 11,
            family: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
            weight: '600'
          },
          color: '#0f172a',
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 10,
          boxHeight: 10,
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(0);
                
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: dataset.backgroundColor[i],
                  hidden: false,
                  index: i,
                  pointStyle: 'circle',
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
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(96, 165, 250, 0.4)',
        borderWidth: 2,
        padding: 14,
        cornerRadius: 10,
        titleFont: {
          size: 13,
          weight: '700',
          family: "'Poppins', 'Inter', sans-serif"
        },
        bodyFont: {
          size: 12,
          weight: '500',
          family: "'Poppins', 'Inter', sans-serif"
        },
        displayColors: true,
        boxWidth: 12,
        boxHeight: 12,
        usePointStyle: true,
        callbacks: {
          title: function(context) {
            return `📈 ${context[0].label}`;
          },
          label: function(context) {
            if (context.parsed !== null) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `  ${context.parsed} (${percentage}%)`;
            }
            return '';
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1800,
      easing: 'easeInOutCubic'
    },
    layout: {
      padding: {
        top: 15,
        bottom: 15,
        left: 15,
        right: 15
      }
    },
    elements: {
      arc: {
        borderWidth: 0,
        borderColor: 'transparent',
        hoverBorderWidth: 6,
        hoverBorderColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        hoverOffset: 18
      }
    },
    cutout: '45%'
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
        const course = await api.post(
          "/api/department_courses",
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
      const res = await api.post(
        "/api/course_progress",
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
      const res = await api.post("/api/faculty_progress", option, {
        headers: {
          "Content-Type": "application/json",
        },
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
          labels.push(statusKey);
          dataValues.push(statusCount);
          backgroundColors.push(statusColor);
        });

        // Check if course is unstarted (all values are 0)
        const isUnstarted = dataValues.every(val => val === 0);

        return {
          labels,
          datasets: [
            {
              label: `Progress for ${courseKey}`,
              data: isUnstarted ? [1] : dataValues,
              backgroundColor: isUnstarted ? ['rgba(226, 232, 240, 0.4)'] : backgroundColors.map((c, idx) => {
                // Add gradient-like enhanced colors for small charts
                const enhancedColors = {
                  '#4ade80': 'rgba(74, 222, 128, 0.9)',
                  '#fbbf24': 'rgba(251, 191, 36, 0.9)',
                  '#f87171': 'rgba(248, 113, 113, 0.9)',
                  '#60a5fa': 'rgba(96, 165, 250, 0.9)',
                  '#a78bfa': 'rgba(167, 139, 250, 0.9)',
                  '#34d399': 'rgba(52, 211, 153, 0.9)',
                  '#fb923c': 'rgba(251, 146, 60, 0.9)',
                };
                return enhancedColors[c] || c;
              }),
              borderWidth: 0,
              borderColor: 'transparent',
              hoverOffset: 18,
              hoverBorderWidth: 4,
              hoverBorderColor: 'rgba(255, 255, 255, 0.9)',
              spacing: 4,
              offset: 8,
              borderRadius: 8
            },
          ],
          isUnstarted,
          statusLabels: isUnstarted ? ['Not Started'] : labels,
          statusCounts: isUnstarted ? [0] : dataValues,
          statusColors: isUnstarted ? ['rgba(226, 232, 240, 0.4)'] : backgroundColors
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
        const faculty = await api.post(
          "/api/faculty_info",
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
              <div className="chart-container" style={{ paddingBottom: "40px" }}>
                <Pie data={MainChartData} options={modernChartOptions} />
              </div>
            </div>
          ) : (
            <h1>No progress yet</h1>
          )}{" "}</>}
        {creationViewMode === "faculty" && (
          <>
            <p style={{ margin: "10px" }} ref={courseSelectionRef}>Faculty view :</p>
            <div className="faculty-list-container">
            {facultyList.length > 0 &&
              facultyList.map((faculty, index) => (
                <div
                  key={index}
                  className={`faculty-card ${selectedCard === faculty.uid ? "selected" : ""
                    }`}
                  onClick={async () => {
                    setSelectedCard(faculty.uid);
                    UpdateChart(faculty);
                  }}
                >
                  <h3>{faculty.name}</h3>
                  <div className="card-details">
                    <p>Faculty ID: {faculty.uid}</p>
                  </div>
                </div>
              ))}
              </div>
            {ChartData.length > 0 && (
              <>
                {selectedCard && facultyList.find(faculty => faculty.uid === selectedCard) && (
                  <h3 ref={progressSectionRef} style={{textAlign: 'center', margin: '40px 0 20px 0', fontSize: '20px', color: '#1e40af'}}>
                    Progress for {facultyList.find(faculty => faculty.uid === selectedCard).name} (Faculty ID: {selectedCard})
                  </h3>
                )}
                <div className="chart-grid" style={{marginTop: "20px"}}>
                  <div className="chart-container">
                    <Pie data={MainChartData} options={smallChartOptions} />
                  </div>
                </div>
                <div className="sub-progress-section">
                  {ChartData.map((chartData, index) => (
                    <div key={index} className="sub-progress-chart">
                      <h3>{chartData.datasets[0].label}</h3>
                      {chartData.isUnstarted ? (
                        <div className="unstarted-course-placeholder">
                          <div className="placeholder-icon">📚</div>
                          <p className="placeholder-text">No Course Work Yet</p>
                          <p className="placeholder-subtext">This course hasn't been started</p>
                        </div>
                      ) : (
                        <>
                          <Pie data={chartData} options={smallChartOptions} />
                          
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <button className="scroll-up-button" onClick={scrollToCourseCard}>
        <FontAwesomeIcon icon={faCaretUp} />
      </button>
    </div>
  );

};

export default CreationHodDashboard;
