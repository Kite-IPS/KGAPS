import React, { useState, useEffect } from 'react';
import api from '@/apiConfig';
import "./CreationTopicAddForm.css"; // Import the CSS file

const CreationTopicAddForm = () => {
    const data = JSON.parse(sessionStorage.getItem("userData"));
    const [Course, setCourse] = useState({});
    const [topic, setTopicName] = useState('');
    const [outcome, setOutcome] = useState('');
    const [total_hours, setTotalHours] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [uid, setSelectedStaff] = useState('');

    useEffect(() => {
        const fetchStaffList = async () => {
            try {
                const res = await api.post("/api/coordinator_courses", {
                    uid: data.uid,
                });
                const courseData = res.data[0];
                setCourse(courseData);
                if(courseData){
                const response = await api.post('/api/faculty_course_info', { 'course_code': courseData.course_code });
                const resData = response.data.filter( (item, index, self) => index === self.findIndex((t) => t.uid === item.uid));
                setStaffList(resData);}
                else{
                    console.log("No course data found");
                }
            } catch (error) {
                console.error('There was an error fetching the staff list!', error);
            }
        };

        fetchStaffList();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const course_code = Course.course_code;
        const formData = {
            course_code,
            topic,
            outcome,
            total_hours,
            uid,
        };
        console.log(formData);
        if (!topic || !outcome || !total_hours || !uid) {
            alert("Please fill all the fields!");
            return;
        }
        try {
            const res = await api.post("/api/add_topic", formData);
            console.log(res);
            window.location.reload();
        } catch (e) {
            console.error("Error occurred", e);
        }
    };

    return (
        <div className="form-container">
            {Course && (
                <>
                <h1>Add Topic</h1>
            <h2>{Course.course_code} - {Course.course_name}</h2>
            <form className="topic-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Topic Name:</label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopicName(e.target.value)}
                        placeholder="Enter topic name"
                    />
                </div>
                <div className="form-group">
                    <label>Outcome:</label>
                    <input
                        type="text"
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value)}
                        placeholder="Enter outcome"
                    />
                </div>
                <div className="form-group">
                    <label>Total Hours:</label>
                    <input
                        type="number"
                        value={total_hours}
                        onChange={(e) => setTotalHours(e.target.value)}
                        placeholder="Enter total hours"
                    />
                </div>
                <div className="form-group">
                    <label>Staff:</label>
                    <select
                        value={uid}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                    >
                        <option value="">Select Staff</option>
                        {staffList.map((staff) => (
                            <option key={staff.uid} value={staff.uid}>
                                {staff.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button className="submit-button" type="submit">Submit</button>
            </form></>)}
        </div>
    );
};

export default CreationTopicAddForm;
