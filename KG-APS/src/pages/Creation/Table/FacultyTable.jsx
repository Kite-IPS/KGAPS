import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../Table.css";
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar";

const CreationFacultyTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [updatedLink, setUpdatedLink] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [FacultyCourses, setFacultyCourses] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
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
        alert("Link updated successfully");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating link:", error);
    }
  };

  const handleApproval = async (key, action) => {
    try {
      const res = await axios.post("http://localhost:8000/api/approval", {
        topic_id: key,
        status: action,
      });
      if (res) {
        fetchTableData();
        alert(`Topic ${action === "approve" ? "approved" : "disapproved"}`);
      }
    } catch (error) {
      console.error(`Error in ${action} action:`, error);
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
      if (res.data && !("response" in res.data)) {
        console.log(res.data);
        setTableData(res.data);
        const filtered = res.data.filter((item) => {
          if (viewMode === "upload") return item.status_code < 3 && item.can_upload === 1;
          return true;
        });
        setFilteredData(filtered);
      } else {
        setTableData([]);
        setFilteredData([]);
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
        if (viewMode === "upload") return item.status_code < 3 && item.can_upload === 1;
        return true;
      })
    );
  }, [viewMode, tableData]);

  return (
    <div className="page-cover" style={{ display: "flex", gap: "5vw" }}>
      <HandlingSidebar />
      <div className="HFTtable-container">
        <div className="HFTbutton-group">
          <button className="HFTbutton-1" onClick={() => setViewMode("all")}>
            All contents
          </button>
          <button className="HFTbutton-2" onClick={() => setViewMode("upload")}>
            Upload/Edit
          </button>
          <select
            value={JSON.stringify(selectedOption)}
            onChange={handleSelectChange}
            style={{
              height: "8vh", // Adjust the width as needed
              padding: "5%", // Adjust padding for a compact look
            }}>
            <option value="" disabled>
              Select an option
            </option>
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
              <th style={{ textAlign: "center", verticalAlign: "middle" }} >Topic</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }} >Outcome</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }} >Status Code</th>
              {viewMode !== "upload" && <th style={{ textAlign: "center", verticalAlign: "middle" }} >Link</th>}
              {viewMode === "upload" && <th>Link Upload</th>}
              <th style={{ textAlign: "center", verticalAlign: "middle" }} >Approval</th>
              {viewMode === "upload" && <th style={{ textAlign: "center", verticalAlign: "middle" }} >Disapproval Message</th>}
            </tr>
          </thead>
          <tbody>
          {filteredData && filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr key={item.topic_id}>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>{item.topic}</td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>{item.outcome}</td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
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
                  
                {viewMode !== "upload" && (
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    {item.url ? (
                      <a
                        href={item.url}
                        style={{ textDecoration: "none" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      <span>No link</span>
                    )}
                  </td>
                )}
              
                {viewMode === "upload" && item.can_upload === 1 && (
                  <td>
                    <div className="link-input">
                      <input
                        type="text"
                        placeholder="Upload link"
                        onChange={(e) => handleLinkInput(e, item)}
                      />
                      <button onClick={() => updateLink(item.topic_id)}>Upload</button>
                    </div>
                  </td>
                )}
              
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  {item.status_code === 3 && (
                    <span style={{ color: "green", fontWeight: "bold", display: "block" }}>
                      Approved
                    </span>
                  )}
                  {item.status_code === 2 && (
                    <span style={{ color: "red", fontWeight: "bold", display: "block" }}>
                      Disapproved
                    </span>
                  )}
                  {item.status_code !== 2 && item.status_code !== 3 && (
                    <span style={{ color: "orange", fontWeight: "bold", display: "block" }}>
                      Awaiting Verification
                    </span>
                  )}
                </td>
                
                {viewMode === "upload" && (
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    {item.disapproval_message ? (
                      <span style={{ display: "block" }}>{item.disapproval_message}</span>
                    ) : (
                      <span style={{ display: "block" }}>No message</span>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={viewMode === "upload" ? 6 : 5} style={{ textAlign: "center" }}>
                No topics assigned yet.
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreationFacultyTable;