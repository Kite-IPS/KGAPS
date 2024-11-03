import React, { useState } from 'react';
import "../../Table.css";

const HandlingFacultyTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [updatedlink, setUpdatedLink] = useState("");
  const [selectedOption, setSelectedOption] = useState("-");
  const [FacultyCourses, setFacultyCourses] = useState([]);
  const [tableData, setTableData] = useState([]);
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
    console.log(key, updatedlink);
    try {
      const res = await axios({
        url: "http://localhost:8000/api/editlink",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { topic_id: key, url: updatedlink },
      });
      if (res) {
        console.log(res.data);
        fetchTableData();
      }
    } catch (error) {
      console.error("Error updating link:", error);
    }
  }

  const [filteredData, setFilteredData] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const course_code = await axios({
          url: "http://localhost:8000/api/faculty_courses",
          method: "POST",
          data: { uid: data.uid },
        });
        if (course_code) {
          setFacultyCourses(course_code.data);
          if (course_code.data.length > 0) {
            setSelectedOption(course_code.data[0]);
            await fetchTableData(course_code.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const fetchTableData = async () => {
    try {
      const res = await axios({
        url: "http://localhost:8000/api/faculty",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { uid: data.uid, course_code: selectedOption.course_code },
      });
      if (res) {
        setTableData(res.data);
        const filtered = res.data.filter((item) => {
          if (viewMode === "upload") return !item.url;
          if (viewMode === "handle") return item.url;
          return true;
        });
        setFilteredData(filtered); 
      }else{
        setTableData([]);
        setFilteredData([]);}
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };
  const handleSelectChange = (event) => {
    const selected = JSON.parse(event.target.value);
    setSelectedOption(selected);
  };
  return (
    <div className="HFTtable-container">
      <select
        value={JSON.stringify(selectedOption)}
        onChange={handleSelectChange}
      >
        <option value="" disabled>
          Select an option
        </option>
        {FacultyCourses.map((option, index) => (
          <option key={index} value={JSON.stringify(option)}>
            { option.course_code+" - "+option.course_name}
          </option>
        ))}
      </select>
      <button type="button" onClick={() => fetchTableData()}>
        Get Details
      </button>
      {tableData ? (
        <>
          <div className="HFTbutton-group">
            <button className="HFTbutton-1" onClick={() => setViewMode("all")}>
              All contents
            </button>
            <button
              className="HFTbutton-2"
              onClick={() => setViewMode("upload")}
            >
              To upload
            </button>
            <button
              className="HFTbutton-3"
              onClick={() => setViewMode("handle")}
            >
              Handle
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Outcome</th>
                <th>Status Code</th>
                <th>Link</th>
                {viewMode === "handle" && <th>Hours Taken</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData ? (
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
                      {viewMode === "upload" &&
                      !item.url &&
                      item.can_upload === 1 ? (
                        
                        <div className="link-input">
                          <input
                            type="text"
                            placeholder="Upload link"
                            onChange={(e) => handleLinkInput(e, item)}
                          />
                            <button onClick={() => updateLink(item.topic_id)} >Upload</button>
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
                    {viewMode === "handle" && item.url && (
                      <td>
                        <input
                          type="text"
                          placeholder="Hours taken"
                          onChange={(e) => handleHoursInput(e, item)}
                        />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={viewMode === "handle" ? 5 : 4}>
                    No topics assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      ) : (
        <p>No data available for this UID.</p>
      )}
    </div>
  );
};

export default HandlingFacultyTable;
