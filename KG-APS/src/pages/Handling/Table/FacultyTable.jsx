import React, { useState,useEffect } from 'react';
import "../../Table.css";
import axios from 'axios';
import HandlingSidebar from '../HandlingSidebar/HandlingSidebar';

const HandlingFacultyTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [updatedLink, setUpdatedLink] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [FacultyCourses, setFacultyCourses] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Initialize as an empty array
  const [viewMode, setViewMode] = useState("all");

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

  const handleLinkInput = (e, item) => {
    setUpdatedLink(e.target.value);
  };

  const updateLink = async (key) => {
    try {
      const res = await axios.post("http://localhost:8000/api/edithourscompleted", {
        topic_id: key,
        handler_id: data.uid,
        hours_completed: updatedLink,
      });
      if (res) {
        fetchTableData();
      }
    } catch (error) {
      console.error("Error updating hours:", error);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseResponse = await axios.post("http://localhost:8000/api/faculty_courses", {
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
      const res = await axios.post("http://localhost:8000/api/faculty", {
        uid: data.uid,
        course_code: selectedOption.course_code,
      });
      if (res.data && !('response' in res.data)) {
        console.log(res.data);
        const tableData = res.data.filter((item) => {return item.status_code>=3;});
        setTableData(tableData);
        const filtered = res.data.filter((item) => {
          if (viewMode === "upload") return item.status_code === 3;
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
        if (viewMode === "upload") return item.status_code === 3;
        return true;
      })
    );
  }, [viewMode, tableData]);

  return (
    <div className="page-cover" style={{display:'flex', gap:'5vw'}}>
      <HandlingSidebar />
    <div className="HFTtable-container">
      <div className="HFTbutton-group">
        <button className="HFTbutton-1" onClick={() => setViewMode("all")}>
          All contents
        </button>
        <button className="HFTbutton-2" onClick={() => setViewMode("upload")}>
          Declare
        </button>
         <select value={JSON.stringify(selectedOption)} onChange={handleSelectChange}>
        <option value="" disabled>Select an option</option>
        {FacultyCourses.map((option, index) => (
          <option key={index} value={JSON.stringify(option)}>
            {option.course_code + " - " + option.course_name}
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
                  {viewMode === "upload" && item.status_code === 3 ? (
                    <div className="link-input">
                      <input
                        type="text"
                        placeholder="Enter hours"
                        onChange={(e) => handleLinkInput(e, item)}
                      />
                      <button onClick={() => updateLink(item.topic_id)}>Submit</button>
                    </div>
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

export default HandlingFacultyTable;
