import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from "axios";
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
        axios({
          // Endpoint to send files
          url: "http://localhost:8000/creation/departments",
          method: "POST",
          headers: {
              // Add any auth token here
              authorization: "your token comes here",
          },

          // Attaching the form data
          data:{"data":"hello"} ,
      })
          // Handle the response from backend here
          .then((res) => {
            console.log(res);
          })

          // Catch errors if any
          .catch((err) => {});

        console.log(data);

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
