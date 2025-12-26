import React, { useState, useEffect, useRef } from "react";
import { Pie } from "react-chartjs-2";
import api from '@/apiConfig';
import { useLocation } from "react-router-dom";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp } from "@fortawesome/free-solid-svg-icons";
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from '../../Handling/HandlingSidebar2/HandlingSidebar2.jsx';
import HandlingSupervisorDashboard from "../../Handling/Dashboard/SupervisorDashboard/SupervisorDashboard";
import "./Dashboard.css";
Chart.register(ArcElement, Tooltip, Legend);

const CreationSupervisorDashboard = () => {
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

  // Extraordinary Professional Chart Options - Small Charts with Doughnut Style (No Hover)
  const noHoverChartOptions = {
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
        enabled: false // Disable tooltips to prevent hover reactions
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
        hoverBorderWidth: 0, // No hover border
        hoverBorderColor: 'transparent',
        borderRadius: 8,
        hoverOffset: 0 // No hover offset
      }
    },
    cutout: '45%'
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
        const course = await api.post(
          "/api/department_courses",
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
        const progress = await api.post(
          "/api/all_department_overall_progress",
          {},
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        if ("overall_progress" in progress.data) {
          setOverallProgress(progress.data.overall_progress);
        } else {
          setOverallProgress([]);
        }
        console.log(overallProgress, "hiiiiiiiiiiiiiiiiiiiiiiiii");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedDepartment]);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const faculty = await api.post(
          "/api/faculty_info",
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
      const res = await api.post(
        "/api/course_progress",
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
            backgroundColor: color.map((c, idx) => {
              // Add gradient-like enhanced colors
              const enhancedColors = {
                '#4ade80': 'rgba(74, 222, 128, 0.95)',
                '#fbbf24': 'rgba(251, 191, 36, 0.95)',
                '#f87171': 'rgba(248, 113, 113, 0.95)',
                '#60a5fa': 'rgba(96, 165, 250, 0.95)',
                '#a78bfa': 'rgba(167, 139, 250, 0.95)',
                '#34d399': 'rgba(52, 211, 153, 0.95)',
                '#fb923c': 'rgba(251, 146, 60, 0.95)',
              };
              return enhancedColors[c] || c;
            }),
            borderWidth: 0,
            borderColor: 'transparent',
            hoverOffset: 25,
            hoverBorderWidth: 8,
            hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
            spacing: 6,
            offset: 10,
            borderRadius: 12
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
            backgroundColor: color.map((c, idx) => {
              // Add gradient-like enhanced colors
              const enhancedColors = {
                '#4ade80': 'rgba(74, 222, 128, 0.95)',
                '#fbbf24': 'rgba(251, 191, 36, 0.95)',
                '#f87171': 'rgba(248, 113, 113, 0.95)',
                '#60a5fa': 'rgba(96, 165, 250, 0.95)',
                '#a78bfa': 'rgba(167, 139, 250, 0.95)',
                '#34d399': 'rgba(52, 211, 153, 0.95)',
                '#fb923c': 'rgba(251, 146, 60, 0.95)',
              };
              return enhancedColors[c] || c;
            }),
            borderWidth: 0,
            borderColor: 'transparent',
            hoverOffset: 25,
            hoverBorderWidth: 8,
            hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
            spacing: 6,
            offset: 10,
            borderRadius: 12
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
              hoverBorderWidth: 6,
              hoverBorderColor: 'rgba(255, 255, 255, 0.9)',
              spacing: 5,
              offset: 8,
              borderRadius: 8
            },
          ],
          isUnstarted: isUnstarted
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
                  // maxHeight: "600px", // Keeps container small
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
                    <div className="overall-progress-chart">
                      <Pie
                        data={{
                          labels: item.creation.status_code,
                          datasets: [
                            {
                              label: "Overall Progress",
                              data: item.creation.count,
                              backgroundColor: item.creation.color.map((c, idx) => {
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
                              hoverBorderWidth: 6,
                              hoverBorderColor: 'rgba(255, 255, 255, 0.9)',
                              spacing: 5,
                              offset: 8,
                              borderRadius: 8
                            },
                          ],
                        }}
                        options={smallChartOptions}
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
                            (item.department_overall[0].count)
                          )}
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
          className={`HFTbutton-1 ${overallView === "creation" ? "selected" : ""}`}
          onClick={() => setOverallView("creation")}
        >
          Creation
        </button>
        <button
          className={`HFTbutton-1 ${overallView === "handling" ? "selected" : ""}`}
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
                <div className="course-selector ">
                  <div className="button-container">
                      <button
                        className={`HFTbutton-1 ${creationViewMode === "course" ? "selected" : ""}`}
                        onClick={() => setCreationViewMode("course")}
                      >
                        Course wise
                      </button>
                      <button
                        className={`HFTbutton-2 ${creationViewMode === "faculty" ? "selected" : ""}`}
                        onClick={() => setCreationViewMode("faculty")}
                      >
                        Faculty wise
                      </button>
                  </div>
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
                                <Pie data={MainChartData} options={modernChartOptions} />
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
                    {facultyList.length > 0 && (
                      <div className="faculty-list-container" ref={progressSectionRef}>
                        {facultyList.map((faculty) => (
                          <div
                            key={faculty.uid}
                            className={`faculty-card ${selectedCard === faculty.uid ? "selected" : ""}`}
                            onClick={async () => {
                              setSelectedCard(faculty.uid);
                              UpdateChart(faculty);
                            }}
                          >
                            <h3>{faculty.name}</h3>
                            <div className="card-details">
                              <p ref={courseSelectionRef}>Faculty ID: {faculty.uid}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    

                      {ChartData.length > 0 && <>
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
                                  <div className="placeholder-icon">�</div>
                                  <p className="placeholder-text">No Course Work Yet</p>
                                  <p className="placeholder-subtext">This course hasn't been started</p>
                                </div>
                              ) : (
                                <Pie data={chartData} options={smallChartOptions} />
                              )}
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
        <FontAwesomeIcon icon={faCaretUp} />
      </button>
    </div >
  );
};

export default CreationSupervisorDashboard;