import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ListifyDashboard = () => {

    const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };
  const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

  // Form states
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#10B981');
  const [repeat, setRepeat] = useState(false);
  const [repeatType, setRepeatType] = useState('none');
  const [tag, setTag] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Task display states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('today'); // 'today', 'tomorrow', 'date', 'overdue'
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taskCounts, setTaskCounts] = useState({
    today: 0,
    tomorrow: 0,
    overdue: 0,
    total: 0
  });

  const colors = [
    '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', 
    '#EAB308', '#22C55E', '#14B8A6', '#3B82F6',
    '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
    '#ffffff'
  ];

  const repeatTypes = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const availableTags = ['Daily Routine', 'Study Routine', 'Work', 'Personal'];

  // Generate current month calendar
  const generateCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = current.getMonth() === currentMonth;
      const isToday = current.toDateString() === today.toDateString();
      const isSelected = selectedDate && current.toDateString() === selectedDate.toDateString();
      
      days.push({
        date: new Date(current),
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isEmpty: false
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendar();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const repeatDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // API helper function
  const getAuthHeaders = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;
    
    if (!token) {
      //alert("No token found. Please log in again.");
      toast.error("No token found. Please log in again.")
      window.location.href = "/login";
      return null;
    }

    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  // Fetch tasks by date type
  const fetchTasksByDateType = async (dateType) => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`http://localhost:5001/api/tasks/date-type/${dateType}`, {
        headers
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks by specific date
  const fetchTasksByDate = async (date) => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const formattedDate = date.toISOString().split('T')[0];
      const response = await fetch(`http://localhost:5001/api/tasks/date/${formattedDate}`, {
        headers
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch task counts for sidebar
  const fetchTaskCounts = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const [todayRes, tomorrowRes, overdueRes] = await Promise.all([
        fetch(`http://localhost:5001/api/tasks/date-type/today`, { headers }),
        fetch(`http://localhost:5001/api/tasks/date-type/tomorrow`, { headers }),
        fetch(`http://localhost:5001/api/tasks/date-type/overdue`, { headers })
      ]);

      const [todayData, tomorrowData, overdueData] = await Promise.all([
        todayRes.json(),
        tomorrowRes.json(),
        overdueRes.json()
      ]);

      setTaskCounts({
        today: todayData.count || 0,
        tomorrow: tomorrowData.count || 0,
        overdue: overdueData.count || 0,
        total: (todayData.count || 0) + (tomorrowData.count || 0) + (overdueData.count || 0)
      });
    } catch (error) {
      console.error('Error fetching task counts:', error);
    }
  };

  // Load tasks based on current view
  const loadTasks = () => {
    if (currentView === 'date') {
      fetchTasksByDate(selectedDate);
    } else {
      fetchTasksByDateType(currentView);
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentView('date');
  };

  // Handle view change (today, tomorrow, overdue)
  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === 'today') {
      setSelectedDate(new Date());
    } else if (view === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchTaskCounts();
    loadTasks();
  }, []);

  // Reload tasks when view changes
  useEffect(() => {
    loadTasks();
  }, [currentView, selectedDate]);

  // Task submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskName.trim()) {
      
      toast.error('Task name is required')
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const taskData = {
        name: taskName,
        description,
        color,
        repeat,
        repeatType: repeat ? repeatType : "none",
        tag,
      };

      // Add dates if provided
      if (dueDate) taskData.dueDate = dueDate;
      if (scheduledDate) taskData.scheduledDate = scheduledDate;

      const response = await fetch("http://localhost:5001/api/tasks", {
        method: "POST",
        headers,
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Task created:", data);

      // Reset form
      setTaskName("");
      setDescription("");
      setColor("#10B981");
      setRepeat(false);
      setRepeatType("none");
      setTag("");
      setDueDate("");
      setScheduledDate("");
      
      setIsModalOpen(false);
      
      // Refresh tasks and counts
      fetchTaskCounts();
      loadTasks();
      
     
      toast.success('Task created successfully!')

    } catch (err) {
      console.error(" Error creating task:", err.message);
      
      toast.error(`Error creating task: ${err.message}`)
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`http://localhost:5001/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update task');

      // Refresh tasks
      loadTasks();
      fetchTaskCounts();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Get display title based on current view
  const getDisplayTitle = () => {
    switch (currentView) {
      case 'today':
        return 'Today\'s Tasks';
      case 'tomorrow':
        return 'Tomorrow\'s Tasks';
      case 'overdue':
        return 'Overdue Tasks';
      case 'date':
        return `Tasks for ${selectedDate.toDateString()}`;
      default:
        return 'Tasks';
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
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
            <h3 className="font-semibold text-gray-800">
              {new Date().toLocaleDateString('en-US', { month: 'long' })}
            </h3>
            <p className="text-sm text-gray-500">{new Date().getFullYear()}</p>
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
                onClick={() => day.isCurrentMonth && handleDateSelect(day.date)}
                className={`h-8 flex items-center justify-center text-sm cursor-pointer rounded ${
                  !day.isCurrentMonth
                    ? 'text-gray-300' 
                    : day.isSelected
                      ? 'bg-blue-500 text-white font-semibold'
                      : day.isToday 
                        ? 'bg-green-500 text-white font-semibold' 
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
            <div 
              className={`flex items-center justify-between cursor-pointer p-2 rounded ${
                currentView === 'today' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleViewChange('today')}
            >
              <span className="text-sm">Today</span>
              <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
                {taskCounts.today}
              </span>
            </div>
            <div 
              className={`flex items-center justify-between cursor-pointer p-2 rounded ${
                currentView === 'tomorrow' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleViewChange('tomorrow')}
            >
              <span className="text-sm">Tomorrow</span>
              <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
                {taskCounts.tomorrow}
              </span>
            </div>
            <div 
              className={`flex items-center justify-between cursor-pointer p-2 rounded ${
                currentView === 'overdue' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleViewChange('overdue')}
            >
              <span className="text-sm">Overdue</span>
              <span className="text-sm font-semibold bg-red-100 px-2 py-1 rounded text-red-600">
                {taskCounts.overdue}
              </span>
            </div>
          </div>
        </div>

        {/* Lists Section */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Lists</h4>
          <div className="space-y-2">
            {availableTags.map((tagName) => (
              <div key={tagName} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{tagName}</span>
                <span className="text-sm text-gray-400">
                  {tasks.filter(task => task.tag === tagName).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative bg-white">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">{getDisplayTitle()}</h1>
          <div className="flex items-center space-x-3">
            <button 
              onClick={openModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Task
            </button>
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
           
            {/* <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">N</span>
            </div> */}
            <div className="relative">
      {/* Avatar Circle */}
      <div
        className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer"
        onClick={() => setDropdownOpen((prev) => !prev)}
      >
        <span className="text-white text-sm font-medium">{initial}</span>
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
          <div className="px-4 py-2 text-sm text-gray-800 font-semibold border-b">
            {user?.name || "User"}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
         
          </div>
        </div>

        {/* Task List Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No tasks found for this selection</p>
              <p className="text-sm">Click "New Task" to create one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task._id} 
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: task.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <button
                        onClick={() => updateTaskStatus(task._id, task.status === 'done' ? 'todo' : 'done')}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.status === 'done' 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {task.status === 'done' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.name}
                          {task.isRecurring && <span className="ml-2 text-blue-500">🔄</span>}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          {task.tag && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {task.tag}
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded ${
                            task.status === 'done' ? 'bg-green-100 text-green-600' :
                            task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {task.status.replace('-', ' ')}
                          </span>
                          {(task.dueDate || task.scheduledDate) && (
                            <span className="text-xs text-gray-500">
                              📅 {new Date(task.dueDate || task.scheduledDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Task Modal */}
        {isModalOpen && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  New Task
                  <svg className="w-4 h-4 ml-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </h2>
                <button 
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                  {/* Task Name */}
                  <div>
                    <input
                      type="text"
                      placeholder="Name your new task"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      className="w-full px-0 py-2 text-gray-800 placeholder-gray-400 border-0 border-b border-gray-200 focus:border-blue-500 focus:ring-0 outline-none text-sm"
                      required
                    />
                  </div>

                  {/* Task Description */}
                  <div>
                    <input
                      type="text"
                      placeholder="Describe your new task"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-0 py-2 text-gray-600 placeholder-gray-400 border-0 border-b border-gray-200 focus:border-blue-500 focus:ring-0 outline-none text-sm"
                    />
                  </div>

                  {/* Date Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Card Color */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Card Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((colorOption, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setColor(colorOption)}
                          className={`w-6 h-6 rounded-full border-2 ${
                            color === colorOption ? 'border-gray-400' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: colorOption }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tag Selection */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Tag</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tagOption) => (
                        <button
                          key={tagOption}
                          type="button"
                          onClick={() => setTag(tag === tagOption ? '' : tagOption)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            tag === tagOption
                              ? 'bg-blue-100 text-blue-600 border border-blue-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {tagOption}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Repeat Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-700">Repeat</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setRepeat(!repeat);
                          if (!repeat) setRepeatType('daily');
                          else setRepeatType('none');
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          repeat ? 'bg-gray-800' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            repeat ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {repeat && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-3">Set a cycle for your task</p>
                          <div className="space-y-2">
                            {repeatTypes.map((type) => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => setRepeatType(type.value)}
                                className={`w-full px-3 py-2 rounded-lg text-sm text-left ${
                                  repeatType === type.value
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                {type.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Week Days Selection (for weekly repeat) */}
                        {repeatType === 'weekly' && (
                          <div>
                            <div className="flex justify-center space-x-1 mb-2">
                              {repeatDays.map((day) => (
                                <button
                                  key={day}
                                  type="button"
                                  className="w-7 h-7 rounded text-xs text-gray-500 hover:bg-gray-100 flex items-center justify-center"
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 px-2">
                              <span>Repeat</span>
                              <span>Every week &gt;</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end p-6 border-t space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListifyDashboard;
