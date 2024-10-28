import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

const CreationFacultyDashboard = () => {
  const location = useLocation();
  const data = location.state;
  
  const [ChartData, setChartsData] = useState([]);
  const [MainChartData, setMainChartData] = useState({
    labels: ["Category A", "Category B", "Category C"],
    datasets: [
      {
        label: 'Sample Pie Chart',
        data: [30, 50, 20],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  });

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
    <div>
      <h3>Progress</h3>
      <div style={{ width: '400px', height: '400px', marginBottom: '20px' }}>
        <Pie data={MainChartData} />
      </div>
    </div>
  );
};

export default CreationFacultyDashboard;
