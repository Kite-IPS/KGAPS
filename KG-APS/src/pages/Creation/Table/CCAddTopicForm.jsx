import React, { useState, useEffect } from 'react';
import axios from "axios";

const CreationTopicAddForm = () => {
        const data = JSON.parse(sessionStorage.getItem("userData"));
        const [Course,setCourse] = useState({});
        const [topic, setTopicName] = useState('');
        const [outcome, setOutcome] = useState('');
        const [total_hours, setTotalHours] = useState('');
        const [staffList, setStaffList] = useState([]);
        const [uid, setSelectedStaff] = useState('');
        
        useEffect(() => {
            
            const fetchStaffList = async () => {
            try {
                const res = await axios.post("http://localhost:8000/api/coordinator_courses", {
                    uid: data.uid,
                  });
                  const courseData = res.data[0];
                  setCourse(courseData);
                console.log(res.data);
                const response = await axios({
                url: 'http://localhost:8000/api/faculty_course_info',
                method: 'POST',
                data: { 'course_code': courseData.course_code }
                });
                setStaffList(response.data);
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
            try{
            const res = await axios.post("http://localhost:8000/api/add_topic",formData);
              console.log(res);
              window.location.reload();
            }catch(e){
                console.Error("Error occured"+e)
            }
        };

        return (
            <div>
                <h1>Add Topic -</h1>
                <h2>{Course.course_code} - {Course.course_name}</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Topic Name:</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopicName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Outcome:</label>
                        <input
                            type="text"
                            value={outcome}
                            onChange={(e) => setOutcome(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Total Hours:</label>
                        <input
                            type="number"
                            value={total_hours}
                            onChange={(e) => setTotalHours(e.target.value)}
                        />
                    </div>
                    <div>
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
                    <button type="submit">Submit</button>
                </form>
            </div>
        );
}
export default CreationTopicAddForm;