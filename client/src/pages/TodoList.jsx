//  import { useEffect, useState } from "react";
//  import { getTasks, deleteTask } from "../api/tasks";
// import { useAuth } from "../context/AuthContext";

// export default function TodoList() {
//    const { user } = useAuth();
//       const [tasks, setTasks] = useState([]);

//   const fetchTasks = async () => {
//     const { data } = await getTasks(user.token);
//     setTasks(data);
//   };

//    const handleDelete = async (id) => {
//     await deleteTask(id, user.token);
//      fetchTasks();
//    };

//    useEffect(() => { fetchTasks(); }, []);

//   return (
//     <ul>
//        {tasks.map((task) => (
//         <li key={task._id}>
//            {task.title}
//           <button onClick={() => handleDelete(task._id)}>Delete</button>
//          </li>
//        ))}
//      </ul>
//   );
//  }
import React, { useState, useEffect } from 'react';

const TaskListDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample tasks for demo (replace with API call)
  const sampleTasks = [
    {
      _id: '1',
      name: 'Read',
      description: 'Read a book for 30 minutes',
      color: '#EAB308',
      status: 'todo',
      tag: 'Daily Routine',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2', 
      name: 'Read',
      description: 'Complete chapter 5',
      color: '#3B82F6',
      status: 'todo',
      tag: 'Study Routine',
      createdAt: new Date().toISOString()
    }
  ];

  // Calendar data for February 2024
  const calendarDays = [
    { day: '', empty: true },
    { day: '', empty: true },
    { day: '', empty: true },
    { day: '', empty: true },
    { day: '1', date: 1 },
    { day: '2', date: 2 },
    { day: '3', date: 3 },
    { day: '4', date: 4 },
    { day: '5', date: 5 },
    { day: '6', date: 6 },
    { day: '7', date: 7 },
    { day: '8', date: 8 },
    { day: '9', date: 9 },
    { day: '10', date: 10 },
    { day: '11', date: 11 },
    { day: '12', date: 12 },
    { day: '13', date: 13 },
    { day: '14', date: 14 },
    { day: '15', date: 15, isToday: true },
    { day: '16', date: 16 },
    { day: '17', date: 17 },
    { day: '18', date: 18 },
    { day: '19', date: 19 },
    { day: '20', date: 20 },
    { day: '21', date: 21 },
    { day: '22', date: 22 },
    { day: '23', date: 23 },
    { day: '24', date: 24 },
    { day: '25', date: 25 },
    { day: '26', date: 26 },
    { day: '27', date: 27 },
    { day: '28', date: 28 },
    { day: '29', date: 29 },
    { day: '1', date: 1, nextMonth: true },
    { day: '2', date: 2, nextMonth: true }
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fetch tasks from API
  const fetchTasks = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    if (!token) {
      setError("No token found. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/tasks", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("❌ Error fetching tasks:", err.message);
      // Use sample tasks for demo if API fails
      setTasks(sampleTasks);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'todo' : 'done';
    
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update local state
      setTasks(tasks.map(t => 
        t._id === taskId ? { ...t, status: newStatus } : t
      ));
    } catch (err) {
      console.error("❌ Error updating task:", err.message);
      // Update local state anyway for demo
      setTasks(tasks.map(t => 
        t._id === taskId ? { ...t, status: newStatus } : t
      ));
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  });

  const dailyRoutineTasks = tasks.filter(task => task.tag === 'Daily Routine');
  const studyTasks = tasks.filter(task => task.tag === 'Study Routine');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-sm border-r">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">Listify</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-4">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-800">February</h3>
            <p className="text-sm text-gray-500">2024</p>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center py-1">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`h-8 flex items-center justify-center text-sm cursor-pointer rounded ${
                  day.empty 
                    ? '' 
                    : day.isToday 
                      ? 'bg-green-500 text-white font-semibold' 
                      : day.nextMonth 
                        ? 'text-gray-400 hover:bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day.day}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Tasks</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Today</span>
              <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded">{todayTasks.length}</span>
            </div>
          </div>
        </div>

        {/* Lists Section */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Lists</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily Routine</span>
              <span className="text-sm text-gray-400">{dailyRoutineTasks.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Study</span>
              <span className="text-sm text-gray-400">{studyTasks.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">To do List</h1>
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h5v14z" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">N</span>
            </div>
          </div>
        </div>

        {/* Task List Content */}
        <div className="p-6">
          {/* Today Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Today</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-2">Loading tasks...</p>
              </div>
            ) : todayTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tasks for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    style={{ backgroundColor: task.color + '20' }}
                  >
                    <button
                      onClick={() => toggleTask(task._id)}
                      className={`w-5 h-5 rounded border-2 mr-4 flex items-center justify-center transition-colors ${
                        task.status === 'done' 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {task.status === 'done' && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: task.color }}
                        ></div>
                        <h3 className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.name}
                        </h3>
                      </div>
                      {task.description && (
                        <p className={`text-sm mt-1 ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      )}
                      {task.tag && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {task.tag}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Task Button */}
        <button className="fixed bottom-6 right-6 w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 transition-colors flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskListDashboard;