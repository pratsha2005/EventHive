import User from "../models/userModel.js";
import { Event } from "../models/events.models.js"; 
import { Attendee } from "../models/attendee.models.js";

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

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const createdAttendees = [];

    for (const attendeeData of attendees) {
      const ticket = event.tickets.id(attendeeData.ticketId);

      if (!ticket) {
        return res
          .status(400)
          .json({ message: `Invalid ticket for attendee ${attendeeData.name}` });
      }

      if (ticket.soldCount >= ticket.maxQuantity) {
        return res
          .status(400)
          .json({ message: `Ticket ${ticket.type} is sold out` });
      }

      const attendee = await Attendee.create({
        eventId,
        name: attendeeData.name,
        email: attendeeData.email,
        ticket: {
          ticketId: ticket._id,
          type: ticket.type,
          price: ticket.price,
          currency: ticket.currency,
        },
        status: "booked",
      });
      createdAttendees.push(attendee);

      ticket.soldCount += 1;
    }

    await event.save();

    res.status(201).json({
      message: "Registration successful",
      attendees: createdAttendees,
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