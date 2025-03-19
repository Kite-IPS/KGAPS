import React, { useState,useEffect } from 'react';
import "../../Table.css";
import axios from 'axios';
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from '../../Handling/HandlingSidebar2/HandlingSidebar2.jsx';
import HandlingSupervisorTable from '../../Handling/Table/SupervisorTable';


const CreationSupervisorTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [selectedOption, setSelectedOption] = useState(null);
  const [overallView,setOverallView] = useState("creation");
  const [selectedYear, setSelectedYear] = useState(0);
  const [courseList,setCourseList] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(1);
  const [FacultyCourses, setFacultyCourses] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Initialize as an empty array
  const [viewMode, setViewMode] = useState("all");


  const getBoxColor = (status_code) => {
    switch (status_code) {
      case 0:
        return "white";
      case 1:
        return "orange";
      case 2:
        return "red";
      case 3:
        return "green";
      default:
        return "white";
    }
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
    0: "Freshman (1st Year)",
    1: "Sophomore (2nd Year)",
    2: "Junior (3rd Year)",
    3: "Senior (4th Year)",
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
        const courseResponse = await axios.post("http://localhost:8000/api/department_courses",{ department_id: selectedDepartment });
        if (courseResponse.data) {
          setCourseList(courseResponse.data); 
          if (courseResponse.data.length > 0) {
            setSelectedOption(courseResponse.data[0].courses[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [selectedDepartment]);

  useEffect(() => {
    if('response' in courseList) {alert("No courses available for this department yet");window.location.reload();};
    if(courseList.length === 0 || 'response' in courseList) {
      setFacultyCourses([]);
      return;}
    var filteredCourse = courseList.filter((item)=>{
      if(item.year==parseInt(selectedYear)+1) return item;
    });
    var year = selectedYear;
    while(filteredCourse.length === 0 && year<=4){
      year++;
      filteredCourse = courseList.filter((item)=>{
        if(item.year==parseInt(year)+1) return item;
      });
    };
    setSelectedYear(year);
    setFacultyCourses(filteredCourse[0].courses);
    setSelectedOption(filteredCourse[0].courses[0]);}
    ,[courseList,selectedYear]);

  const fetchTableData = async () => {
    if (!selectedOption) return;
    try {
      const res = await axios.post("http://localhost:8000/api/head_of_department", {
        course_code: selectedOption.course_code,
      }); 
      if (res.data && !('response' in res.data)) {
        setTableData(res.data);
        const filtered = res.data.filter((item) => {
          if (viewMode === "upload") return item.status_code===2 || item.status_code===1;
          return true;
        });
        setFilteredData(filtered); 
      } else {
        setTableData([]);
        setFilteredData([]); // Set to empty array if no data
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [selectedOption]);

  const handleSelectChange = (event) => {
    const selected = JSON.parse(event.target.value);
    setSelectedOption(selected);
  };

  useEffect(() => {
    setFilteredData(
      tableData.filter((item) => {
        if (viewMode === "upload") return item.status_code===2 || item.status_code===1;
        return true;
      })
    );
  }, [viewMode, tableData]);

  return (
    <div className="HFTgrid-container" style={{ display: 'flex' }}>
      {windowWidth > 1500 ? <HandlingSidebar /> : <HandlingSidebar2 />}
      <div style={{display:"flex",height:"50%"}}>
        <button className="HFTbutton-1" onClick={()=>setOverallView("creation")}>Creation</button>
        <button className="HFTbutton-1" onClick={()=>setOverallView("handling")}>Handling</button>
      </div>
    {overallView==="creation" && <div className="HFTtable-container">
      <div className="HFTbutton-group">
        <button className="HFTbutton-1" onClick={() => setViewMode("all")}>
          All contents
        </button>
        <select value={selectedDepartment} onChange={((e)=> {setSelectedYear(0);setSelectedDepartment(e.target.value);})}>
          <option value="" disabled>Select An option</option>
          {Object.keys(departmentMap).map((department,index)=>(
            <option key={index} value={department}>{departmentMap[department]}</option>
          ))}
        </select>
        <select value={selectedYear} onChange={((e)=> {setSelectedYear(e.target.value);})}>
          <option value="" disabled>Select An option</option>
          {Object.keys(courseList).map((year,index)=>(
            <option key={index} value={year}>{yearMap[year]}</option>
          ))}
        </select>
         <select value={JSON.stringify(selectedOption)} onChange={handleSelectChange}>
        <option value="" disabled>Select an option</option>
        {FacultyCourses.map((option, index) => (
          <option key={index} value={JSON.stringify(option)}>
            {option.course_code + " - " + option.course_name}
          </option>
        ))}
      </select>
      </div>

      <table style={{ width: '100%', textAlign: 'center' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>Topic</th>
            <th style={{ textAlign: 'center' }}>Outcome</th>
            <th style={{ textAlign: 'center' }}>Status Code</th>
            <th style={{ textAlign: 'center' }}>Link</th>
            <th style={{ textAlign: 'center' }}>Comment</th>
          </tr>
        </thead>
        <tbody>
          {filteredData && filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr key={item.topic_id}>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{item.topic}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{item.outcome}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
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
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  {item.url ? (
                    <a href={item.url} style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  ) : (
                    <span>No Link Available</span>
                  )}
                </td>
                <td>
                  {item.comment ? (
                    <span>{item.comment}</span>
                  ) : (
                    <span>No Comment</span>)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', verticalAlign: 'middle' }}>No topics assigned yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>}{
      overallView==="handling" && <HandlingSupervisorTable />
    }
    </div>
  );
};

export default CreationSupervisorTable;
