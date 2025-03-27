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

  // 页面加载时检查localStorage是否有保存的email
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
      console.log('登录尝试, 使用凭证:', { 
        email: formData.email, 
        password: 'HIDDEN' 
      });
      
      // 只使用email登录
      const response = await authAPI.login({ 
        email: formData.email, 
        password: formData.password 
      });
      
      console.log('登录成功, 收到响应:', { 
        token: response.token ? 'JWT_TOKEN_RECEIVED' : 'NO_TOKEN' 
      });
      
      // 如果用户勾选了"记住我"，则保存email到localStorage
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        console.log('Email已保存到localStorage:', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
        console.log('已清除localStorage中保存的Email');
      }
      
      navigate('/todolist');
    } catch (err) {
      console.error('登录错误:', err);
      
      if (err.response) {
        console.error('服务器响应:', { 
          status: err.response.status,
          data: err.response.data 
        });
      }
      
      setLoading(false);
      
      if (err.response && err.response.status === 401) {
        setError('邮箱或密码不正确，请重试。');
      } else if (err.response && err.response.status === 400) {
        setError('请输入有效的邮箱和密码。');
      } else if (err.message === 'Network Error') {
        setError('无法连接到服务器，请检查您的网络连接。');
      } else {
        setError('当前无法登录，请稍后再试。');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">登录账户</h1>
          <p className="auth-subtitle">请输入您的登录信息</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
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
          
          <div className="checkbox-container">
            <input
              id="remember"
              type="checkbox"
              name="rememberMe"
              className="checkbox-input"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <label htmlFor="remember">记住我</label>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="auth-footer">
          还没有账户？{" "}
          <Link 
            to={{
              pathname: "/signup",
              // 由于React Router v6不再支持location state传递，改用URL参数
            }}
            onClick={() => {
              // 使用sessionStorage暂时存储登录表单数据，以便注册页面可以使用
              if (formData.email || formData.password) {
                sessionStorage.setItem('loginFormData', JSON.stringify({
                  email: formData.email,
                  password: formData.password
                }));
              }
            }}
            className="auth-link"
          >
            注册
          </Link>
        </div>
      </div>
    </div>
  );
}; 