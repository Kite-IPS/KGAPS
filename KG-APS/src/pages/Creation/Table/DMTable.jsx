import React, { useState,useEffect } from 'react';
import "../../Table.css";
import axios from 'axios';
import HandlingSidebar from '../../Handling/HandlingSidebar/HandlingSidebar';


const CreationDMTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [comment, setComment] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
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



  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseResponse = await axios.post("http://localhost:8000/api/domain_courses", {
          domain_id: data.domain_id,
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
      const res = await axios.post("http://localhost:8000/api/domain_mentor", {
        domain_id: data.domain_id,
        course_code: selectedOption.course_code,
      });
      if (res.data && !('response' in res.data)) {
        console.log(res.data);
        setTableData(res.data);
        const filtered = res.data.filter((item) => {
          if (viewMode === "upload") return item.status_code===2 || item.status_code===1;
          return true;
        });
        setFilteredData(filtered);
        console.log(filtered); 
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
    <div className="page-cover" style={{display:'flex', gap:'5vw'}}>
      <HandlingSidebar />
    <div className="HFTtable-container">
      <div className="HFTbutton-group">
        <button className="HFTbutton-1" onClick={() => setViewMode("all")}>
          All contents
        </button>
        <button className="HFTbutton-2" onClick={() => setViewMode("upload")}>
          Approve/Disapprove
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
            <th>Actions</th>
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
                {viewMode === "upload" && item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                ) : (
                  <span>No Link Available</span>
                )}
              </td>
              <td>
                {item.url ? (
                  <div className="button-group">
                    <button
                      className="approve-button"
                      onClick={() => handleApproval(item.topic_id)}
                    >
                      Approve
                    </button>
                    <button
                      className="disapprove-button"
                      onClick={() => handleDisapproval(item.topic_id)}
                    >
                      Disapprove
                    </button>
                  </div>
                ) : (
                  <div className="button-group">
                    <button className="approve-button" disabled>
                      Approve
                    </button>
                    <button className="disapprove-button" disabled>
                      Disapprove
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} style={{ textAlign: "center" }}>No topics assigned yet.</td>
          </tr>
        )}
      </tbody>
      </table>
    </div>
    </div>
  );
};

export default CreationDMTable;
