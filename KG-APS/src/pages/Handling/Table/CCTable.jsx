import React, { useState,useEffect } from 'react';
import "../../Table.css";
import HandlingSidebar from "../HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from '../HandlingSidebar2/HandlingSidebar2.jsx';
import axios, { Axios } from 'axios';

const HandlingCCTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [selectedOption, setSelectedOption] = useState(null);
  const [FacultyCourses, setFacultyCourses] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Initialize as an empty array
  const [tableView, setTableView] = useState("topics");
  const [assignmentTableData, setAssignmentTableData] = useState([]);
  const [resultTableData, setResultTableData] = useState([]);

  const getBoxColor = (status_code) => {
    switch (status_code) {
      case 3:
        return "white";
      case 4:
        return "orange";
      case 5:
        return "green";
      default:
        return "white";
    }
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
  
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseResponse = await axios.post("http://localhost:8000/api/handling_coordinator_courses", {
          uid: data.uid,
    
        });
        if (courseResponse.data) {
          setFacultyCourses(courseResponse.data);
          if (courseResponse.data.length > 0) {
            setSelectedOption(courseResponse.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const fetchTableData = async () => {
    if (!selectedOption) return;
    try {
      const res = await axios.post("http://localhost:8000/api/handling_faculty", {
        course_code: selectedOption.course_code,
        class_id: selectedOption.class_id,
      });
      if (res.data && !('response' in res.data)) {
        console.log(res.data);
        const filtered = res.data.filter((item) => {
         return item.status_code >= 3;
        });
        setFilteredData(filtered); 
      } else {
        setFilteredData([]); // Set to empty array if no data
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  const fetchAssignmentTableData = async () => {
    if (!selectedOption) return;
    try {
      const res = await axios.post("http://localhost:8000/api/handling_faculty_assignments", {
        course_code: selectedOption.course_code,
        class_id: selectedOption.class_id,
      });
      if (res.data && !('response' in res.data)) {
        console.log(res.data);
        setAssignmentTableData(res.data);
      } else {
        setAssignmentTableData([]);
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };
  const fetchResultTableData = async () => {
    if (!selectedOption) return;
    try {
      const res = await axios.post("http://localhost:8000/api/handling_faculty_results", {
        course_code: selectedOption.course_code,
        class_id: selectedOption.class_id,
      });
      if (res.data && !('response' in res.data)) {
        console.log(res.data);
        setResultTableData(res.data);
      } else {
        setResultTableData([]);
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  useEffect(() => {
    {tableView === "topics" && fetchTableData();}
    {tableView === "assignments" && fetchAssignmentTableData();}
    {tableView === "results" && fetchResultTableData();}
  }, [selectedOption,tableView]);

  const handleSelectChange = (event) => {
    const selected = JSON.parse(event.target.value);
    setSelectedOption(selected);
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
    1: "1st Year",
    2: "2nd Year",
    3: "3rd Year",
    4: "4th Year",
    };
  
  const sectionMap = {
    1: "A",
    2: "B"
  };

  const convertToClass = (item) => {
    const class_id = item.toString();
    return yearMap[class_id[1]]+" - "+departmentMap[class_id[0]]+" "+sectionMap[class_id[2]];
  };

  return (
    <div className="HFTgrid-container" style={{ display: 'flex' }}>
      {windowWidth > 1500 ? <HandlingSidebar /> : <HandlingSidebar2 />}
    <div className="HFTtable-container">
    <div className="HFTbutton-group">
        <button className="HFTbutton-1">
          All contents
        </button>
        <select value={JSON.stringify(selectedOption)} onChange={handleSelectChange}>
          <option value="" disabled>Select an option</option>
          {FacultyCourses.map((option, index) => (
            <option key={index} value={JSON.stringify(option)}>
              {option.course_code + " - " + option.course_name + " - " + convertToClass(option.class_id)}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display:"flex" }}>
        <button className={`HFTbutton-1 ${tableView === "topics" ? "selected" : ""}`} onClick={() => setTableView("topics")}>
          Topics
        </button>
        <button className={`HFTbutton-2 ${tableView === "assignments" ? "selected" : ""}`} onClick={() => setTableView("assignments")}>
          Assessments
        </button>
        <button className={`HFTbutton-2 ${tableView === "results" ? "selected" : ""}`} onClick={() => setTableView("results")}>
          Results
        </button>
      </div>
      {tableView==="topics" &&<table>
        <thead>
          <tr>
            <th>Topic</th>
            <th>Outcome</th>
            <th>Status Code</th>
            <th>Hours to complete</th>
          </tr>
        </thead>
        <tbody>
          {filteredData && filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr key={item.topic_id}>
                <td>{item.topic}</td>
                <td>{item.outcome}</td>
                <td style={{ justifyContent: "center", alignItems: "center" }}>
                  <span
                    className="HFTbox"
                    style={{
                      display: "inline-block",
                      width: "20px",
                      height: "20px",
                      backgroundColor: getBoxColor(item.status_code),
                    }}
                  ></span>
                </td>
                <td>
                   { item.status_code === 4 ? (
                    <p>{"declared :"+item.hours_completed+" alloted :"+item.total_hours}</p>
                  ) : item.status_code <4?(
                    <span>Not declared yet</span>
                  ):(<span>Completed</span>)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>No topics assigned yet.</td>
            </tr>
          )}
        </tbody>
      </table>}
      {tableView === "assignments" && <table>
        <thead>
          <tr>
            <th>Assignment</th>
            <th>link</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
        {assignmentTableData && assignmentTableData.length > 0 ? (
            assignmentTableData.map((item) => (
        <tr key={item.assignment_id}>
                <td>{item.assignment}</td>
                <td><a href={item.link}
                target="_blank"
                rel="noopener noreferrer">View</a></td>
                <td>{item.progress}</td>
          </tr>))):(<tr><td colSpan={4} style={{ textAlign: "center" }}>No assignments alloted</td></tr>)}
          </tbody></table>}
          {tableView === "results" && <table>
        <thead>
          <tr>
            <th>Result</th>
            <th>link</th>
            <th>Pass Percentage</th>
          </tr>
        </thead>
        <tbody>
        {resultTableData && resultTableData.length > 0 ? (
            resultTableData.map((item) => (
        <tr key={item.result_id}>
                <td>{item.result}</td>
                <td><a href={item.link}
                target="_blank"
                rel="noopener noreferrer">View</a></td>
                <td>{item.pass_percentage}</td>
                </tr>))):(<tr><td colSpan={4} style={{ textAlign: "center" }}>No assignments alloted</td></tr>)}
          </tbody></table>}
    </div>
    </div>
  );
};

export default HandlingCCTable;
