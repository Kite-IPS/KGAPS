import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import "./Admin-entry.css";


const AdminComponent = () => {
  const data = localStorage.getItem('userData');
  const [courses, setCourses] = useState([]);
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

//   const getTopic = (data) => {
//     ApiService.getTopicData(data).then((res) => {
//       setTopics(res);
//       console.log(res);
//     });
//   };

//   const registerUserInfo = (data) => {
//     ApiService.registerUser(data).then((res) => setResponse(res));
//   };

//   const assignCourseDetails = (data) => {
//     ApiService.assignCourseUser(data).then((res) => setResponse(res));
//   };

//   const getMentorListDetails = (data) => {
//     ApiService.getMentorList(data).then((res) => {
//       setMentorList(res);
//       setResponse(res);
//     });
//   };

//   const assignCourseMentorDetails = (data) => {
//     ApiService.assignCourseMentor(data).then((res) => setResponse(res));
//   };

//   const assignDomainMentorDetails = (data) => {
//     ApiService.assignDomainMentor(data).then((res) => setResponse(res));
//   };

//   // Event handlers
//   const onCourseOptionChange = (e) => {
//     const selectedValue = e.target.value;
//     ApiService.getCourseData({ department_id: selectedValue }).then((res) => setCourses(res));
//   };

//   const onDepartmentFacultyOptionChange = (e) => {
//     const selectedValue = e.target.value;
//     ApiService.getFacultyInDepartment({ department_id: selectedValue }).then((res) => setFaculty(res));
//   };

//   const onDepartmentCoordinatorOptionChange = (e) => {
//     const selectedValue = e.target.value;
//     ApiService.getCoordinatorsInDepartment({ department_id: selectedValue }).then((res) => setFaculty(res));
//   };

//   const onDepartmentDomainMentorOptionChange = (e) => {
//     const selectedValue = e.target.value;
//     ApiService.getDomainMentorsInDepartment({ department_id: selectedValue }).then((res) => setFaculty(res));
//   };

  return (
    <div className="container">
      <p>{response !== 'failed' && 'Success!'}</p>
      
      <div className="boxforboxforforms">
        <p className="admintitle">Get details -</p>

        {/* Get Courses Form */}
        <div className="boxforforms">
          <p>GET COURSES -</p>
          <form onSubmit={handleSubmit(fetchCourses)}>
            <div className="username">
              <label>department_id</label>
              <select {...register("department_id")}>
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
          {courses.map((item) => (
            <tr key={item.course_code}>
              <td>{item.course_code}</td>
              <td>-</td>
              <td>{item.course_name}</td>
            </tr>
          ))}
          </tbody>
          </table>
        </div>
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

        {/* Get Mentor List Form
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
          {mentorList.map((item) => (
            <tr key={item.uid}>
              <td>{item.uid}</td>
              <td>-</td>
              <td>{item.name}</td>
              <td>-</td>
              <td>{item.course_code}</td>
            </tr>
          ))}
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
          {topics.map((item) => (
            <tr key={item.topic_id}>
              <td>{item.topic_id}</td>
              <td>-</td>
              <td>{item.topic}</td>
              <td>-</td>
              <td>{item.outcome}</td>
            </tr>
          ))}
        </div>
      </div>
      

      <div className="boxforboxforforms">
        <p className="admintitle">Register Stuff -</p>

        

        {/* Additional forms like Register User, Assign Course to Faculty, etc., follow a similar structure */}

      </div> 
    </div>
  );
};

export default AdminComponent;
