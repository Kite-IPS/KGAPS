import React, { useState,useEffect } from 'react';
import "../../Table.css";
import axios from 'axios';
import HandlingSidebar from '../HandlingSidebar/HandlingSidebar';



const HandlingHODTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedFaculty,setSelectedFaculty] = useState("");


  const [FacultyCourses, setFacultyCourses] = useState([]);
  const [faculty,setFaculty] =  useState([]);

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

  const handleLinkInput = (e, item) => {
    
  };

  const updateLink = async (key) => {
    try {
      const res = await axios.post("http://localhost:8000/api/editcomment", {
        topic_id: key,
        url: updatedLink,
      });
      if (res) {
        fetchTableData();
      }
    } catch (error) {
      console.error("Error updating link:", error);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const facultyResponse = await axios.post("http://localhost:8000/api/faculty_info", {
          department_id: data.department_id,
        });
        console.log(facultyResponse.data[0].uid);

        if (facultyResponse.data) {
          setFaculty(facultyResponse.data);
          if (facultyResponse.data.length > 0) {
            setSelectedFaculty(facultyResponse.data[0].uid);
            const courseResponse = await axios.post("http://localhost:8000/api/faculty_courses", {
              uid: facultyResponse.data[0].uid,
            });
            if (courseResponse.data) {
              setFacultyCourses(courseResponse.data);
              if (courseResponse.data.length > 0) {
                setSelectedOption(courseResponse.data[0]);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching faculty:", error);
      }
    };

    fetchCourses();
  }, []);

  const fetchTableData = async () => {
    if (!selectedOption) return;
    try {
      const res = await axios.post("http://localhost:8000/api/head_of_department", {
        handler_id:selectedFaculty,
        course_code: selectedOption.course_code,
      });
      if (res.data && !('response' in res.data)) {
        console.log(res.data);
        setTableData(res.data);
        const filtered = res.data.filter((item) => {
          if (viewMode === "upload") return !item.url && item.can_upload === 1;
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
        if (viewMode === "upload") return !item.url && item.can_upload === 1;
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
          Verify
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
            <th>Link</th>
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
                  {viewMode === "upload" && !item.url && item.can_upload === 1 ? (
                    <div className="link-input">
                      <input
                        type="text"
                        placeholder="Upload link"
                        onChange={(e) => handleLinkInput(e, item)}
                      />
                      <button onClick={() => updateLink(item.topic_id)}>Upload</button>
                    </div>
                  ) : item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  ) : (
                    <span>No Link Available</span>
                  )}
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

export default HandlingHODTable;
