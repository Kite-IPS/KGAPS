import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar";
Chart.register(ArcElement, Tooltip, Legend);

const CreationSupervisorDashboard = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [departments, setDepartments] = useState([]);
  const [selectedOption, setSelectedOption] = useState();
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
        const course = await axios.post(
          "http://localhost:8000/api/supervisor_courses",
          data,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(course.data);
        setDomainCourses(course.data);
        if (course.data.length > 0) {
          setSelectedOption(course.data[0]);
          setDepartments(course.data);
          console.log(course.data[0].courses[0]);
          await fetchChartData(course.data[0].courses[0]); // Initial chart load
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);



  const fetchChartData = async (selectedCourse) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/course_progress",
        selectedCourse,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

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


  return (
    <div>
      <HandlingSidebar />
      <div>
        {departments.map((department) => (
          <div key={department.department_id} className="department-section">
            <h2>{department.department_name}</h2>
            <div className="cards-container">
              {department.courses.map((course, index) => (
                <div
                  key={index}
                  className={`course-card ${
                    selectedOption?.course_code === course.course_code
                      ? "expanded"
                      : ""
                  }`}
                  onClick={async () => {
                    setSelectedOption(course);
                    await fetchChartData(course); // Update chart on card click
                  }}
                >
                  <h3>{course.course_name}</h3>
                  {selectedOption?.course_code === course.course_code && (
                    <div className="card-details">
                      <p>Course Code: {course.course_code}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
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

export default CreationSupervisorDashboard;
