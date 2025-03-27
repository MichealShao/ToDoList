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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      

      <Route path="/todolist" element={<TodoLayout />}>
        <Route index element={<TodoList />} />
      </Route>
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
 
  return <RouterProvider router={router} />;
}

function TodoLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;
