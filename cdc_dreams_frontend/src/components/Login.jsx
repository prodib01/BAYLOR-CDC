import React, { useState } from'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const url = 'http://localhost:8000';
    const navigate = useNavigate();

    const handleSubmit = async (e) => {  
        e.preventDefault();

        try {
            const response = await fetch(`${url}/api/login/`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
           


            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            
            navigate('/dashboard');
            
        } catch (error) {
            console.error('Login failed', error);
            
        }
    };

    return (
        <div className='login-container'>
            <form className='login-form' onSubmit={handleSubmit}>
                <h2>Welcome Back</h2>
                <p>Enter your details below</p>
                <div className='form-group'>
                    <input
                        type='text'
                        id='username'
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className='form-group'>
                    <input
                        type='password'
                        id='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type='submit' className='login-button'>Login</button>
            </form>
        </div>
    );
};

export default Login;
