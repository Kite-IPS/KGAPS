import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import HandlingSidebar from '../../Handling/HandlingSidebar/HandlingSidebar';
Chart.register(ArcElement, Tooltip, Legend);

const CreationFacultyDashboard = () => {
  const location = useLocation();
  const data = location.state;
  console.log(data);
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
            // Endpoint to send the request
            url: "http://localhost:8000/api/faculty_progress",
            method: "POST",
            headers: {
                'Content-Type': 'application/json',  
            },
            data: data,
          })
          .then((res) => {
            const response = res.data;
            console.log(response);
            const {status_code,count,color} = response.main;
            setChartData({
              labels: status_code,
              datasets: [
                {
                  label: "overall",
                  data: count,
                  backgroundColor: color,
                },
              ],
            });

          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          });

    } catch (error) {
        console.log(error);
        setError('Something went wrong. Please try again later.');
        clearErrorAfterTimeout();
    }
};
    fetchData();
  }, []); // Empty dependency array to run the effect once when the component mounts


  return (
    <div>
    <HandlingSidebar/>
    <div style={{ width: '400px', height: '400px' }}>
      <Pie data={chartData} />
      <h1>{data.name}</h1>
    </div>
    </div>
  );
};

export default CreationFacultyDashboard;
