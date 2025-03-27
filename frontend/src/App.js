// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { 
  createRoutesFromElements, 
  createBrowserRouter, 
  RouterProvider 
} from "react-router-dom";

import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/SignUp';
import TodoList from './components/todo/TodoList';

// 添加React Router v7的future flags
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* 待办父路由 */}
      <Route path="/todolist" element={<TodoLayout />}>
        {/* 默认子路由：查看待办列表 */}
        <Route index element={<TodoList />} />
      </Route>
    </Route>
  ),
  {
    // 添加future flags来消除警告
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  // 使用新的RouterProvider代替Router
  return <RouterProvider router={router} />;
}

/**
 * 父层布局组件：可在这里做一些共同布局，比如标题栏等
 * <Outlet /> 负责渲染子路由对应的内容
 */
function TodoLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;
