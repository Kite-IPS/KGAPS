import React, { useState, useEffect } from 'react';
import "../../Table.css";
import api from '@/apiConfig';
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from '../../Handling/HandlingSidebar2/HandlingSidebar2.jsx';
import CreationTopicAddForm from './CCAddTopicForm';

const CreationCCTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [updatedLink, setUpdatedLink] = useState("");
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Initialize as an empty array
  const [viewMode, setViewMode] = useState("all");
  const [course, setCourse] = useState({});
  const [editedIndex, setEditedIndex] = useState(null);

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

  const handleLinkInput = (e, item) => {
    setUpdatedLink(e.target.value);
  };

  const updateLink = async (key) => {
    const isValid = await checkLinkStructure(updatedLink);
    if (isValid) {
      try {
        const res = await api.post("/api/editlink", {
          topic_id: key,
          url: updatedLink,
        });
        if (res) {
          fetchTableData();
          alert("Link updated successfully");
          setUpdatedLink("");
          window.location.reload();
        }
      } catch (error) {
        console.error("Error updating link:", error);
      }
    } else {
      alert("Invalid URL");
      setUpdatedLink("");
    }
  };

  const checkLinkStructure = async (link) => {
    try {
      new URL(link); // Throws an error if the URL is invalid
      return true;
    } catch (error) {
      return false;
    }
  };

  const fetchTableData = async () => {
    try {
      const res = await api.post("/api/course_mentor", {
        uid: data.uid,
      });
      const res2 = await api.post("/api/coordinator_courses", {
        uid: data.uid,
      });
      const courseData = res2.data[0];
      setCourse(courseData);
      console.log(res2.data);
      if (res.data && !('response' in res.data)) {
        setTableData(res.data);
        const filtered = res.data.filter((item) => {
          if (viewMode === "upload") return item.status_code <3;
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
    setFilteredData(
      tableData.filter((item) => {
        if (viewMode === "upload") {
          // Include topics that are either disapproved (status_code === 2) or can be uploaded (status_code < 3 and can_upload === 1)
          return item.status_code < 3;
        }
        return true; // For "all" view mode, include all items
      })
    );
    console.log(filteredData);
  }, [viewMode, tableData]);

  useEffect(() => {
    fetchTableData();
  }, []);

  return (
    <div className="HFTgrid-container" style={{ display: 'flex' }}>
    {windowWidth > 1500 ? <HandlingSidebar /> : <HandlingSidebar2 />}
      {course && (
        <>
          <CreationTopicAddForm />
          <div className="HFTtable-container">
            <h1>{course.course_code + " - " + course.course_name}</h1>
            <div className="HFTbutton-group">
              <button className="HFTbutton-1" onClick={() => setViewMode("all")}>
                All contents
              </button>
              <button className="HFTbutton-2" onClick={() => setViewMode("upload")}>
                Upload/Edit
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Topic</th>
                  <th style={{ textAlign: "center", verticalAlign: " middle" }}>Outcome</th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Status Code</th>
                  {viewMode !== "upload" && <th style={{ textAlign: "center", verticalAlign: "middle" }}>Link</th>}
                  {viewMode === "upload" && <th>Link Upload</th>}
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Approval</th>
                  {viewMode === "upload" && <th style={{ textAlign: "center", verticalAlign: "middle" }}>Disapproval Message</th>}
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
                      {viewMode === "upload" && editedIndex === item.topic_id && (
                        <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                          <div className="link-input">
                            <input
                              type="text"
                              placeholder="Upload link"
                              onChange={(e) => handleLinkInput(e, item)}
                              style={{ width: '350px', padding: '5px', boxSizing: 'border-box' }}
                            />
                            <button className="dynamic-button" onClick={() => updateLink(item.topic_id)}>Upload</button>
                            <button className="dynamic-button" onClick={() => setEditedIndex(null)}>Cancel</button>
                          </div>
                        </td>
                      )}
                      {viewMode === "upload" && item.status_code>0 && editedIndex !== item.topic_id && (
                        <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                          <button className="dynamic-button" onClick={() => setEditedIndex(item.topic_id)}>Edit</button>
                        </td>
                      )}
                      {viewMode === "upload" && item.status_code===0 && editedIndex !== item.topic_id && (
                        <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                          <button className="dynamic-button" onClick={() => setEditedIndex(item.topic_id)}>Upload</button>
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
                          {item.comment ? (
                            <span style={{ display: "block" }}>{item.comment}</span>
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
        </>
      )}
      {!course && <h1>No course assigned!</h1>}
    </div>
  );
};

export default CreationCCTable;