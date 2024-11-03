import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../Table.css";

const CreationFacultyTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [updatedLink, setUpdatedLink] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
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

  const handleLinkInput = (e, item) => {
    setUpdatedLink(e.target.value);
  };

  const updateLink = async (key) => {
    try {
      const res = await axios.post("http://localhost:8000/api/editlink", {
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
    <div className="HFTtable-container">
     
      <div className="HFTbutton-group">
        <button className="HFTbutton-1" onClick={() => setViewMode("all")}>
          All contents
        </button>
        <button className="HFTbutton-2" onClick={() => setViewMode("upload")}>
          To upload
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
  );
};

export default CreationFacultyTable;

