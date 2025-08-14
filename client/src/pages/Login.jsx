import { FaGoogle, FaGithub, FaApple } from "react-icons/fa";
import React, { useState } from "react";
import axios from "axios";
 import { toast } from "react-toastify";
 import { useNavigate } from "react-router-dom";
 import { useAuth } from "../context/AuthContext"; 

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const navigate = useNavigate();
    const { setUser } = useAuth(); // get setUser from AuthContext
  
    const handleChange = (e) => {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    };
  
const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("https://task-manager-app-j9mh.onrender.com/api/auth/login", formData);
      console.log("Server response:", res.data);

      // ✅ Combine user and token
      const fullUser = {
        ...res.data.user,
        token: res.data.token,
      };

      // ✅ Save to localStorage and Context
      localStorage.setItem("user", JSON.stringify(fullUser));
      setUser(fullUser); // update AuthContext

      toast.success("Login successful!");

      // ✅ Navigate to task page after short delay
      setTimeout(() => {
        navigate("/new-task");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };
  

  return (
    // <div className="min-h-screen bg-white flex items-center justify-center px-4">
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden">
      {/* Background Wave Pattern */}
      {/* <div className="absolute inset-0 overflow-hidden"> */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-6 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-800">Listify</span>
        </div>
        <div className="flex space-x-6">
          <button className="text-gray-600 hover:text-gray-800 transition-colors">About us</button>
          <button className="text-gray-600 hover:text-gray-800 transition-colors">Contacts</button>
        </div>
      </div>
      <div className="absolute inset-0 top-0 left-0 w-full h-full z-0 overflow-hidden">
        <svg className="absolute bottom-0 w-full h-full opacity-20" viewBox="0 0 1440 320">
          <path
            fill="#3b82f6"
            fillOpacity="1"
            d="M0,64L60,85.3C120,107,240,149,360,154.7C480,160,600,128,720,112C840,96,960,96,1080,112C1200,128,1320,160,1380,176L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="bg-white z-10 rounded-3xl shadow-xl max-w-md w-full p-8 md:p-12 text-center">
        <h2 className="text-2xl font-semibold text-blue-700 mb-2">Login</h2>
        <p className="text-gray-600 text-sm mb-4">
          Welcome back! Sign in using your social account or email to continue us
        </p>

        <div className="flex justify-center gap-4 mb-6">
          {/* <img src="/google-icon.png" alt="Google" className="w-6 h-6 cursor-pointer" />
          <img src="/github-icon.png" alt="GitHub" className="w-6 h-6 cursor-pointer" />
          <img src="/apple-icon.png" alt="Apple" className="w-6 h-6 cursor-pointer" /> */}
          {/* <FaGoogle className="text-2xl text-gray-600 cursor-pointer" /> */}
          <div className="w-6 h-6">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
    <defs>
      <linearGradient id="facebookGradient" x1="9.993" x2="40.615" y1="9.993" y2="40.615" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#2aa4f4" />
        <stop offset="1" stopColor="#007ad9" />
      </linearGradient>
    </defs>
    <path fill="url(#facebookGradient)" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z" />
    <path fill="#fff" d="M26.707,29.301h5.176l0.813-5.258h-5.989v-2.874
      c0-2.184,0.714-4.121,2.757-4.121h3.283V12.46 
      c-0.577-0.078-1.797-0.248-4.102-0.248
      c-4.814,0-7.636,2.542-7.636,8.334v3.498H16.06v5.258h4.948v14.452 
      C21.988,43.9,22.981,44,24,44
      c0.921,0,1.82-0.084,2.707-0.204V29.301z"/>
  </svg>
</div>
          
          <div className="w-6 h-6">
            
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
    <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
</div>
{/* <FaGithub className="text-2xl text-gray-600 cursor-pointer" /> */}
<FaApple className="text-2xl text-gray-600 cursor-pointer" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full border-b border-gray-300 focus:outline-none py-2 px-1"
            value={formData.name}
            onChange={handleChange}
            required
          /> */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border-b border-gray-300 focus:outline-none py-2 px-1"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border-b border-gray-300 focus:outline-none py-2 px-1"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-black font-medium py-2 rounded-lg shadow"
          >
            Login
          </button>
        </form>
      </div>
    </div>
    // </div>
  );
};

export default Login;
