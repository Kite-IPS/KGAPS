import React, { useState, useEffect } from 'react';
import api from '@/apiConfig';
import "./FacultyAddAssignment.css"; // Import the CSS file

const FacultyAddResult = () => {
    const data = JSON.parse(sessionStorage.getItem("userData"));
    const [courseList, setCourseList] = useState([]);
    const [resultCourse, setCourse] = useState({});
    const [result, setResult] = useState('');
    const [classList, setClassList] = useState([]);
    const [class_id, setClassId] = useState('');
    const [link, setLink] = useState('');

    useEffect(() => {
        const fetchFacultyCourseList = async () => {
            try {
                const res = await api.post("/api/faculty_courses", {
                    uid: data.uid,
                });
                const courseData = res.data[0];
                if(courseData){
                    setCourseList(res.data);
                    setCourse(courseData.course_code);
                    setClassId(courseData.class_id);
                }
            } catch (error) {
                console.error('Classes were not retrieved', error);
            }
        };

        fetchFacultyCourseList();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const course_code = resultCourse;
        const formData = {
            course_code,
            result,
            class_id,
            link,
        };
        console.log(formData);
        if (!result || !class_id || !link || !course_code) {
            alert("Please fill all the fields!");
            return;
        }
        function isGoogleSheetsLink(url) {
                const regex = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit(\?gid=\d+)(#gid=\d+)?\/?$/;
                return regex.test(url);
              
          }
        if (!isGoogleSheetsLink(link)) {
            alert("Please enter a valid Google Sheets link!");
            return;}
        try {
            const res = await api.post("/api/add_result", formData);
            console.log(res);
            window.location.reload();
        } catch (e) {
            console.error("Error occurred", e);
        }
    };

    useEffect(() => {
        const getclass = async () => {
            console.log(resultCourse);
            if(resultCourse){
        const res = await api.post("/api/course_classes_assignments", {
            uid: data.uid,
            course_code:resultCourse,
        });
        if (res.data && !("response" in res.data)) {
                console.log(res.data);
                setClassList(res.data);     
            }}};
            getclass();
    }, [resultCourse]);

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

    return (
        <div className="form-container">
            {resultCourse && (
                <>
                <h1>Add Result</h1>
                
            <form className="topic-form" onSubmit={handleSubmit}>
            <div className="form-group">
                    <label>Course</label>
                    <select
                        value={resultCourse}
                        onChange={(e) => {setCourse(e.target.value);setClassId('');}}
                    >
                        <option value="">Select Course</option>
                        {courseList.map((course) => (
                            <option key={course.course_code} value={course.course_code}>
                                {course.course_code}-{course.course_name}
                            </option>
                        ))}
                    </select>
                </div>
                {classList.length>0 && <div className="form-group">
                    <label>Class</label>
                    <select
                        value={class_id}
                        onChange={(e) => setClassId(e.target.value)}
                    >
                        <option value="">Select Class</option>
                        {classList.map((cls) => (
                            <option key={cls.class_id} value={cls.class_id}>
                                {convertToClass(cls.class_id)}
                            </option>
                        ))}
                    </select>
                </div>}
                <div className="form-group">
                    <label>Result</label>
                    <select
                        value={result}
                        onChange={(e) => setResult(e.target.value)}
                    >
                        <option value="">Enter Result for</option>
                        <option key="IA1" value="IA1">
                                IA1
                            </option>
                            <option key="IA2" value="IA2">
                                IA2
                            </option>
                            <option key="Model exam" value="Model exam">
                                Model exam
                            </option>
                            <option key="Semester" value="Semester">
                                Semester
                            </option>
                    </select>
                </div>
                <p>please ensure the given sheet is accessible to all as viewer and ensure the right sub-sheet is as the link</p>
                <div className="form-group">
                    <label>Progress sheet link</label>
                    <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="Google sheets link"
                    />
                </div>
                <button className="submit-button" type="submit">Submit</button>
            </form></>)}
        </div>
    );
};

export default FacultyAddResult;
