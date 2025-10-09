import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from "axios";
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from '../../Handling/HandlingSidebar2/HandlingSidebar2.jsx';
import "../../Table.css";
import "./Dashboard.css";

Chart.register(ArcElement, Tooltip, Legend);

const CreationFacultyDashboard = () => {
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
    maintainAspectRatio: true,
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
            return `📋 ${context[0].label}`;
          },
          label: function(context) {
            if (context.parsed !== null) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `Count: ${context.parsed} (${percentage}%)`;
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
        hoverBorderWidth: 4,
        hoverBorderColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 8,
        hoverOffset: 12
      }
    },
    cutout: '45%'
  };
  const data = JSON.parse(sessionStorage.getItem('userData')); 
  const [ChartData, setChartsData] = useState([]);
  const [MainChartData, setMainChartData] = useState({
    labels: [],
    datasets: [
      {
        label: '',
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
        const res = await axios({
          url: "http://localhost:8000/api/faculty_progress",
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          data: data,
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
            labels: isUnstarted ? ['Not Started'] : labels,
            courseCode: courseKey, // Store course code for title display
            datasets: [
              {
                label: `Progress for ${courseKey}`,
                data: isUnstarted ? [1] : dataValues,
                backgroundColor: isUnstarted ? ['rgba(226, 232, 240, 0.4)'] : backgroundColors,
              },
            ],
            isUnstarted: isUnstarted,
            statusData: Object.keys(courseData).map(statusKey => ({
              status: statusKey,
              count: courseData[statusKey][0],
              color: courseData[statusKey][1]
            }))
          };
        });
        console.log(chartConfigs);
        setChartsData(chartConfigs);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []); // Run only once when the component mounts

  return (
    <>
<div className="chf-grid-container">
  {windowWidth > 1500 ? <HandlingSidebar /> : <HandlingSidebar2 />}

  <div className="chf-dashboard-contents">
       {/* Faculty Information Title */}
    {data && (
      <div className="chf-faculty-header">
        <h2 className="chf-faculty-title">
          Faculty Dashboard - {data.name} 
          <span className="chf-faculty-id">(Faculty ID: {data.uid})</span>
        </h2>
      </div>
    )}
    
    {/* Centered Main Chart */}
    <div className="chf-overall-progress-section">
      <h3>Overall Progress</h3>
      <div className="chf-overall-progress-chart">
        <Pie data={MainChartData} options={modernChartOptions} />
      </div>
    </div>

    {/* Dynamically Aligned Sub Charts */}
    <div className="sub-progress-section">
      {ChartData.map((chartData, index) => (
        <div key={index} className="sub-progress-chart">
          <div className="chf-sub-chart-header">
            <h3 className="chf-sub-chart-title">
              Course: {chartData.courseCode}
            </h3>
            {data && (
              <p className="chf-sub-chart-faculty">
                Faculty: {data.name} (ID: {data.uid})
              </p>
            )}
          </div>
          
          {chartData.isUnstarted ? (
            <div className="unstarted-course-placeholder">
              <div className="placeholder-icon">📝</div>
              <p className="placeholder-text">No Course Work Yet</p>
              <p className="placeholder-subtext">This course hasn't been started</p>
            </div>
          ) : (
            <Pie data={chartData} options={smallChartOptions} />
          )}
        </div>
      ))}
    </div>
  </div>
</div>


    </>
  );
};

export default CreationFacultyDashboard;
