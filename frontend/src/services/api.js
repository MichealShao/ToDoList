import axios from 'axios';

// Create API base configuration - dynamically select endpoint based on environment
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001' 
  : 'https://todo-backend-mocha-iota.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add authentication token to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set token according to backend's required format
      config.headers['Authorization'] = `Bearer ${token}`;
      // Keep x-auth-token for compatibility with possible old configurations
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid or expired, redirect to login page
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication related APIs
export const authAPI = {
  // User registration
  register: async (userData) => {
    try {
      console.log('API register call with data:', {
        ...userData,
        password: '[HIDDEN]' 
      });
      
     
      const url = '/api/register';
      console.log('Registration URL:', API_BASE_URL + url);
      
      const response = await api.post(url, userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration API error:', error);
      
      if (error.response) {
        console.error('Server response:', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      throw error;
    }
  },
  
  // User login
  login: async (credentials) => {
    try {
      console.log('API login call with data:', {
        ...credentials,
        password: '[HIDDEN]' 
      });
      
      // Ensure API uses the correct URL
      const url = '/api/login';
      console.log('Login URL:', API_BASE_URL + url);
      
      const response = await api.post(url, credentials);
      console.log('Login response:', {
        success: true,
        hasToken: !!response.data.token,
        tokenLength: response.data.token ? response.data.token.length : 0
      });
      
      // Store token if returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('Token stored in localStorage');
      } else {
        console.warn('No token received from server');
      }
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      
      if (error.response) {
        console.error('Server response:', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('token');
    // Don't delete saved email in localStorage to auto-fill on next login
    console.log('User logged out, but remembered email is preserved');
  }
};

// Normalize date string format (YYYY-MM-DD), not affected by timezone
const normalizeDateString = (dateStr) => {
  if (!dateStr) return null;
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  // Process date string that may contain time part
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Task related APIs
export const tasksAPI = {
  // Get all tasks
  getAllTasks: async () => {
    try {
      const response = await api.get('/api/tasks');
      
      // Map backend's start_time field to frontend's startTime
      if (response.data && response.data.tasks && Array.isArray(response.data.tasks)) {
        response.data.tasks = response.data.tasks.map(task => ({
          ...task,
          startTime: task.start_time, // Map field
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('Get tasks error:', error.response?.data || error.message || 'Unknown error');
      // If no response, might be a network issue
      if (!error.response) {
        throw new Error('Network Error: Unable to connect to the server');
      }
      throw error;
    }
  },
  
  // Get single task
  getTask: async (id) => {
    try {
      const response = await api.get(`/api/tasks/${id}`);
      
      // Map start_time to startTime
      const taskWithStartTime = {
        ...response.data,
        startTime: response.data.start_time
      };
      
      return taskWithStartTime;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  // Create new task
  createTask: async (taskData) => {
    try {
      // Ensure date format is correct and add UTC time conversion
      const normalizedTask = {
        ...taskData,
        deadline: taskData.deadline,  // Frontend has already processed into correct UTC format
        start_time: taskData.startTime, // Frontend has already processed into correct UTC format
        // Don't include startTime field to avoid redundancy
        startTime: undefined,
        createdAt: taskData.createdAt // Frontend has already processed into correct UTC format
      };
      
      console.log('Sending data to API:', normalizedTask);
      const response = await api.post('/api/tasks', normalizedTask);
      
      // Map response data, convert start_time to startTime
      const responseWithStartTime = {
        ...response.data,
        startTime: response.data.start_time
      };
      
      return responseWithStartTime;
    } catch (error) {
      console.error('Create task error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Update task
  updateTask: async (taskId, taskData) => {
    try {
      // Ensure date format is correct and add UTC time conversion
      const normalizedTask = {
        ...taskData,
        deadline: taskData.deadline, // Frontend has already processed into correct UTC format
        start_time: taskData.startTime, // Frontend has already processed into correct UTC format
        // Don't include startTime field to avoid redundancy
        startTime: undefined
      };
      
      console.log('Updating task with data:', normalizedTask);
      const response = await api.put(`/api/tasks/${taskId}`, normalizedTask);
      
      // Map returned data, convert start_time to startTime
      const responseWithStartTime = {
        ...response.data,
        startTime: response.data.start_time
      };
      
      return responseWithStartTime;
    } catch (error) {
      console.error('Update task error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Delete task
  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/api/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Delete task error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Add error message conversion function
const getReadableErrorMessage = (error) => {
  if (!error.response) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  const status = error.response.status;
  
  switch (status) {
    case 400:
      return 'The information you provided is invalid. Please check and try again.';
    case 401:
      return 'You need to log in again to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested information could not be found.';
    case 409:
      return 'This information conflicts with existing data.';
    case 500:
      return 'Something went wrong on our server. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export default api; 
