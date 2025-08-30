import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // ✅ Initialize isLoggedin from localStorage
  const [isLoggedin, setIsLoggedin] = useState(
    localStorage.getItem("isLoggedin") === "true"
  );
  const [userData, setUserData] = useState(null);

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = backendUrl;

  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      data.success ? setUserData(data.userData) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

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

  // ✅ Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("isLoggedin", isLoggedin ? "true" : "false");
  }, [isLoggedin]);

  // ✅ On app start, check auth + get user data if already logged in
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
