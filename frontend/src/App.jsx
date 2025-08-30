import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import EmailVerify from './pages/auth/EmailVerify'
import ResetPassword from './pages/auth/ResetPassword'
import LandingPage from './pages/Landing'

import AttendeeHome from './pages/user/AttendeeHome';
import MyBookings from './pages/user/MyBookings';

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        {/* <Route path="/" element={<Login />} /> */}
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Attendee or Organizer Routes */}
        <Route path="/my-bookings" element={<MyBookings/>} />
        <Route path="/attendeeHome" element={<AttendeeHome/>} />

      </Routes>
    </div>
  )
}

export default App