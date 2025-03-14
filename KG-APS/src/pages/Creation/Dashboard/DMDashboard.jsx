import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar";
import "./Dashboard.css";

Chart.register(ArcElement, Tooltip, Legend);

const CreationDMDashboard = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [DomainCourses, setDomainCourses] = useState([]);
  const [selectedCard, setSelectedCard] = useState(0);
  const [MainChartData, setMainChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "No Data to show",
        data: [],
        backgroundColor: [],
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const course = await axios.post(
          "http://localhost:8000/api/domain_courses",
          data,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setDomainCourses(course.data);
        if (course.data.length > 0) {
          setSelectedOption(course.data[0].courses[0]);
          await fetchChartData(course.data[0].courses[0]);
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
      console.log(res.data);
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
  const yearMap = {
    1: "Freshman (1st Year)",
    2: "Sophomore (2nd Year)",
    3: "Junior (3rd Year)",
    4: "Senior (4th Year)",
    };

  const domainMap = {
    1:"PROGRAMMING",
    2:"DATA SCIENCE",
    3:"ELECTRONICS",
  };
  return (
    <>
      <HandlingSidebar className="custom-sidebar-class"/>
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="">
            <div className="course-selector">
              <h1 style={{marginTop:"70px"}}>Domain Mentor Dashboard - {domainMap[data.domain_id]}</h1>
              {DomainCourses.length > 0 ?(
                <>
                <label className="dropdown-label">
                Select a course to view progress:
              </label>
              <div className="cards-container">
                {DomainCourses.map((yearOption, yearIndex) => (
                  <div key={yearIndex} className="year-section">
                    <div
                      className={`year-card ${
                        selectedYear === yearIndex ? "expanded" : ""
                      }`}
                      onClick={async () => {setSelectedYear(yearIndex);setSelectedCard(0);}}
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
                              setSelectedOption(courseOption);
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
                ))}
              </div></>):(<h1>No courses available</h1>)}
            </div>
          </div>
          
          {MainChartData.labels.length > 0 ? (<>
            <h3>Progress for {selectedOption.course_code} - {selectedOption.course_name}</h3>
            <div className="chart-grid">
              <div className="chart-container">
                <Pie data={MainChartData} />
              </div>
            </div></>
          ) : (
            selectedOption.course_code && (<h1>No progress yet</h1>)
          )}
        </div>
      </div>
    </>
  );
};

export default CreationDMDashboard;
