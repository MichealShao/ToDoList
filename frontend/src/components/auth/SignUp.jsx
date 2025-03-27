import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Auth.css";
import { authAPI } from "../../services/api";

export const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if there's any data passed from the login page on load
  useEffect(() => {
    const loginFormDataStr = sessionStorage.getItem('loginFormData');
    if (loginFormDataStr) {
      try {
        const loginFormData = JSON.parse(loginFormDataStr);
        setFormData(prev => ({
          ...prev,
          email: loginFormData.email || prev.email,
          password: loginFormData.password || prev.password,
          confirmPassword: loginFormData.password || prev.confirmPassword
        }));
        // Clear after use to prevent data leakage
        sessionStorage.removeItem('loginFormData');
      } catch (error) {
        console.error('Error parsing login form data:', error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
 
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // Debug logs
      console.log('Sending registration data:', {
        username: formData.username,
        email: formData.email,
        password: 'HIDDEN' // Not logging password for security reasons
      });
      
      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Registration successful, attempting login');
    
      try {
        console.log('Attempting auto-login with registered email:', formData.email);
        const loginResponse = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        
        console.log('Login after registration successful:', {
          hasToken: !!loginResponse.token
        });
        
        // Ensure login was successful and token was received
        if (!loginResponse.token) {
          console.warn('Login successful but no token received');
          setError('Registration successful but auto-login failed, please try logging in manually');
          setLoading(false);
          return;
        }
        
        navigate('/todolist');
      } catch (loginErr) {
        console.error('Auto login after registration failed:', loginErr);
        setError('Registration successful but auto-login failed, please try logging in manually');
        setLoading(false);
        // Despite login failure, registration was successful, so navigate to login page
        navigate('/');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setLoading(false);
      
      // More comprehensive error handling
      if (err.response) {
        // Server responded with an error status code
        console.error('Server error response:', err.response);
        
        if (err.response.data) {
          if (err.response.data.msg) {
            setError(err.response.data.msg);
          } else if (err.response.data.message) {
            if (err.response.data.message.includes('duplicate')) {
              setError('This username is already taken, please choose another one.');
            } else if (err.response.data.message.includes('password')) {
              setError('Password must be at least 6 characters and contain a combination of letters and numbers.');
            } else {
              setError(err.response.data.message);
            }
          } else {
            setError(`Server error: ${err.response.status}`);
          }
        } else {
          setError(`Server error: ${err.response.status}`);
        }
      } else if (err.message === 'Network Error') {
        setError('Unable to connect to server, please check your network connection.');
      } else {
        setError(`Registration failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Please fill in the following information to complete registration</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="form-input-container">
              <input
                id="username"
                type="text"
                name="username"
                className="form-input"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div className="form-input-container">
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="form-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="form-input-container">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/" className="auth-link">
            Login now
          </Link>
        </div>
      </div>
    </div>
  );
}; 