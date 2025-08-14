import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NewTask from "./pages/NewTask";
import TodoList from "./pages/TodoList";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    
    <AuthProvider>
      <Router>
      <ToastContainer position="top-center" />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/new-task" element={<ProtectedRoute><NewTask /></ProtectedRoute>} />
          <Route path="/todo" element={<ProtectedRoute><TodoList /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
          {/* <ToastContainer /> */}
  
        </Routes>
      </Router>
    </AuthProvider>
  );
}
