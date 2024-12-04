import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import HandlingSidebar from '../../Handling/HandlingSidebar/HandlingSidebar';
Chart.register(ArcElement, Tooltip, Legend);

const CreationHodDashboard = () => {
  const data = JSON.parse(sessionStorage.getItem('userData'));
  const [selectedCard, setSelectedCard]  = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [DomainCourses, setDomainCourses] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const course = await axios.post("http://localhost:8000/api/department_courses", data, {
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

  const UpdateChart = async (option) => {
    console.log(option);
    await fetchChartData(option);
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

  return (
    <div>
      <HandlingSidebar/>
      <div className="course-selector">
          <h1>Courses in department {departmentMap[data.department_id]}</h1>
              <label className="dropdown-label">
                Select a course to view progress:
              </label>
              <div className="cards-container">
                {DomainCourses.map((option, index) => (
                  <div
                    key={index}
                    className={`course-card ${
                      selectedCard === index ? "expanded" : ""
                    }`}
                    onClick={async () => {setSelectedCard(index);UpdateChart(option);}}
                  >
                    <h3>{option.course_name}</h3>
                    {selectedCard === index && (
                       <div className="card-details">
                       <p>Course Code: {option.course_code}</p>
                     </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <h3>Progress</h3>{MainChartData.labels.length > 0?
          (<div className="chart-grid">
            <div className="chart-container">
              <Pie data={MainChartData} />
            </div>
          </div>):(<h1>No progress yet</h1>)}
    </div>
  );
};

export default CreationHodDashboard;
