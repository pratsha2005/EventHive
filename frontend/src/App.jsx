import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import EmailVerify from './pages/auth/EmailVerify'
import ResetPassword from './pages/auth/ResetPassword'
import LandingPage from './pages/Landing'
import Organiser from './pages/user/Organiser'
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyBookings from './pages/MyBookings';

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/my-bookings" element={<MyBookings/>} />
        <Route path="/events" element={<Events/>} />
        <Route path="/organise" element={<Organiser/>} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path='/my-bookings' element={<MyBookings/>}/>

      </Routes>
    </div>
  )
}

export default App