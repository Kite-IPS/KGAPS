import React, { useEffect, useState } from 'react';
import "../../Table.css";
import HandlingSidebar from '../HandlingSidebar/HandlingSidebar';
import axios from 'axios';

const HandlingDMTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [comment, setComment] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedYear, setSelectedYear] = useState(0);
  const [courseList, setCourseList] = useState([]);
  const [FacultyCourses, setFacultyCourses] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Initialize as an empty array
  const [viewMode, setViewMode] = useState("all");

  const handleApproval = async (topic_id) => {
    try {
      const res = await axios.post("http://localhost:8000/api/editcomment/1", {
        topic_id,
        status: "approved",
      });
      if (res.status === 200) {
        alert("Topic approved successfully.");
        fetchTableData(); // Refresh table
      }
    } catch (error) {
      console.error("Error approving topic:", error);
    }
  };

  const handleDisapproval = async (topic_id) => {
    const message = prompt("Please enter a reason for disapproval:");
    if (message) {
      try {
        const res = await axios.post("http://localhost:8000/api/editcomment/0", {
          topic_id,
          status: "disapproved",
          comment: message,
        });
        if (res.status === 200) {
          alert("Topic disapproved with comment.");
          fetchTableData(); // Refresh table
        }
      } catch (error) {
        console.error("Error disapproving topic:", error);
      }
    } else {
      alert("Disapproval cancelled.");
    }
  };

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
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseResponse = await axios.post("http://localhost:8000/api/handling_domain_courses", {
          domain_id: data.domain_id,
        });
        if (courseResponse.data) {
          console.log(courseResponse.data);
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
  }, []);

  useEffect(() => {
    if (!courseList.length > 0) return;
    console.log(selectedYear);
    const filteredCourse = courseList.filter((item) => {
      if (item.year == parseInt(selectedYear) + 1) return item;
    });
    setFacultyCourses(filteredCourse[0].courses);
    setSelectedOption(filteredCourse[0].courses[0]);
  }, [courseList, selectedYear]);

  const fetchTableData = async () => {
    if (!selectedOption) return;
    try {
      const res = await axios.post("http://localhost:8000/api/handling_domain_mentor", {
        domain_id: data.domain_id,
        course_code: selectedOption.course_code,
        class_id: selectedOption.class_id,
      });
      if (res.data && !('response' in res.data)) {
        setTableData(res.data);
        const filtered = res.data.filter((item) => {
          if (viewMode === "upload") return item.status_code === 2 || item.status_code === 1;
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
        if (viewMode === "upload") return item.status_code === 2 || item.status_code === 1;
        return true;
      })
    );
  }, [viewMode, tableData]);

  const yearMap2 = {
    0: "Freshman (1st Year)",
    1: "Sophomore (2nd Year)",
    2: "Junior (3rd Year)",
    3: "Senior (4th Year)",
  };

  return (
    <div className="page-cover" style={{ display: 'flex', gap: '5vw' }}>
      <HandlingSidebar />
      <div className="HFTtable-container">
        <div className="HFTbutton-group">
          <button className="HFTbutton-1" onClick={() => setViewMode("all")}>
            All contents
          </button>
          <select value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); }}>
            <option value="" disabled>Select An option</option>
            {Object.keys(courseList).map((year, index) => (
              <option key={index} value={year}>{yearMap2[year]}</option>
            ))}
          </select>
          <select value={JSON.stringify(selectedOption)} onChange={handleSelectChange}>
        <option value="" disabled>Select an option</option>
        {FacultyCourses.map((option, index) => (
          <option key={index} value={JSON.stringify(option)}>
            {option.course_code + " - " + option.course_name + " - " + convertToClass(option.class_id)}
          </option>
        ))}
      </select>
      </div>

      <table>
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
                  {viewMode === "upload" && item.status_code === 3 && editedIndex===item.topic_id? (
                    <div className="link-input">
                      <input
                        type="number"
                        placeholder="Enter hours"
                        onChange={(e) => handleLinkInput(e, item)}
                      />
                      <button className="HFTbutton-1" onClick={() => updateHours(item.topic_id)}>Submit</button>
                      <button className="HFTbutton-1" onClick={() => setEditedIndex(null)}>Cancel</button>

                    </div>
                  ) :viewMode=== "upload" && item.status_code === 3 ?(
                    <button className="HFTbutton-1" onClick={() => setEditedIndex(item.topic_id)}>Edit</button>
                   ) : item.status_code === 4 ? (
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
      </table>
    </div>
    
    </div>
  );
};

export default HandlingDMTable;
