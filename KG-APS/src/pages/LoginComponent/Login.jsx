import React from 'react'
import Image from '../../assets/image.jpg'

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
