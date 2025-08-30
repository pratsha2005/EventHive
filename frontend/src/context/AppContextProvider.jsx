import { useEffect, useState, useCallback } from "react";
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
  const getUserData = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/user/data");
      if (data.success) {
        setUserData(data.userData);
        return true;
      } else {
        setUserData(null);
        return false;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
      return false;
    }
  }, []);

  // Check authentication
  const getAuthStatus = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/is-auth");
      if (data.success) {
        setIsLoggedin(true);
        setUserData(data.userData);
      } else {
        setIsLoggedin(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsLoggedin(false);
      setUserData(null);
    }
  }, []);

  // Persist login state
  useEffect(() => {
    localStorage.setItem("isLoggedin", isLoggedin ? "true" : "false");
  }, [isLoggedin]);

  // Initial auth check on mount
  useEffect(() => {
    getAuthStatus();
  }, [getAuthStatus]);

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
