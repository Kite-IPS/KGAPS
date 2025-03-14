import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from "axios";
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from '../../Handling/HandlingSidebar2/HandlingSidebar2.jsx';
import "../../Table.css";

Chart.register(ArcElement, Tooltip, Legend);

const CreationFacultyDashboard = () => {
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
    {/* Centered Main Chart */}
    <div className="chf-overall-progress-section">
      <h3>Overall Progress</h3>
      <div className="chf-overall-progress-chart">
        <Pie data={MainChartData} />
      </div>
    </div>

    {/* Dynamically Aligned Sub Charts */}
    <div className="chf-sub-progress-section">
      {ChartData.map((chartData, index) => (
        <div key={index} className="chf-sub-progress-chart">
          <h3>{chartData.datasets[0].label}</h3>
          <Pie data={chartData} />
        </div>
      ))}
    </div>
  </div>
</div>


    </>
  );
};

export default CreationFacultyDashboard;
