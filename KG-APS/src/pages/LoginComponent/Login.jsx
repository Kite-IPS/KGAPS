import React, { useState } from 'react'
import Image from '../../assets/image.jpg'
import './Login.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [role, setRole] = useState(1);
    const [section, setSection] = useState("0");
    const roleMapping = {1:'faculty',2:'course-coordinator',3:'domain-mentor',4:'hod',5:'supervisor'}
    const submitCheck = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError('Invalid Username or Password.');
            clearErrorAfterTimeout();
            return;
        } else {
            setError(''); 
        }

        const loginData = {
            username,
            password,
            role,
            section
        };

        try {
            axios({
                // Endpoint to send the request
                url: "http://localhost:8000/api/login",
                method: "POST",
                data: loginData,
              })
              .then((res) => {
                console.log(loginData);
                const response = res.data;
                console.log(response);
                if(loginData.section === "0" && 'name' in response){
                    navigate('/creation/'+roleMapping[loginData.role]+'/dashboard',{state:response});
                    console.log('/creation/'+roleMapping[loginData.role]+'/dashboard')
                }
                else if(loginData.section === "1" && 'name' in response){
                    navigate('/handling/'+roleMapping[loginData.role]+'/dashboard',{state:response});

                }
              })
              .catch((error) => {
                console.error('Error fetching data:', error,loginData);

              });

        } catch (error) {
            console.log(error);
            setError('Something went wrong. Please try again later.');
            clearErrorAfterTimeout();
        }
    };

    const clearErrorAfterTimeout = () => {
        setTimeout(() => {
            setError('');
        }, 3000);
    };

   

    return (
        <>
            <div className="login-container">
                <h1>Course Tracking Dashboard</h1>
                <div className="login-wrapper">
                    <div className="login-image-container">
                        <img src={Image} alt="image" />
                    </div>
                    <div className="login-form-container">
                        <div className="drop-down-container">
                            <select name="roles" id="roles" value={role} onChange={((e) => setRole(e.target.value))}>
                                <option value="1">Faculty</option>
                                <option value="2">Course Coordinator</option>
                                <option value="3">Domain Mentor</option>
                                <option value="4">H.O.D</option>
                                <option value="5">Supervisor</option>
                            </select>
                        </div>
                        <div className="drop-down-container">
                            <select name="section" id="roles" value={section} onChange={((e) => setSection(e.target.value))}>
                                <option value="0">Creation</option>
                                <option value="1">Handling</option>
                            </select>
                        </div>
                        <form onSubmit={submitCheck}>
                            <div className="login-form-wrapper">
                                <input type="text" name="username" id="username" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
                                <input type="password" name="password" id="password" placeholder='Enter Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                                <button type='submit'>Login</button>
                            </div>
                        </form>
                    </div>
                </div>
                {error && (
                    <div className="error-pop-up">
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </>
    )
}
