import User from "../models/userModel.js";
import { Event } from "../models/events.models.js"; 
import { Attendee } from "../models/attendee.models.js";
import Ticket from "../models/ticket.models.js"; 
import QRCode from "qrcode";
import mongoose from "mongoose";
import { createTicketsForBooking } from "../services/ticketService.js";

export const getUserData = async (req, res) => {
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

const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { attendees } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const createdAttendees = [];

    const booking = {
      _id: new mongoose.Types.ObjectId(),
      eventId,
      tickets: [],
      eventName: event.title,
      eventDate: event.startDateTime,
      venue: event.location?.venue || "",
    };

    // Validate attendees and ticket availability
    for (const attendeeData of attendees) {
      // 🔹 Find ticket by type (instead of ticketId)
      const ticketInfo = event.tickets.find(
        (t) => t.type.toLowerCase() === attendeeData.ticketType.toLowerCase()
      );

      if (!ticketInfo) {
        return res.status(400).json({
          message: `Invalid ticket type "${attendeeData.ticketType}" for ${attendeeData.name}`,
        });
      }

      if (ticketInfo.soldCount >= ticketInfo.maxQuantity) {
        return res.status(400).json({
          message: `Ticket ${ticketInfo.type} sold out`,
        });
      }

      // Update sold count
      ticketInfo.soldCount += 1;

      booking.tickets.push({ type: ticketInfo.type });

      // Save attendee
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

    // Generate tickets + QR codes
    const createdTickets = await createTicketsForBooking(booking, user);

    res.status(201).json({
      message: "Registration successful",
      attendees: createdAttendees,
      tickets: createdTickets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export {
    getAllEvents,
    registerForEvent
}