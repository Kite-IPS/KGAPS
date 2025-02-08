import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar";
import HandlingSupervisorDashboard from "../../Handling/Dashboard/SupervisorDashboard/SupervisorDashboard";
Chart.register(ArcElement, Tooltip, Legend);

const CreationSupervisorDashboard = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [overallView, setOverallView] = useState("creation");
  const [selectedCard, setSelectedCard] = useState(0);
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState(1);
  const [selectedOption, setSelectedOption] = useState({});
  const [DomainCourses, setDomainCourses] = useState([]);
  const [overallProgress, setOverallProgress] = useState([]);
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
      try {
        const progress = await axios.post(
          "http://localhost:8000/api/all_department_overall_progress",
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        if ("overall_progress" in progress.data) {
          setOverallProgress(progress.data.overall_progress);
        } else {
          setOverallProgress([]);
        }
        console.log(overallProgress);
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
      setSelectedOption(selectedCourse);
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
  const yearMap = {
    1: "Freshman (1st Year)",
    2: "Sophomore (2nd Year)",
    3: "Junior (3rd Year)",
    4: "Senior (4th Year)",
  };
  return (
    <div>
      <HandlingSidebar />
      <div className="overall-progress-container">
        {overallProgress.map(
          (item) =>
            item.department_overall && (
              <>
                <div className="handlingfaculty-dashboard-aggregate">
                  <h1>Department of {departmentMap[item.department_id]}</h1>
                  {item.creation && (<>
                    <h3>Overall Course Materials</h3>
                    <div className="overall-progress-chart">
                      <Pie
                        data={{
                          labels: item.creation.status_code,
                          datasets: [
                            {
                              label: "Overall Progress",
                              data: item.creation.count,
                              backgroundColor: item.creation.color,
                            },
                          ],
                        }}
                      />
                    </div></>
                )}
                  <div className="handlingfaculty-dashboard-aggregate-content">
                    <p>
                      Overall Course Handling Progress :
                      {(item.department_overall[0].count == 0 && (
                        <span>0%</span>
                      )) ||
                        (item.department_overall[0].count > 0 && (
                          <span>
                            {(
                              (item.department_overall[0].count /
                                item.department_current[0].total_count) *
                              100
                            ).toFixed(0)}
                            %
                          </span>
                        ))}
                    </p>
                    <div className="handlingfaculty-dashboard-progressbar-horizontal">
                      <div
                        style={{
                          width: `${(
                            (item.department_overall[0].count /
                              item.department_overall[0].total_count) *
                            100
                          ).toFixed(0)}%`,
                          backgroundColor: "darkblue",
                        }}
                      />
                    </div>
                    <p>
                      Status:{" "}
                      {item.department_current[0].completed_hours -
                        item.department_current[0].total_hours >
                        0 && <span style={{ color: "red" }}>Delayed</span>}
                      {item.department_current[0].completed_hours -
                        item.department_current[0].total_hours <
                        0 && (
                        <span style={{ color: "lightgreen" }}>
                          Ahead of time
                        </span>
                      )}
                      {!item.department_current[0].completed_hours == null &&
                        item.department_current[0].completed_hours -
                          item.department_current[0].total_hours ===
                          0 && <span style={{ color: "green" }}>On time</span>}
                      {item.department_current[0].completed_hours == null &&
                        item.department_current[0].completed_hours -
                          item.department_current[0].total_hours ===
                          0 && (
                          <span style={{ color: "black" }}>
                            Not yet started
                          </span>
                        )}
                    </p>
                  </div>
                  <div className="handlingfaculty-dashboard-aggregate-content">
                    <p>
                      Overall Course Assessment Progress :
                      {(!item.assignment_data.avg_progress && (
                        <span>0%</span>
                      )) ||
                        (item.assignment_data.avg_progress > 0 && (
                          <span>
                            {item.assignment_data.avg_progress}
                            %
                          </span>
                        ))}
                    </p>
                    <div className="handlingfaculty-dashboard-progressbar-horizontal">
                      <div
                        style={{
                          width: `${item.assignment_data.avg_progress}%`,
                          backgroundColor: "darkblue",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )
        )}
      </div>
      <div>
        <button
          className="HFTbutton-1"
          onClick={() => setOverallView("creation")}
        >
          Creation
        </button>
        <button
          className="HFTbutton-1"
          onClick={() => setOverallView("handling")}
        >
          Handling
        </button>
      </div>
      {overallView === "creation" && (
        <>
          <h1>Creation Section</h1>
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

            {DomainCourses.length > 0 ? (
              MainChartData.labels.length > 0 ? (
                <>
                  {selectedOption && (
                    <h3>
                      Progress for {selectedOption.course_code} -{" "}
                      {selectedOption.course_name}
                    </h3>
                  )}
                  <div className="chart-grid">
                    <div className="chart-container">
                      <Pie data={MainChartData} />
                    </div>
                  </div>
                </>
              ) : (
                <h1>No progress yet</h1>
              )
            ) : null}
          </div>
        </>
      )}
      {overallView === "handling" && (
        <>
          <h1>Handling Section</h1>
          <div className="handling-container">
            <HandlingSupervisorDashboard />
          </div>
        </>
      )}
    </div>
  );
};

export default CreationSupervisorDashboard;
