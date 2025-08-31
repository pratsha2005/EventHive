import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiHome,
  FiCalendar,
  FiBarChart2,
  FiSettings,
  FiPlusCircle,
  FiUsers,
} from "react-icons/fi";
import { FaTicketAlt } from "react-icons/fa";

import { AppContext } from "../context/AppContext";
import { useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const Navbar = () => {
  const { isLoggedin, setIsLoggedin, backendUrl } = useContext(AppContext);

  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const { data } = await axios.get(`${backendUrl}/api/user/data`, { withCredentials: true });
          console.log("User data response:", data);
          if (data.success) {
            setUserData(data.userData);
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to fetch user data");
        }
      };
      fetchUser();
    }, [backendUrl]);

  
  const publicNav = [
    { name: "Home", href: "/", icon: FiHome },
  ];

  const attendeeNav = [
    { name: "Home", href: "/", icon: FiHome },
    { name: "Explore Events", href: "/events", icon: FiCalendar },
  ];

  const organizerNav = [
    { name: "Home", href: "/", icon: FiHome },
    { name: "Create Event", href: "/create-event", icon: FiPlusCircle },
  ];

  const adminNav = [
    { name: "Home", href: "/", icon: FiHome },
    { name: "User Management", href: "/admin/users", icon: FiUsers },
    { name: "All Events", href: "/admin/events", icon: FiCalendar },
    { name: "System Analytics", href: "/admin/analytics", icon: FiSettings },
  ];

  const getNavItems = () => {
    if (userData?.role === "attendee") return attendeeNav;
    if (userData?.role === "organizer") return organizerNav;
    if (userData?.role === "admin") return adminNav;
    return publicNav;
  };

  const handleLogout = () => {
    setIsLoggedin(false);
    localStorage.removeItem("isLoggedin");
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center rounded-2xl">
            <Link to="/" className="flex items-center space-x-2">
            <div className="inline-flex items-center  gap-2">
              {/* Logo */}
              <img
                src="/logo.jpg" 
                alt="EventHive Logo"
                className="w-30 h-30 object-contain"
              />
            </div>
            </Link>
          </div>

        
          <div className="hidden md:flex items-center space-x-4">
            {(isLoggedin ? getNavItems() : publicNav).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

           
            <div className="ml-6 flex items-center space-x-3">
              {!isLoggedin ? (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 font-medium">{userData?.name}</span>
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium hover:shadow-lg transition-all duration-200"
                    >
                      {userData ? (
                        <img
                          src={userData?.avatar}
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <FiUser size={20} />
                      )}
                    </button>

                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                        <Link
                          to="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <FiUser size={16} className="mr-2" />
                          Profile
                        </Link>

                        {/* 🔹 My Bookings (for attendees) */}
                        {userData?.role === "attendee" && (
                          <Link
                            to="/my-bookings"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <FaTicketAlt size={16} className="mr-2" />
                            My Bookings
                          </Link>
                        )}

                        {/* 🔹 My Events (for organizers) */}
                        {userData?.role === "organizer" && (
                          <Link
                            to="/my-events"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <FiCalendar size={16} className="mr-2" />
                            My Events
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <FiLogOut size={16} className="mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/90 backdrop-blur-sm rounded-lg mt-2 shadow-lg border border-blue-100 mb-2">
              {(isLoggedin ? getNavItems() : publicNav).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              
              <div className="border-t border-gray-200 pt-3 mt-3">
                {!isLoggedin ? (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-left px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                    >
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-3">
                      <FiUser size={16} />
                      <span className="text-gray-700 font-medium">
                        {userData?.name}
                      </span>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-3 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <FiUser size={16} className="mr-2" />
                      Profile
                    </Link>

                    {/* 🔹 My Bookings (Mobile, for attendees) */}
                    {userData?.role === "attendee" && (
                      <Link
                        to="/my-bookings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-3 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      >
                        <FaTicketAlt size={16} className="mr-2" />
                        My Bookings
                      </Link>
                    )}

                    {/* 🔹 My Events (Mobile, for organizers) */}
                    {userData?.role === "organizer" && (
                      <Link
                        to="/my-events"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-3 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      >
                        <FiCalendar size={16} className="mr-2" />
                        My Events
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <FiLogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
