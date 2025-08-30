import User from "../models/userModel.js";
import { Event } from "../models/events.models.js"; 
import { Attendee } from "../models/attendee.models.js";
import Ticket from "../models/ticket.models.js"; 
import mongoose from "mongoose";
import { createTicketsForBooking } from "../services/ticketService.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

 const getUserData = async (req, res) => {
    try {
        const userId = req.userId; 
        const user = await User.findById(userId).lean();
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            userData: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


const getAllEvents = async(req, res) => {
    try {
        const events = await Event.find().populate("organizerId", "name email"); 
        if(!events){
            return res.status(400).json({
              success: false,
              message: "No Events fetched"
            })
        }
        res.status(200).json({
        success: true,
        count: events.length,
        data: events,
        message: "Events fetched successfully"
        });

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}



/**
 * Registers user for an event.
 * If called from Stripe payment success, attendees can be passed as parameter
 * instead of req.body.
 */
const registerForEvent = async (eventId, attendeesInput, userIdInput) => {
  try {
    const userId = userIdInput;
    const attendees = attendeesInput;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    const createdAttendees = [];

    const booking = {
      _id: new mongoose.Types.ObjectId(),
      eventId,
      tickets: [],
      eventName: event.title,
      eventDate: event.startDateTime,
      venue: event.location?.venue || "",
    };

    for (const attendeeData of attendees) {
      const ticketInfo = event.tickets.find(
        (t) => t.type.toLowerCase() === attendeeData.ticketType.toLowerCase()
      );

      if (!ticketInfo) throw new Error(`Invalid ticket type "${attendeeData.ticketType}" for ${attendeeData.name}`);
      if (ticketInfo.soldCount >= ticketInfo.maxQuantity) throw new Error(`Ticket ${ticketInfo.type} sold out`);

      ticketInfo.soldCount += 1;
      booking.tickets.push({ type: ticketInfo.type });

      const attendee = await Attendee.create({
        eventId,
        name: attendeeData.name,
        email: attendeeData.email,
        ticket: {
          ticketId: ticketInfo._id,
          type: ticketInfo.type,
          price: ticketInfo.price,
          currency: ticketInfo.currency,
        },
        status: "booked",
      });

      createdAttendees.push(attendee);
    }

    await event.save();

    const createdTickets = await createTicketsForBooking(booking, user);

    return { message: "Registration successful", attendees: createdAttendees, tickets: createdTickets };
  } catch (err) {
    console.error("registerForEvent error:", err);
    throw err; // Throw error so it can be caught by Stripe controller
  }
};


const getMyBookings = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user to verify existence (optional if you trust userId)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find all tickets for the user
    const myTickets = await Ticket.find({ userId })
      .populate("eventId")   // populate event details

    // Format response
    const bookings = myTickets.map(ticket => ({
      ticketId: ticket._id,
      ticketType: ticket.ticketType,
      qrCode: ticket.qrCode,
      barcode: ticket.barcode,
      status: ticket.status,
      delivery: ticket.delivery,
      event: {
        id: ticket.eventId._id,
        title: ticket.eventId.title,
        date: ticket.eventId.date,
        startDateTime: ticket.eventId.startDateTime,
        endDateTime: ticket.eventId.endDateTime,
        venue: ticket.eventId.venue,
        location: ticket.eventId.location,
        image: ticket.eventId.image,
        category: ticket.eventId.category,
      },
      
    }));

    res.status(200).json({
      message: "My bookings fetched successfully",
      data: bookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

 const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const updateData = { name };

    // Handle avatar upload if present
    if (req.file) {
      // If using Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.path, "avatars");
      updateData.avatar = uploadResult.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export {
  updateProfile,
  getUserData,
    getAllEvents,
    getMyBookings,
    registerForEvent
}