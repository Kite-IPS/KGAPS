import React, { useState } from 'react'
import Image from '../../assets/image.jpg'
import './Login.css'

export default function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [role, setRole] = useState('faculty');

    const submitCheck = async (e) => {
        e.preventDefault();

        // Check if fields are empty
        if (!username || !password) {
            setError('Username, password, and role cannot be empty.');
            clearErrorAfterTimeout();
            return;
        } else {
            setError(''); // Clear previous errors
        }

        // Prepare data to send to backend
        const loginData = {
            username,
            password,
            role,
        };

        try {
            // Make an API call to the backend
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });

            const result = await response.json();

            if (response.ok) {
                // If login is successful, proceed to the next step (e.g., redirect)
                console.log('Login successful:', result);
                // Example: Redirect to a dashboard or home page
                // window.location.href = '/dashboard';
            } else {
                // If login failed, show the error message from backend
                setError(result.message || 'Login failed. Please try again.');
                clearErrorAfterTimeout();
            }
        } catch (error) {
            // Handle network or unexpected errors
            setError('Something went wrong. Please try again later.');
            clearErrorAfterTimeout();
        }
    };

    const clearErrorAfterTimeout = () => {
        setTimeout(() => {
            setError(''); // Clear the error state
        }, 3000); // 3000 milliseconds = 3 seconds
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
                                <option value="faculty">Faculty</option>
                                <option value="course-doordinator">Course Coordinator</option>
                                <option value="domain-mentor">Domain Mentor</option>
                                <option value="hod">H.O.D</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <form onSubmit={submitCheck}>
                            <div className="login-form-wrapper">
                                <input type="text" name="username" id="username" placeholder="Enter username ... " value={username} onChange={(e) => setUsername(e.target.value)} />
                                <input type="password" name="password" id="password" placeholder='Enter Password ...' value={password} onChange={(e) => setPassword(e.target.value)} />
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
