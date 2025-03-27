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

  // 页面加载时检查是否有登录页传递过来的数据
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
        // 使用后清除，避免数据泄露
        sessionStorage.removeItem('loginFormData');
      } catch (error) {
        console.error('解析登录表单数据出错:', error);
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
      setError('密码不匹配');
      return;
    }
    
    setLoading(true);
    
    try {
      // 调试日志
      console.log('Sending registration data:', {
        username: formData.username,
        email: formData.email,
        password: 'HIDDEN' // 出于安全考虑不记录密码
      });
      
      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Registration successful, attempting login');
    
      try {
        console.log('使用注册的email进行自动登录:', formData.email);
        const loginResponse = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        
        console.log('Login after registration successful:', {
          hasToken: !!loginResponse.token
        });
        
        // 确保登录成功并有token
        if (!loginResponse.token) {
          console.warn('登录成功但没有收到token');
          setError('注册成功但自动登录失败，请尝试手动登录');
          setLoading(false);
          return;
        }
        
        navigate('/todolist');
      } catch (loginErr) {
        console.error('Auto login after registration failed:', loginErr);
        setError('注册成功但自动登录失败，请尝试手动登录');
        setLoading(false);
        // 尽管登录失败，但注册成功了，所以我们导航到登录页面
        navigate('/');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setLoading(false);
      
      // 更全面的错误处理
      if (err.response) {
        // 服务器响应了错误状态码
        console.error('Server error response:', err.response);
        
        if (err.response.data) {
          if (err.response.data.msg) {
            setError(err.response.data.msg);
          } else if (err.response.data.message) {
            if (err.response.data.message.includes('duplicate')) {
              setError('此用户名已被占用，请选择其他用户名。');
            } else if (err.response.data.message.includes('password')) {
              setError('密码至少需要6个字符，并包含字母和数字的组合。');
            } else {
              setError(err.response.data.message);
            }
          } else {
            setError(`服务器错误: ${err.response.status}`);
          }
        } else {
          setError(`服务器错误: ${err.response.status}`);
        }
      } else if (err.message === 'Network Error') {
        setError('无法连接到服务器，请检查您的网络连接。');
      } else {
        setError(`注册失败: ${err.message || '未知错误'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">创建账户</h1>
          <p className="auth-subtitle">请填写以下信息完成注册</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">用户名</label>
            <div className="form-input-container">
              <input
                id="username"
                type="text"
                name="username"
                className="form-input"
                placeholder="请选择用户名"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">邮箱</label>
            <div className="form-input-container">
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="您的邮箱地址"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">密码</label>
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
                {showPassword ? "隐藏" : "显示"}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">确认密码</label>
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
                {showConfirmPassword ? "隐藏" : "显示"}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        
        <div className="auth-footer">
          已有账户？{" "}
          <Link to="/" className="auth-link">
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
}; 