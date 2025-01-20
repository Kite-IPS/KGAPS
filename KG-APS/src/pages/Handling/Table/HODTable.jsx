import React, { useState, useEffect } from "react";
import "../../Table.css";
import axios from "axios";
import HandlingSidebar from "../HandlingSidebar/HandlingSidebar";

const HandlingHODTable = () => {
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [FacultyCourses, setFacultyCourses] = useState([]);
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
        class_id: selectedClass,
      });
      if (res) {
        fetchTableData();
        alert("Topic verified successfully");
      }
    } catch (error) {
      console.error("Error updating link:", error);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (selectedClass) {
          const courseResponse = await axios.post(
            "http://localhost:8000/api/handling_department_courses",
            {
              class_id: selectedClass,
            }
          );
          if (courseResponse.data.length>0) {
            console.log(courseResponse.data[0].courses);
            setFacultyCourses(courseResponse.data[0].courses);
            setSelectedOption(courseResponse.data[0].courses[0]);
          }else{
            setFacultyCourses([]);
            setSelectedOption("");
            setFilteredData([]);
          }
        }
      } catch (error) {
        console.error("Error fetching faculty:", error);
      }
    };

    fetchCourses();
  }, [selectedClass]);

  const fetchTableData = async () => {
    if (!selectedOption) return;
    console.log(selectedOption);
    try {
      const res = await axios.post("http://localhost:8000/api/handling_hod", {
        course_code: selectedOption.course_code,
        class_id: selectedClass,
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

  const classMap = {
    6:{
      111: "1st year - CSE A",
      112: "1st year - CSE B",
      211: "1st year - AI & DS A",
      212: "1st year - AI & DS B",
      311: "1st year - ECE A",
      312: "1st year - ECE B",
      411: "1st year - CSBS",
      511: "1st year - IT",
      711: "1st year - MECH",
      811: "1st year - CYS",
      911: "1st year - AI & ML",
    },
    1:{
      111: "1st year - CSE A",
      112: "1st year - CSE B",
      121: "2nd year - CSE A",
      122: "2nd year - CSE B",
      131: "3rd year - CSE A",
      132: "3rd year - CSE B",
      141: "4th year - CSE A",
      142: "4th year - CSE B",
    },
    2:{
      211: "1st year - AI & DS A",
      212: "1st year - AI & DS B",
      221: "2nd year - AI & DS A",
      222: "2nd year - AI & DS B",
      231: "3rd year - AI & DS A",
      232: "3rd year - AI & DS B",
      241: "4th year - AI & DS A",
      242: "4th year - AI & DS B",
    },
    3:{
      311: "1st year - ECE A",
      312: "1st year - ECE B",
      321: "2nd year - ECE A",
      322: "2nd year - ECE B",
      331: "3rd year - ECE A",
      332: "3rd year - ECE B",
      341: "4th year - ECE A",
      342: "4th year - ECE B",
    },
    4:{
      411: "1st year - CSBS",
      421: "2nd year - CSBS",
      431: "3rd year - CSBS",
      441: "4th year - CSBS",
    },
    5:{
      511: "1st year - IT",
      521: "2nd year - IT",
      531: "3rd year - IT",
      541: "4th year - IT",
    },
    7:{
      711: "1st year - MECH",
      721: "2nd year - MECH",
      731: "3rd year - MECH",
      741: "4th year - MECH",
    },
    8:{
      811: "1st year - CYS",
      821: "2nd year - CYS",
      831: "3rd year - CYS",
      841: "4th year - CYS",
    },
    9:{
      911: "1st year - AI & ML",
      921: "2nd year - AI & ML",
      931: "3rd year - AI & ML",
      941: "4th year - AI & ML",
    }
  };


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
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
            }}
          >
            <option value="" disabled>
              Select Class
            </option>
            {Object.keys(classMap[data.department_id]).map((key) => (
              <option key={key} value={key}>
                {classMap[data.department_id][key]}
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
                        {option.course_code + " - " + option.course_name+ " - "+option.handler_id +" - " +option.handler_name }
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
              <th>hours</th>
              {viewMode==="upload" && (<th>Verify</th>)}
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
                      <p>{"declared :"+item.hours_completed+" alloted :"+item.total_hours}</p>
                      </td>
                    {viewMode === "upload" && (
                        <td>
                      <div className="link-input">
                        <button onClick={() => verifyTopic(item.topic_id)}>
                          Verify
                        </button>
                      </div>
                      </td>
                    )}
                  
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
