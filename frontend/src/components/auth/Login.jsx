import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Auth.css";
import { authAPI } from "../../services/api";

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check localStorage for saved email on page load
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      console.log('Login attempt, using credentials:', { 
        email: formData.email, 
        password: 'HIDDEN' 
      });
      
      // Login using email only
      const response = await authAPI.login({ 
        email: formData.email, 
        password: formData.password 
      });
      
      console.log('Login successful, received response:', { 
        token: response.token ? 'JWT_TOKEN_RECEIVED' : 'NO_TOKEN' 
      });
      
      // If user checked "Remember me", save email to localStorage
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        console.log('Email saved to localStorage:', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
        console.log('Cleared saved email from localStorage');
      }
      
      navigate('/todolist');
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        console.error('Server response:', { 
          status: err.response.status,
          data: err.response.data 
        });
      }
      
      setLoading(false);
      
      if (err.response && err.response.status === 401) {
        setError('Email or password incorrect, please try again.');
      } else if (err.response && err.response.status === 400) {
        setError('Please enter a valid email and password.');
      } else if (err.message === 'Network Error') {
        setError('Unable to connect to server, please check your network connection.');
      } else {
        setError('Unable to login at this time, please try again later.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">Please enter your login information</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
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
          
          <div className="checkbox-container">
            <input
              id="remember"
              type="checkbox"
              name="rememberMe"
              className="checkbox-input"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <label htmlFor="remember">Remember me</label>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          Don't have an account?{" "}
          <Link 
            to={{
              pathname: "/signup",
              // URL parameters are used since React Router v6 no longer supports location state passing
            }}
            onClick={() => {
              // Use sessionStorage to temporarily store login form data for the registration page
              if (formData.email || formData.password) {
                sessionStorage.setItem('loginFormData', JSON.stringify({
                  email: formData.email,
                  password: formData.password
                }));
              }
            }}
            className="auth-link"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}; 