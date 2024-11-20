import axios from 'axios';
import React, { useState, useEffect } from 'react';
import "./Admin-entry.css";


const AssigningRoleToCoursesComponent = () => {
  const [facultyDepartment, setFacultyDepartment] = useState(0);
  const [CoordinatorDepartment, setCoordinatorDepartment] = useState(0);
  const [DomainMentorDepartment, setDomainMentorDepartment] = useState(0);

  const [faculty, setFaculty] = useState([]); // Placeholder for faculty list
  const [coordinators, setCoordinators] = useState([]); // Placeholder for faculty list
  const [domainMentors, setDomainMentors] = useState([]); // Placeholder for faculty list
  
  const [selectedFaculty, setSelectedFaculty] = useState(0);
  const [selectedCoordinator, setSelectedCoordinator] = useState(0);
  const [selectedDomainMentor, setSelectedDomainMentor] = useState(0);
  
  const [courseDepartment, setCourseDepartment] = useState(0);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDomain, setSelectedDomain] = useState(0);

  const [viewMode, setViewMode] = useState(1);
  
  const onDepartmentFacultyOptionChange = async (event) => {
    const value = parseInt(event.target.value);
    setFacultyDepartment(value);
    try {
        const res = await axios.post("http://localhost:8000/api/faculty_info",{department_id:value});
        if (res) {
          setFaculty(res.data);
          console.log(res.data);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
  };

  const onDepartmentCoordinatorOptionChange = async (event) => {
    const value = parseInt(event.target.value);
    setCoordinatorDepartment(value);
    try {
        const res = await axios.post("http://localhost:8000/api/course_coordinator_info",{department_id:value});
        if (res) {
          setCoordinators(res.data);
          console.log(res.data);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
  };

  const onDepartmentDomainMentorOptionChange = async (event) => {
    const value = parseInt(event.target.value);
    setDomainMentorDepartment(value);
    try {
        const res = await axios.post("http://localhost:8000/api/domain_mentor_info",{department_id:value});
        if (res) {
          setDomainMentors(res.data);
          console.log(res.data);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
  };



  const onCourseOptionChange = async (event) => {
    const value = parseInt(event.target.value);
    setCourseDepartment(value);
    try {
      const res = await axios.post("http://localhost:8000/api/courses",{department_id:value});
      if (res) {
        setCourses(res.data);
        console.log(res.data);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const assignCourseDetails = async (event) => {
    event.preventDefault();
    if(facultyDepartment === 0 || selectedFaculty === 0 || courseDepartment === 0 || selectedCourse === ""){
      console.log("Please select all the fields");
   }else{
    try {
      const res = await axios.post("http://localhost:8000/api/assign_course",{course_code:selectedCourse,uid:selectedFaculty});
      if (res) {
        setSelectedCourse("");
        setCourseDepartment(0);
        alert(res.data.response);
      }
    } catch (error) {
      console.error("Error Couldnt Assign the course:", error);
    }
    }
  };

  const assignCourseCoordinator = async (event) => {
    event.preventDefault();
    if(CoordinatorDepartment === 0 || selectedCoordinator === 0 || courseDepartment === 0 || selectedCourse === ""){
      console.log("Please select all the fields");
   }else{
    try {
      const res = await axios.post("http://localhost:8000/api/assign_mentor",{course_code:selectedCourse,uid:selectedCoordinator});
      if (res) {
        setSelectedCourse("");
        setCourseDepartment(0);
        alert(res.data.response);
      }
    } catch (error) {
      console.error("Error Couldnt Assign the coordinator:", error);
    }
    }
  };

  const assignDomainMentor = async (event) => {
    event.preventDefault();
    if(DomainMentorDepartment === 0 || selectedDomainMentor === 0 || selectedDomain === 0){
      console.log("Please select all the fields");
   }else{
    try {
      const res = await axios.post("http://localhost:8000/api/assign_domain_mentor",{domain_id:selectedDomain,mentor_id:selectedCoordinator});
      if (res) {
        setSelectedDomain("");
        alert(res.data.response);
      }
    } catch (error) {
      console.error("Error Couldnt Assign the Domain mentor:", error);
    }
    }
  };

  return (
    <div>
    <div className="AssignOption">
      <button className='button' onClick={() => setViewMode(1)}>Assign Course to Faculty</button>
      <button className='button' onClick={() => setViewMode(2)}>Assign Course-Coodinator</button>
      <button className='button' onClick={() => setViewMode(3)}>Assign Domain Mentor</button>
    </div>
    {viewMode === 1 && <div className="boxforforms">
      <p>ASSIGN COURSE TO FACULTY - </p>
      <form onSubmit={assignCourseDetails}>
        <div className="username">
          <label htmlFor="faculty-department">Faculty department</label>
          <select
            id="faculty-department"
            value={facultyDepartment}
            onChange={onDepartmentFacultyOptionChange}
          >
            <option value={0}>-</option>
            <option value={1}>CSE</option>
            <option value={2}>AI&DS</option>
            <option value={3}>ECE</option>
            <option value={4}>CSBS</option>
            <option value={5}>IT</option>
            <option value={6}>S&H</option>
          </select>
        </div>

        <div className="username">
          <label htmlFor="faculty">Faculty</label>
          <select
            id="faculty"
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(parseInt(e.target.value))}
          >
            <option value={0}>-</option>
            {faculty.map((option) => (
              <option key={option.uid} value={option.uid}>
                {option.uid} - {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="username">
          <label htmlFor="course-department">Course department</label>
          <select
            id="course-department"
            value={courseDepartment}
            onChange={onCourseOptionChange}
          >
            <option value={0}>-</option>
            <option value={1}>CSE</option>
            <option value={2}>AI&DS</option>
            <option value={3}>ECE</option>
            <option value={4}>CSBS</option>
            <option value={5}>IT</option>
            <option value={6}>S&H</option>
          </select>
        </div>

        <div className="username">
          <label htmlFor="course-code">course_code</label>
          <select
            id="course-code"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value={""}>-</option>
            {courses.map((option) => (
              <option key={option.course_code} value={option.course_code}>
                {option.course_code} - {option.course_name}
              </option>
            ))}
          </select>
        </div>

        <button className="button" type="submit">
          Assign Course
        </button>
      </form>
    </div>}
    {viewMode === 2 && <div className="boxforforms">
    <p>ASSIGN COORDINATOR - </p>
    <form onSubmit={assignCourseCoordinator}>
      <div className="username">
        <label htmlFor="faculty-department">Coordinator department</label>
        <select
          id="faculty-department"
          value={CoordinatorDepartment}
          onChange={onDepartmentCoordinatorOptionChange}
        >
          <option value={0}>-</option>
          <option value={1}>CSE</option>
          <option value={2}>AI&DS</option>
          <option value={3}>ECE</option>
          <option value={4}>CSBS</option>
          <option value={5}>IT</option>
          <option value={6}>S&H</option>
        </select>
      </div>

      <div className="username">
        <label htmlFor="faculty">Coordinator</label>
        <select
          id="faculty"
          value={selectedCoordinator}
          onChange={(e) => setSelectedCoordinator(parseInt(e.target.value))}
        >
          <option value={0}>-</option>
          {coordinators.map((option) => (
            <option key={option.uid} value={option.uid}>
              {option.uid} - {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="username">
        <label htmlFor="course-department">Course department</label>
        <select
          id="course-department"
          value={courseDepartment}
          onChange={onCourseOptionChange}
        >
          <option value={0}>-</option>
          <option value={1}>CSE</option>
          <option value={2}>AI&DS</option>
          <option value={3}>ECE</option>
          <option value={4}>CSBS</option>
          <option value={5}>IT</option>
          <option value={6}>S&H</option>
        </select>
      </div>

      <div className="username">
        <label htmlFor="course-code">course_code</label>
        <select
          id="course-code"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value={""}>-</option>
          {courses.map((option) => (
            <option key={option.course_code} value={option.course_code}>
              {option.course_code} - {option.course_name}
            </option>
          ))}
        </select>
      </div>

      <button className="button" type="submit">
        Assign Coordinator
      </button>
    </form>
  </div>}
{ viewMode===3 && <div className="boxforforms">
    <p>ASSIGN DOMAIN MENTOR - </p>
    <form onSubmit={assignDomainMentor}>
      <div className="username">
        <label htmlFor="faculty-department">Domain mentor department</label>
        <select
          id="faculty-department"
          value={DomainMentorDepartment}
          onChange={onDepartmentDomainMentorOptionChange}
        >
          <option value={0}>-</option>
          <option value={1}>CSE</option>
          <option value={2}>AI&DS</option>
          <option value={3}>ECE</option>
          <option value={4}>CSBS</option>
          <option value={5}>IT</option>
          <option value={6}>S&H</option>
        </select>
      </div>

      <div className="username">
        <label htmlFor="faculty">Domain mentors</label>
        <select
          id="faculty"
          value={selectedDomainMentor}
          onChange={(e) => setSelectedDomainMentor(parseInt(e.target.value))}
        >
          <option value={0}>-</option>
          {domainMentors.map((option) => (
            <option key={option.uid} value={option.uid}>
              {option.uid} - {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="username">
        <label htmlFor="course-department">Domain</label>
        <select
          id="course-department"
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(parseInt(e.target.value))}
        >
          <option value={0}>-</option>
          <option value={1}>PROGRAMMING</option>
          <option value={2}>DATA SCIENCE</option>
          <option value={3}>AI</option>
          <option value={4}>EMBEDDED SYSTEMS</option>
        </select>
      </div>
      <button className="button" type="submit">
        Assign Domain Mentor
      </button>
    </form>
  </div>}
  </div>
  );
};


export default AssigningRoleToCoursesComponent;
