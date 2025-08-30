import React from 'react';
import { FiBell, FiUserPlus, FiUser } from 'react-icons/fi';
import {Link} from "react-router-dom"
const AttendeeNavBar = () => (
  <nav className="bg-white shadow-md sticky top-0 z-30">
    <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-extrabold text-indigo-600 select-none cursor-default">EventHive</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Link to={'/my-bookings'} className="hidden sm:flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition">
          <FiUserPlus size={18} />
          <span>My Bookings</span>
        </Link>
        <button className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Notifications">
          <FiBell size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Profile">
          <FiUser size={20} />
        </button>
      </div>
    </div>
  </nav>
);

export default AttendeeNavBar;