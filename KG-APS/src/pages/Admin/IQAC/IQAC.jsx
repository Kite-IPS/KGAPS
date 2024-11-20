import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import "./Admin-entry.css";
import AssigningRoleToCoursesComponent from './RoleAssignment';


const AdminComponent = () => {
  const data = localStorage.getItem('userData');
  const [courses, setCourses] = useState([]);
  const [facultyCourse,setFacultyCourse] = useState([]);
  const [domainCourse,setDomainCourse] = useState([]);
  const [coordinatorCourse,setCoordinatorCourse] = useState([]);
  const [response, setResponse] = useState("failed");
  const [mentorList, setMentorList] = useState([]);
  const [topics, setTopics] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const { register, handleSubmit, setValue } = useForm();
  const getCourseForm = useForm({ defaultValues: { department_id: 0 } });
  const addCourseForm = useForm({ defaultValues: { department_id: 0, course_code: 0, course_name: 0, domain_id: 0 } });
  const getMentorListForm = useForm({ defaultValues: { department_id: 0 } });
  const getTopicForm = useForm({ defaultValues: { course_code: 0 } });
  const userRegistrationForm = useForm({ defaultValues: { id: 0, name: "", password: "", role: 0, department_id: 0 } });
  const assignCourseForm = useForm({ defaultValues: { uid: 0, course_code: "" } });
  const assignMentorForm = useForm({ defaultValues: { uid: 0, course_code: "" } });
  const assignDomainMentorForm = useForm({ defaultValues: { mentor_id: 0, domain_id: 0 } });


  const fetchCourses = async (data) => {
    try {
      const res = await axios.post("http://localhost:8000/api/courses",data=data);
      if (res) {
        setResponse(res.data);
        setCourses(res.data);
        console.log(courses);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
   };

  const addCourse = async (data) => {
    try {
        const res = await axios.post("http://localhost:8000/api/add_course",data=data);
        if (res) {
          setResponse(res.data);
        }
      } catch (error) {
        console.error("Error adding course:", error);
      }
  };

  const getTopic = async (data) => {
    try {
      const res = await axios.post("http://localhost:8000/api/topics",data=data);
      if (res) {
        setResponse(res.data);
        setTopics(res.data);
      }
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  const registerUserInfo = async (data) => {
    try {
      const res = await axios.post("http://localhost:8000/api/register",data=data);
      if (res) {
        setResponse(res.status);
        console.log(response);
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const onDepartmentChangeFaculty = async (deptId) => {
    const courseResponse = await axios.post('/api/courses', { department_id: deptId });
    setFacultyCourse(courseResponse.data);
  };
  const onDepartmentChangeDomain = async (deptId) => {
    const courseResponse = await axios.post('/api/courses', { department_id: deptId });
    setDomainCourse(courseResponse.data);
  };
  const onDepartmentChangeCoordinator = async (deptId) => {
    const courseResponse = await axios.post('/api/courses', { department_id: deptId });
    setCoordinatorCourse(courseResponse.data);
  };
  
  const getMentorListDetails = async (data) => {
    try {
      const res = await axios.post("http://localhost:8000/api/mentor_list",data=data);
      if (res) {
        setResponse(res.status);
        setMentorList(res.data);
        console.log(response);
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const assignCourseMentorDetails = async (data) => {
    try {
      const res = await axios.post("http://localhost:8000/api/assign_mentor",data=data);
      if (res) {
        setResponse(res.status);
        setMentorList(res.data);
        console.log(response);
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };



  return (<>
    <div className="container">
      <p>{response !== 'failed' && 'Success!'}</p>
      
      <div className="boxforboxforforms">
        <p className="admintitle">Get details -</p>

        <div className="boxforforms">
          <p>GET COURSES -</p>
          <form onSubmit={getCourseForm.handleSubmit(fetchCourses)}>
            <div className="username">
              <label>department_id</label>
              <select {...getCourseForm.register("department_id")}>
                <option value="1">CSE</option>
                <option value="2">AI&DS</option>
                <option value="3">ECE</option>
                <option value="4">CSBS</option>
                <option value="5">IT</option>
                <option value="6">S&H</option>
              </select>
            </div>
            <button type="submit">Get courses</button>
          </form>
          <table>
            <tbody>
            {courses.length>0 && <>
            <tr>
            <td>COURSE CODE</td>
              <td>COURSE NAME</td>
              </tr></>}
          {courses.map((item) => (
            <tr key={item.course_code}>
              <td>{item.course_code}</td>
              <td>{item.course_name}</td>
            </tr>
          ))}
          </tbody>
          </table>
        </div>
        <div className="boxforforms">
          <p>GET TOPICS -</p>
          <form onSubmit={getTopicForm.handleSubmit(getTopic)}>
            <div className="username">
              <label>course_code</label>
              <input type="text" {...getTopicForm.register("course_code")} />
            </div>
            <button type="submit">Get Topics</button>
          </form>
          <table>
            <tbody>
            {topics[1] && <>
            <tr>
            <td>TOPIC ID</td>
              <td>TOPIC</td>
              <td>OUTCOME</td>
              </tr></>}
          {topics.map((item) => (
            <tr key={item.topic_id}>
              <td>{item.topic_id}</td>
              <td>{item.topic}</td>
              <td>{item.outcome}</td>
            </tr>
          ))}
          </tbody>
          </table>
        </div>
        <div className="boxforforms">
          <p>GET MENTOR LIST -</p>
          <form onSubmit={getMentorListForm.handleSubmit(getMentorListDetails)}>
            <div className="username">
              <label>department_id</label>
              <select {...getMentorListForm.register("department_id")}>
                <option value="1">CSE</option>
                <option value="2">AI&DS</option>
                <option value="3">ECE</option>
                <option value="4">CSBS</option>
                <option value="5">IT</option>
                <option value="6">S&H</option>
              </select>
            </div>
            <button type="submit">Get Mentor List</button>
          </form>
          <table>
            <tbody>
            {mentorList[1] && <>
            <tr>
            <td>UID</td>
              <td>NAME</td>
              <td>COURSE CODE</td>
              </tr></>}
          {mentorList.map((item) => (
            <tr key={item.uid}>
              <td>{item.uid}</td>
              <td>{item.name}</td>
              <td>{item.course_code}</td>
            </tr>
          ))}
          </tbody>
          </table>
        </div>
      </div>
      <div className="boxforboxforforms">
        <div className="boxforforms">
          <p className="title">REGISTER COURSES -</p>
          <form onSubmit={addCourseForm.handleSubmit(addCourse)}>
            <div className="username">
              <label>department</label>
              <select {...addCourseForm.register("department_id")}>
                <option value="1">CSE</option>
                <option value="2">AI&DS</option>
                <option value="3">ECE</option>
                <option value="4">CSBS</option>
                <option value="5">IT</option>
                <option value="6">S&H</option>
              </select>
            </div>
            <div className="username">
              <label>domain id</label>
              <select {...addCourseForm.register("domain_id")}>
                <option value="1">PROGRAMMING</option>
                <option value="2">NETWORKS & OPERATING SYSTEMS</option>
                <option value="3">ALGORITHMS</option>
              </select>
            </div>
            <div className="username">
              <label>course_code</label>
              <input type="text" {...addCourseForm.register("course_code")} />
            </div>
            <div className="username">
              <label>course_name</label>
              <input type="text" {...addCourseForm.register("course_name")} />
            </div>
            <button type="submit">Add course</button>
          </form>
        </div>
        <div className="boxforforms">
          <p className="title">REGISTER USER -</p>
          <form onSubmit={userRegistrationForm.handleSubmit(registerUserInfo)}>
            <div className="username">
              <label>department</label>
              <select {...userRegistrationForm.register("department_id")}>
                <option value="1">CSE</option>
                <option value="2">AI&DS</option>
                <option value="3">ECE</option>
                <option value="4">CSBS</option>
                <option value="5">IT</option>
                <option value="6">S&H</option>
              </select>
            </div>
            <div className="username">
              <label>UID</label>
              <input type="text" {...userRegistrationForm.register("id")} />
            </div>
            <div className="username">
              <label>Name</label>
              <input type="text" {...userRegistrationForm.register("name")} />
            </div>
            <div className="username">
              <label>Password</label>
              <input type="text" {...userRegistrationForm.register("password")} />
            </div>
            <div className="username">
              <label>Role</label>
              <select {...userRegistrationForm.register("role")}>
                <option value="1">Faculty</option>
                <option value="2">Course Coordinator</option>
                <option value="3">ECE</option>
                <option value="4">CSBS</option>
                <option value="5">IT</option>
                <option value="6">S&H</option>
              </select>
            </div>
            <button type="submit">Register User</button>
          </form>
        </div>
        </div>
      </div>
      <div className="boxforboxforforms">
      <AssigningRoleToCoursesComponent/>
      </div>
      </>
  );
};

export default AdminComponent;
