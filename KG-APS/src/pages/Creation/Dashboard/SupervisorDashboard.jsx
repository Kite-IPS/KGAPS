import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

const CreationSupervisorDashboard = () => {
  const location = useLocation();
  const data = location.state;
  const [selectedOption, setSelectedOption] = useState({ course_code: 0, course_name: "CS1" });
  const [DomainCourses, setDomainCourses] = useState([]);
  const [MainChartData, setMainChartData] = useState({
    labels: ["Category A", "Category B", "Category C"],
    datasets: [
      {
        label: "Sample Pie Chart",
        data: [30, 50, 20],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const course = await axios.post("http://localhost:8000/api/domain_courses", data, {
          headers: { "Content-Type": "application/json" },
        });

        setDomainCourses(course.data);
        if (course.data.length > 0) {
          setSelectedOption(course.data[0]);
          await fetchChartData(course.data[0]); // Initial chart load
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSelectChange = (event) => {
    const selected = JSON.parse(event.target.value);
    setSelectedOption(selected);
  };

  const fetchChartData = async (selectedCourse) => {
    try {
      const res = await axios.post("http://localhost:8000/api/course_progress", selectedCourse, {
        headers: { "Content-Type": "application/json" },
      });

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

  const UpdateChart = async () => {
    console.log(selectedOption);
    await fetchChartData(selectedOption);
  };

  return (
    <div>
      <div className="login-form-wrapper">
        <select value={JSON.stringify(selectedOption)} onChange={handleSelectChange}>
          <option value="" disabled>Select an option</option>
          {DomainCourses.map((option, index) => (
            <option key={index} value={JSON.stringify(option)}>
              {option.course_name}
            </option>
          ))}
        </select>
        <button type="button" onClick={UpdateChart}>Get Details</button>
      </div>
      <h3>Progress</h3>
      <div style={{ width: "400px", height: "400px", marginBottom: "20px" }}>
        <Pie data={MainChartData} />
      </div>
    </div>
  );
};

export default CreationSupervisorDashboard;
