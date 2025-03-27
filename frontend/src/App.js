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

// Add React Router v7 future flags
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Todo parent route */}
      <Route path="/todolist" element={<TodoLayout />}>
        {/* Default child route: view todo list */}
        <Route index element={<TodoList />} />
      </Route>
    </Route>
  ),
  {
    // Add future flags to eliminate warnings
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  // Use new RouterProvider instead of Router
  return <RouterProvider router={router} />;
}

/**
 * Parent layout component: can add common layout elements like headers
 * <Outlet /> renders the content of child routes
 */
function TodoLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;
