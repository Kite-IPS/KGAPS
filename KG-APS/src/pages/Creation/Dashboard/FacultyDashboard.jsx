import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from "axios";
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import HandlingSidebar from '../../Handling/HandlingSidebar/HandlingSidebar';
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
    <div className="page-cover" style={{display:'flex', gap:'5vw'}}>
      <HandlingSidebar />
      <div>
        <h3>Overall Progress</h3>
        <div style={{ width: '400px', height: '400px', marginBottom: '20px' }}>
          <Pie data={MainChartData} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {ChartData.map((chartData, index) => (
            <div key={index} style={{ width: '200px', height: '200px' }}>
              <h3>{chartData.datasets[0].label}</h3>
              <Pie data={chartData} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreationFacultyDashboard;
