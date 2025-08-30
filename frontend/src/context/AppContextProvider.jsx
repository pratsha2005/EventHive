import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "./AppContext";

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const [isLoggedin, setIsLoggedin] = useState(
    localStorage.getItem("isLoggedin") === "true"
  );
  const [userData, setUserData] = useState(null);

  // Axios defaults
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = backendUrl;

  // Fetch user data
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      data.success ? setUserData(data.userData) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Check authentication
  const getAuthStatus = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedin(true);
        setUserData(data.userData);
      } else {
        setIsLoggedin(false);
        setUserData(null);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Persist login state & fetch data when isLoggedin changes
  useEffect(() => {
    localStorage.setItem("isLoggedin", isLoggedin ? "true" : "false");
    getUserData();
  }, [isLoggedin]);

  // Initial auth check on mount
  useEffect(() => {
    if (localStorage.getItem("isLoggedin") === "true") {
      getUserData();
    }
    getAuthStatus();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
