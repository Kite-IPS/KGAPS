import React, { useState,useEffect } from 'react';
import "../../Table.css";
import axios from 'axios';
import HandlingSidebar from '../../Handling/HandlingSidebar/HandlingSidebar';
import CreationTopicAddForm from './CCAddTopicForm';


const CreationCCTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [updatedLink, setUpdatedLink] = useState("");
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Initialize as an empty array
  const [viewMode, setViewMode] = useState("all");
  const [course, setCourse] = useState({});

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



  const fetchTableData = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/course_mentor", {
        uid: data.uid,
      });
      setCourse(res.data[0]);
      if (res.data && !('response' in res.data)) {
        setTableData(res.data);
        const filtered = res.data.filter((item) => {
          if (viewMode === "upload") return !item.url;
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
        if (viewMode === "upload") return !item.url;
        return true;
      })
    );
  }, [viewMode, tableData]);
  
  useEffect(() => {
    fetchTableData();
  }, []);

  return (
    <div className="page-cover" style={{display:'flex', gap:'5vw'}}>
      <HandlingSidebar />
      <CreationTopicAddForm/>
    <div className="HFTtable-container">
     <h1>{course.course_code+" - "+course.course_name}</h1>
      <div className="HFTbutton-group">
        <button className="HFTbutton-1" onClick={() => setViewMode("all")}>
          All contents
        </button>
        <button className="HFTbutton-2" onClick={() => setViewMode("upload")}>
          To upload
        </button>
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
                  {viewMode === "upload" && !item.url ? (
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
              <td colSpan={4} style={{ textAlign: "center" }}>All topics uploaded.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default CreationCCTable;
