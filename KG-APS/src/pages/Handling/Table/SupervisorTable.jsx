import React, { useState,useEffect } from 'react';
import "../../Table.css";
import HandlingSidebar from "../HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from '../HandlingSidebar2/HandlingSidebar2.jsx';
import axios from 'axios';

const HandlingSupervisorTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [department_id, setDepartment_id] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [FacultyCourses, setFacultyCourses] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
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
        if (selectedClass) {
          const courseResponse = await axios.post(
            "http://localhost:8000/api/handling_department_courses",
            {
              class_id: selectedClass,
            }
          );
          if (courseResponse.data.length>0) {
            console.log(courseResponse.data[0].courses);
            setFacultyCourses(courseResponse.data[0].courses);
            setSelectedOption(courseResponse.data[0].courses[0]);
          }else{
            setFacultyCourses([]);
            setSelectedOption("");
            alert("No courses found for the selected class");
            setSelectedClass("");
          }
        }
      } catch (error) {
        console.error("Error fetching faculty:", error);
      }
    };

    fetchCourses();
  }, [selectedClass]);

  const fetchTableData = async () => {
    if (!selectedOption) return;
    console.log(selectedOption);
    try {
      const res = await axios.post("http://localhost:8000/api/handling_faculty", {
        course_code: selectedOption.course_code,
        class_id: selectedClass,
      });
      if (res.data && !("response" in res.data)) {
        console.log(res.data);
        const filtered = res.data.filter((item) => {
         return item.status_code>=3;
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
        class_id: selectedClass,
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
        class_id: selectedClass,
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

  useEffect(() => {
    const resetData = () => {
      setFilteredData([]);
      setAssignmentTableData([]);
    };
    resetData();}
    ,[selectedClass]);
  useEffect(() => {
      const resetAllData = () => {
        setFilteredData([]);
        setAssignmentTableData([]);
        setSelectedClass("");
        setSelectedOption("");
        setFacultyCourses([]);
      };
      resetAllData();}
      ,[department_id]);
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

  const classMap = {
    6:{
      111: "1st year - CSE A",
      112: "1st year - CSE B",
      211: "1st year - AI & DS A",
      212: "1st year - AI & DS B",
      311: "1st year - ECE A",
      312: "1st year - ECE B",
      411: "1st year - CSBS",
      511: "1st year - IT",
      711: "1st year - MECH",
      811: "1st year - CYS",
      911: "1st year - AI & ML",
    },
    1:{
      111: "1st year - CSE A",
      112: "1st year - CSE B",
      121: "2nd year - CSE A",
      122: "2nd year - CSE B",
      131: "3rd year - CSE A",
      132: "3rd year - CSE B",
      141: "4th year - CSE A",
      142: "4th year - CSE B",
    },
    2:{
      211: "1st year - AI & DS A",
      212: "1st year - AI & DS B",
      221: "2nd year - AI & DS A",
      222: "2nd year - AI & DS B",
      231: "3rd year - AI & DS A",
      232: "3rd year - AI & DS B",
      241: "4th year - AI & DS A",
      242: "4th year - AI & DS B",
    },
    3:{
      311: "1st year - ECE A",
      312: "1st year - ECE B",
      321: "2nd year - ECE A",
      322: "2nd year - ECE B",
      331: "3rd year - ECE A",
      332: "3rd year - ECE B",
      341: "4th year - ECE A",
      342: "4th year - ECE B",
    },
    4:{
      411: "1st year - CSBS",
      421: "2nd year - CSBS",
      431: "3rd year - CSBS",
      441: "4th year - CSBS",
    },
    5:{
      511: "1st year - IT",
      521: "2nd year - IT",
      531: "3rd year - IT",
      541: "4th year - IT",
    },
    7:{
      711: "1st year - MECH",
      721: "2nd year - MECH",
      731: "3rd year - MECH",
      741: "4th year - MECH",
    },
    8:{
      811: "1st year - CYS",
      821: "2nd year - CYS",
      831: "3rd year - CYS",
      841: "4th year - CYS",
    },
    9:{
      911: "1st year - AI & ML",
      921: "2nd year - AI & ML",
      931: "3rd year - AI & ML",
      941: "4th year - AI & ML",
    }
  };


  return (
    <div className="HFTtable-container" style={{ display: 'flex' }}>
      {windowWidth > 1500 ? <HandlingSidebar /> : <HandlingSidebar2 />}
      <div>
      <div className="HFTbutton-group">
          <button className="HFTbutton-1" style={{ width:"50%" }}>
            All contents
          </button>
          <select onChange={(e) => setDepartment_id(e.target.value)}>
            {Object.keys(departmentMap).map((departmentKey) => (
              <option key={departmentKey} value={departmentKey}>{departmentMap[departmentKey]}</option>
            ))}
          </select>
          <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); }}>
            <option value="" disabled>Select Class</option>
            {Object.keys(classMap[department_id]).map((key) => (
              <option key={key} value={key}>{classMap[department_id][key]}</option>
            ))}
          </select>
          <select value={JSON.stringify(selectedOption)} onChange={handleSelectChange}>
            <option value="" disabled>Select an option</option>
            {FacultyCourses.map((option, index) => (
              <option key={index} value={JSON.stringify(option)}>
                {option.course_code + " - " + option.course_name + " - " + option.handler_name}
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
        {tableView==="topics" && <table>
          <thead>
            <tr>
              <th>Topic</th>
              <th>Outcome</th>
              <th>Status Code</th>
            </tr>
          </thead>
          <tbody>
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.topic_id}>
                  <td>{item.topic}</td>
                  <td>{item.outcome}</td>
                  <td
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  No topics assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>}{tableView === "assignments" && <table>
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

export default HandlingSupervisorTable;
