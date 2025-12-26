import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import api from '@/apiConfig';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from '../../Handling/HandlingSidebar2/HandlingSidebar2.jsx';
import "./Dashboard.css";
Chart.register(ArcElement, Tooltip, Legend);

const CreationCCDashboard = () => {
  // Extraordinary Professional Chart Options - Main Charts
  const modernChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        align: 'center',
        labels: {
          padding: 25,
          font: {
            size: 14,
            family: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
            weight: '600'
          },
          color: '#1a202c',
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 16,
          boxHeight: 16,
          textAlign: 'center',
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
        borderWidth: 1,
        padding: {
          top: 8,
          bottom: 8,
          left: 10,
          right: 10
        },
        cornerRadius: 8,
        titleMarginBottom: 6,
        bodySpacing: 4,
        bodyFont: {
          size: 11,
          family: "'Poppins', 'Inter', sans-serif",
          weight: '500',
          lineHeight: 1.4
        },
        titleFont: {
          size: 12,
          weight: '600',
          family: "'Poppins', 'Inter', sans-serif"
        },
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 4,
        usePointStyle: true,
        caretSize: 6,
        caretPadding: 8,
        callbacks: {
          title: function(context) {
            return `📊 ${context[0].label}`;
          },
          label: function(context) {
            if (context.parsed !== null) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `Count: ${context.parsed} | ${percentage}%`;
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
        bottom: 60,
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
  const data = JSON.parse(sessionStorage.getItem('userData'));
  const [course, setCourse] = useState({});
  const [showStuff, setShowStuff] = useState(false);
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
  
  console.log(data);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseResponse = await api.post("/api/coordinator_courses", {
          uid: data.uid,
        });
        if (courseResponse.data) {
          setCourse(courseResponse.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const course = await api.post("/api/coordinator_courses", data, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log(course.data[0]);
        if (course) {
          const res = await api.post("/api/course_progress", course.data[0], {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (res.data.main.status_code.length > 0) {
            setShowStuff(true);
          }
          const response = res.data;
          const { status_code, count, color } = response.main;

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
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Run only once when the component mounts

  return (
    <div className="chf-grid-container" style={{ display: 'flex', gap: '5vw' }}>
      {windowWidth > 1500 ? <HandlingSidebar /> : <HandlingSidebar2 />}
      <div className="chf-dashboard-contents">
      
        {showStuff ? (
          <>
          <h3 style={{textAlign: 'center', margin: '40px 0 20px 0', fontSize: '20px', color: '#1e40af'}}>
            Progress for {data.name} (Faculty ID: {data.uid})
          </h3>
          <div className="chart-grid">
            <div className="chart-container">
              <Pie data={MainChartData} options={modernChartOptions} />
            </div>
          </div>
          </>
        ) : (
          <div
            style={{
              fontSize: '26px', 
              fontWeight: 'bold',
              color: '#FF6347', 
              textAlign: 'left', 
              marginTop: '50px',
              
            }}
          >
            No topics assigned...
          </div>
        )}
      </div>
    </div>
  );
};

export default CreationCCDashboard;
