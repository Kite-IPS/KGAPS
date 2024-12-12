import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar";
Chart.register(ArcElement, Tooltip, Legend);

const CreationSupervisorDashboard = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [selectedCard, setSelectedCard] = useState(0);
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState(1);
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
          "http://localhost:8000/api/department_courses",
          { department_id: selectedDepartment },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(course.data);
        setDomainCourses(course.data);
        if (course.data.length > 0) {
          await fetchChartData(course.data[0].courses[0]); // Initial chart load
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedDepartment]);

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
http://localhost:5173/creation/faculty/table
  return (
    <div>
      <HandlingSidebar />
      <div className="course-selector">
        <div className="department-selector">
          <label className="dropdown-label">Select a department:</label>
          <select onChange={(e) => setSelectedDepartment(e.target.value)}>
            {Object.keys(departmentMap).map((departmentKey) => (
              <option key={departmentKey} value={departmentKey}>
                {departmentMap[departmentKey]}
              </option>
            ))}
          </select>
        </div>
        <label className="dropdown-label">
          Select a course to view progress:
        </label>
        <div className="cards-container">
          {DomainCourses.length > 0 ? (
            DomainCourses.map((yearOption, yearIndex) => (
              <div key={yearIndex} className="year-section">
                <div
                  className={`year-card ${
                    selectedYear === yearIndex ? "expanded" : ""
                  }`}
                  onClick={async () => {
                    setSelectedYear(yearIndex);
                    setSelectedCard(0);
                  }}
                >
                  <h3>{yearMap[yearOption.year]}</h3>
                </div>
                {selectedYear === yearIndex && (
                  <div className="courses-container">
                    {yearOption.courses.map((courseOption, courseIndex) => (
                      <div
                        key={courseIndex}
                        className={`course-card ${
                          selectedCard === courseIndex ? "expanded" : ""
                        }`}
                        onClick={async () => {
                          setSelectedCard(courseIndex);
                          UpdateChart(courseOption);
                        }}
                      >
                        <h3>{courseOption.course_name}</h3>
                        {selectedCard === courseIndex && (
                          <div className="card-details">
                            <p>Course Code: {courseOption.course_code}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <h1>No courses yet</h1>
          )}
        </div>

        {DomainCourses.length>0?(MainChartData.labels.length > 0 ? (
        <>
        <h3>Progress</h3>
          <div className="chart-grid">
            <div className="chart-container">
              <Pie data={MainChartData} />
            </div>
          </div>
          </>
        ) : (
          <h1>No progress yet</h1>
        )):(null)}
      </div>
    </div>
  );
};

export default CreationSupervisorDashboard;
