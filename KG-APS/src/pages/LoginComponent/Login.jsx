import React from 'react'
import Image from '../../assets/image.jpg'
import './Login.css'

export default function Login() {
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
                            <select name="roles" id="roles">
                                <option value="faculty">Faculty</option>
                                <option value="course-doordinator">Course Coordinator</option>
                                <option value="domain-mentor">Domain Mentor</option>
                                <option value="hod">H.O.D</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <form method="post">
                            <input type="text" name="username" id="username" placeholder="Enter username ... " />
                            <input type="password" name="password" id="password" placeholder='Enter Password ...' />
                            <button type="submit">Login</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
