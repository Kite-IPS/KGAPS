import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const [chartData, setChartData] = useState({
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
        // Replace with your actual API call
        const response = await fetch('YOUR_API_ENDPOINT');
        const data = await response.json();

        // Process and update chart data
        setChartData({
          labels: data.labels, // Assume your API returns labels
          datasets: [
            {
              label: data.label,  // Assume your API returns a label for the dataset
              data: data.values,  // Assume your API returns the data values
              backgroundColor: data.colors,  // Assume your API returns colors
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run the effect once when the component mounts


  return (
    <div style={{ width: '400px', height: '400px' }}>
      <Pie data={chartData} />
    </div>
  );
};

export default PieChart;
