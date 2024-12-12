import React, { useState, useEffect } from "react";
import "../../Table.css";
import axios from "axios";
import HandlingSidebar from "../HandlingSidebar/HandlingSidebar";

const HandlingHODTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");

  const [FacultyCourses, setFacultyCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
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

  const verifyTopic = async (key) => {
    try {
      const res = await axios.post("http://localhost:8000/api/verify_hours", {
        topic_id: key,
        handler_id: selectedFaculty,
      });
      if (res) {
        fetchTableData();
        alert("Topic verified successfully");
      }
    } catch (error) {
      console.error("Error updating link:", error);
    }
  };
  useEffect( () => {
    const fetchFaculty = async () => {
    try {
      const facultyResponse = await axios.post(
        "http://localhost:8000/api/faculty_info",
        {
          department_id: data.department_id,
        }
      );
      console.log(facultyResponse.data);
      if (facultyResponse.data) {
        setFaculty(facultyResponse.data);
        setSelectedFaculty(facultyResponse.data[0].uid);
      }
    } catch {
      console.error("Error fetching faculty ");
    }
  };
  fetchFaculty();
}
  , []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (selectedFaculty) {
          const courseResponse = await axios.post(
            "http://localhost:8000/api/faculty_courses",
            {
              uid: selectedFaculty,
            }
          );
          if (courseResponse.data) {
            setFacultyCourses(courseResponse.data);
            if (courseResponse.data.length > 0) {
              setSelectedOption(courseResponse.data[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching faculty:", error);
      }
    };

    fetchCourses();
  }, [selectedFaculty]);

  const fetchTableData = async () => {
    if (!selectedOption) return;
    try {
      const res = await axios.post("http://localhost:8000/api/faculty", {
        uid: selectedFaculty,
        course_code: selectedOption.course_code,
      });
      if (res.data && !("response" in res.data)) {
        console.log(res.data);
        setTableData(res.data);
        const filtered = res.data.filter((item) => {
          if (viewMode === "upload") return item.status_code === 4;
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
        if (viewMode === "upload") return item.status_code === 4;
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
            Verify
          </button>
          <select
            value={selectedFaculty}
            onChange={(e) => {
              setSelectedFaculty(e.target.value);
            }}
          >
            <option value="" disabled>
              Select Faculty
            </option>
            {faculty.map((faculty, index) => (
              <option key={index} value={faculty.uid}>
                {faculty.uid + " - " + faculty.name}
              </option>
            ))}
          </select>
          <select
            value={JSON.stringify(selectedOption)}
            onChange={handleSelectChange}
          >
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
              <th>Topic</th>
              <th>Outcome</th>
              <th>Status Code</th>
              <th>Verify</th>
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
                  <td>
                    {viewMode === "upload" ? (
                      <div className="link-input">
                        <button onClick={() => verifyTopic(item.topic_id)}>
                          Verify
                        </button>
                      </div>
                    ) : item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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
                <td colSpan={4} style={{ textAlign: "center" }}>
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

export default HandlingHODTable;
