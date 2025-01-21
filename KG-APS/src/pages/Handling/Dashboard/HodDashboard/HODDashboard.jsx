import React, { useState,useEffect } from 'react';
import './HODDashboard.css';
import axios from 'axios';
import HandlingSidebar from '../../HandlingSidebar/HandlingSidebar';


function HandlingHODDashboard() {
  const [courseDataCurrent,setCourseDataCurrent] = useState([]);
  const [courseDataOverall,setCourseDataOverall] = useState([]); 
  const data = JSON.parse(sessionStorage.getItem("userData"));
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [departmentProgressOverall,setDepartmentProgressOverall] = useState([]);
  const [departmentProgressCurrent,setDepartmentProgressCurrent] = useState([]);
  const [DomainCourses, setDomainCourses] = useState([]);
  const [selectedCard, setSelectedCard] = useState(0);
  const [viewMode, setViewMode] = useState("course");
  const value = (current,total) => {
    if (total===0 || current === 0 || current>total){
      return 100;
    }
    return (current/total)*100;
  } 


  useEffect(() => {
    const fetchData = async () => {
      try {
        const course = await axios.post(
          "http://localhost:8000/api/department_courses",
          data,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setDomainCourses(course.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      try {
        const course = await axios.post(
          "http://localhost:8000/api/department_overall_progress",
          {department_id:data.department_id},
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setDepartmentProgressOverall(course.data.department_overall);
        setDepartmentProgressCurrent(course.data.department_current);
        console.log(departmentProgressCurrent,departmentProgressOverall);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const fetchChartDataCourse = async (selectedCourse) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/course_progress",
        selectedCourse,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(res.data);
      setCourseDataCurrent(res.data.course_data_current);
      setCourseDataOverall(res.data.course_data_overall);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchChartDataClass = async (class_id) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/class_progress",
        {'class_id':class_id},
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(res.data);
      setCourseDataCurrent(res.data.course_data_current);
      setCourseDataOverall(res.data.course_data_overall);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const UpdateChart = async (option) => {
    console.log(option);
    console.log(typeof(option.course_code));
  if('course_code' in option){await fetchChartDataCourse(option);
  }else{await fetchChartDataClass(option);}};

  const renderColorComment = (barColor) => {
    switch (barColor) {
      case 'black':
        return <p>Not yet started</p>;
      case 'red':
        return <p>Delayed</p>;
      case 'green':
        return <p>Ahead of time</p>;
      case 'blue':
        return <p>On Time</p>;
      default:
        return null;
    }
  };
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

  const convertToClass = (item) => {
    const class_id = item.toString();
    return yearMap[class_id[1]]+" - "+departmentMap[class_id[0]]+" "+sectionMap[class_id[2]];
  };

  const aggregateData = () => {
    let aggrdata = [];
    var count = 0;
    var total_count = 0;
    var hours_count = 0;

    for(let i=0;i<courseDataOverall.length;i++){
      count += courseDataOverall[i].count;
      total_count += courseDataOverall[i].total_count;
      var temp = courseDataCurrent[i].completed_hours/courseDataCurrent[i].total_hours;
      if (temp>1){hours_count+=1;}
      else if (temp<1){hours_count-=1;}
    }
    var comment = "";
    var topic_count = count/total_count;
    if (hours_count<0){ comment = "Ahead of time";}
    else if (hours_count>0){ comment = "Lagging";}
    else if (hours_count===0){ comment = "On Time";}
    else { comment = "Not yet started";}

    aggrdata.push({ topic_count: topic_count, comment:comment });
    return aggrdata;
  };
  return (
    <>
      <HandlingSidebar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="">
            <div className="course-selector">
              <h1>Head of department Dashboard</h1>
              { departmentProgressOverall.length>0 && <div className="handlingfaculty-dashboard-aggregate">
                <div className="handlingfaculty-dashboard-aggregate-content">
                  <p>
                    Overall Department Progress:
                    {(departmentProgressOverall[0].count/departmentProgressOverall[0].total_count * 100).toFixed(0)}%
                  </p>
                  <div className="handlingfaculty-dashboard-progressbar-horizontal">
                    <div
                      style={{
                        width: `${(
                          (departmentProgressOverall[0].count/departmentProgressOverall[0].total_count * 100).toFixed(0))}%`,
                        backgroundColor: "darkblue",
                      }}
                    />
                  </div>
                  <p>Status: {departmentProgressCurrent[0].completed_hours-departmentProgressCurrent[0].total_hours>0 && <span style={{color:"red"}}>Delayed</span>}{departmentProgressCurrent[0].completed_hours-departmentProgressCurrent[0].total_hours<0 && <span style={{color:"lightgreen"}}>Ahead of time</span>}{!departmentProgressCurrent[0].completed_hours===0 && departmentProgressCurrent[0].completed_hours-departmentProgressCurrent[0].total_hours === 0 && <span style={{color:"green"}}>On time</span>}{departmentProgressCurrent[0].completed_hours===0 && departmentProgressCurrent[0].completed_hours-departmentProgressCurrent[0].total_hours === 0 && <p style={{color:"black"}}>Not yet started</p>}</p>
                </div>
              </div>}
              <button
                className="HFTbutton-1"
                onClick={() => setViewMode("course")}
              >
                Course wise
              </button>
              <button
                className="HFTbutton-2"
                onClick={() => setViewMode("class")}
              >
                Class wise
              </button>
              {viewMode === "class" && (
                (data.department_id === 6?(<><div className="cards-container">
                  <div><button className="class-section" onClick={() => {setSelectedOption(111);fetchChartDataClass(111);}}>1st Year - CSE A</button>
                  <button className="class-section" onClick={() => {setSelectedOption(112);fetchChartDataClass(112);}}>1st Year - CSE B</button>
                  </div>
                  <div>
                    <button className="class-section" onClick={() => {setSelectedOption(211);fetchChartDataClass(211);}}>1st Year - AI&DS A</button>
                    <button className="class-section" onClick={() => {setSelectedOption(212);fetchChartDataClass(212);}}>1st Year - AI&DS B</button>
                  </div>
                  <div>
                    <button className="class-section" onClick={() => {setSelectedOption(311);fetchChartDataClass(311);}}>1st Year - ECE A</button>
                    <button className="class-section" onClick={() => {setSelectedOption(312);fetchChartDataClass(312);}}>1st Year - ECE B</button>
                  </div><button className="class-section" onClick={() => {setSelectedOption(411);fetchChartDataClass(411);}}>1st Year - CSBS</button>
                  <button className="class-section" onClick={() => {setSelectedOption(511);fetchChartDataClass(511);}}>1st Year - IT</button>
                  <button className="class-section" onClick={() => {setSelectedOption(711);fetchChartDataClass(711);}}>1st Year - MECH</button>
                  <button className="class-section" onClick={() => {setSelectedOption(811);fetchChartDataClass(811);}}>1st Year - CYS</button>
                  <button className="class-section" onClick={() => {setSelectedOption(911);fetchChartDataClass(911);}}>1st Year - AI&ML</button>
                </div>
                </>):data.department_id === 1 || data.department_id === 2 || data.department_id === 3 ?(<>
                  <div><button className="class-section" onClick={() => {setSelectedOption(data.department_id*100+11);fetchChartDataClass(data.department_id*100+11);}}>1st Year - {departmentMap[data.department_id]} A</button>
                  <button className="class-section" onClick={() => {setSelectedOption(data.department_id*100+12);fetchChartDataClass(data.department_id*100+12);}}>1st Year - {departmentMap[data.department_id]} B</button>
                  </div>
                  <div><button className="class-section" onClick={() => {setSelectedOption(data.department_id*100+21);fetchChartDataClass(data.department_id*100+21);}}>2nd Year - {departmentMap[data.department_id]} A</button>
                  <button className="class-section" onClick={() => {setSelectedOption(data.department_id*100+22);fetchChartDataClass(data.department_id*100+22);}}>2nd Year - {departmentMap[data.department_id]} B</button>
                  </div>
                  <div><button className="class-section" onClick={() => {setSelectedOption(data.department_id*100+31);fetchChartDataClass(data.department_id*100+31);}}>3rd Year - {departmentMap[data.department_id]} A</button>
                  <button className="class-section" onClick={() => {setSelectedOption(data.department_id*100+32);fetchChartDataClass(data.department_id*100+32);}}>3rd Year - {departmentMap[data.department_id]} B</button>
                  </div>
                  <div><button className="class-section" onClick={() => {setSelectedOption(data.department_id*100+41);fetchChartDataClass(data.department_id*100+41);}}>4th Year - {departmentMap[data.department_id]} A</button>
                  <button className="class-section" onClick={() => {setSelectedOption(data.department_id*100+42);fetchChartDataClass(data.department_id*100+42);}}>4th Year - {departmentMap[data.department_id]} B</button>
                  </div>
                </>):(<>
                  <div><button className="class-section" onClick={() => {setSelectedOption(data.department_id*100+11);fetchChartDataClass(data.department_id*100+11);}}>1st Year - {departmentMap[data.department_id]} A</button>
                  </div>
                  <div><button className="class-section" onClick={() => {setSelectedOption(data.department_id*100+21);fetchChartDataClass(data.department_id*100+21);}}>2nd Year - {departmentMap[data.department_id]} A</button>
                  </div>
                  <div><button className="class-section" onClick={() => {setSelectedOption(data.department_id*100+31);fetchChartDataClass(data.department_id*100+31);}}>3rd Year - {departmentMap[data.department_id]} A</button>
                  </div>
                  <div><button className="class-section" onClick={() => {setSelectedOption(data.department_id*100+41);fetchChartDataClass(data.department_id*100+41);}}>4th Year - {departmentMap[data.department_id]} A</button>
                  </div>
                </>))
              )}
              {DomainCourses.length > 0 ? (
                viewMode === "course"? (
                <>
                  <label className="dropdown-label">
                    Select a course to view progress:
                  </label>
                  <div className="cards-container">
                    {DomainCourses.map((yearOption, yearIndex) => (
                      <div key={yearIndex} className="year-section">
                        <div
                          className={`year-card ${
                            selectedYear === yearIndex ? "expanded" : ""
                          }`}
                          onClick={async () => {
                            setSelectedYear(yearIndex);
                            setSelectedCard(0);
                          }}
                        >
                          <h3>{yearMap[yearOption.year]}</h3>
                        </div>
                        {selectedYear === yearIndex && (
                          <div className="courses-container">
                            {yearOption.courses.map(
                              (courseOption, courseIndex) => (
                                <div
                                  key={courseIndex}
                                  className={`course-card ${
                                    selectedCard === courseIndex
                                      ? "expanded"
                                      : ""
                                  }`}
                                  onClick={async () => {
                                    setSelectedCard(courseIndex);
                                    UpdateChart(courseOption);
                                  }}
                                >
                                  <h3>{courseOption.course_name}</h3>
                                  {selectedCard === courseIndex && (
                                    <div className="card-details">
                                      <p>
                                        Course Code: {courseOption.course_code}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </> ) :(<>
                </>)) : (
                <h1>No courses available</h1>
              )}
            </div>
          </div>

          {courseDataOverall.length > 0 && courseDataCurrent.length > 0 ? (
            <>
              {viewMode==="course" && <h1>
                Course{" "}
                {courseDataOverall[0].course_code +
                  " - " +
                  courseDataOverall[0].course_name}
              </h1>}
              <div className="handlingfaculty-dashboard-aggregate">
                <p>Aggregate Progress</p>
                <div className="handlingfaculty-dashboard-aggregate-content">
                  <p>
                    Overall Progress:{" "}
                    {(aggregateData()[0].topic_count * 100).toFixed(0)}%
                  </p>
                  <div className="handlingfaculty-dashboard-progressbar-horizontal">
                    <div
                      style={{
                        width: `${(
                          aggregateData()[0].topic_count * 100
                        ).toFixed(2)}%`,
                        backgroundColor: "purple",
                      }}
                    />
                  </div>
                  <p>Average Status: {aggregateData()[0].comment}</p>
                </div>
              </div>
              <div className="handlingfaculty-dashboard-card-container">
                {courseDataCurrent.map((item, i) => (
                  <div className="handlingfaculty-dashboard-card" key={i}>
                    <div className="handlingfaculty-dashboard-card-header">
                      {" "}
                      Faculty - {item.uid} - {item.name} - {convertToClass(item.class_id)}
                    </div>
                    { viewMode === 'class' && <div className="handlingfaculty-dashboard-card-header">
                      {" "}
                      Course - {item.course_code} - {item.course_name}
                    </div>}
                    <div className="handlingfaculty-dashboard-card-content">
                      <p>
                        Hours Completed: {item.completed_hours} /{" "}
                        {item.total_hours}
                      </p>
                      <div className="handlingfaculty-dashboard-progressbar-horizontal">
                        <div
                          style={{
                            width: `${value(
                              item.completed_hours,
                              item.total_hours
                            ).toFixed(2)}%`,
                            backgroundColor: item.bar_color,
                          }}
                        />
                      </div>
                      <p>
                        Topics Completed: {courseDataOverall[i].count}/
                        {courseDataOverall[i].total_count}
                      </p>
                      <div className="handlingfaculty-dashboard-progressbar-horizontal">
                        <div
                          style={{
                            width: `${(
                              (courseDataOverall[i].count /
                                courseDataOverall[i].total_count) *
                              100
                            ).toFixed(2)}%`,
                            backgroundColor: "green",
                          }}
                        />
                      </div>
                      <div className="handlingfaculty-dashboard-colorcomment">
                        {renderColorComment(item.bar_color)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <h1>No progress!</h1>
          )}
        </div>
      </div>
    </>
  );
}

export default HandlingHODDashboard;
