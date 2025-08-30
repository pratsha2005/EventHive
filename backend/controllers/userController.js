import prisma from "../db/index.js"; 
import { createTicketsForBooking } from "../services/ticketService.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// ========================
// GET USER DATA
// ========================
const getUserData = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isAccountVerified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, userData: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========================
// GET ALL EVENTS (with organizer info)
// ========================
const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        tickets: true,
        attendees: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!events || events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Events fetched",
      });
    }

    const formattedEvents = events.map((event) => ({
      _id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      tags: event.tags,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      location: {
        venue: event.locationVenue,
        address: event.locationAddress,
        city: event.locationCity,
        state: event.locationState,
        country: event.locationCountry,
        pincode: event.locationPincode,
        geo: {
          lat: event.geoLat,
          lng: event.geoLng,
        },
      },
      media: {
        bannerUrl: event.mediaBannerUrl,
        gallery: event.mediaGallery,
      },
      status: event.status,
      organizer: event.organizer,
      tickets: event.tickets,
      attendeesCount: event.attendees.length,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedEvents.length,
      data: formattedEvents,
      message: "Events fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================
// REGISTER FOR EVENT (called from Stripe success)
// ========================
 const registerForEvent = async (eventId, attendeesInput, userIdInput) => {
  try {
    const userId = userIdInput;
    const attendees = attendeesInput;

    // Ensure buyer exists
    const buyer = await prisma.user.findUnique({ where: { id: userId } });
    if (!buyer) throw new Error("Buyer not found");

    // Fetch event + available tickets
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { tickets: true },
    });
    if (!event) throw new Error("Event not found");

    const createdAttendees = [];

    // Booking object (used for generating tickets)
    const booking = {
      eventId,
      userId, // Buyer
      tickets: [],
      eventName: event.title,
      eventDate: event.startDateTime,
      venue: event.locationVenue || "",
    };

    for (const attendeeData of attendees) {
      // find matching ticket type
      const ticketInfo = event.tickets.find(
        (t) => t.type.toLowerCase() === attendeeData.ticketType.toLowerCase()
      );

      if (!ticketInfo) {
        throw new Error(
          `Invalid ticket type "${attendeeData.ticketType}" for ${attendeeData.name}`
        );
      }
      if (ticketInfo.soldCount >= ticketInfo.maxQuantity) {
        throw new Error(`Ticket ${ticketInfo.type} sold out`);
      }

      // Increment sold count
      await prisma.eventTicket.update({
        where: { id: ticketInfo.id },
        data: { soldCount: { increment: 1 } },
      });

      booking.tickets.push({ type: ticketInfo.type });

      // Create attendee record (not tied to User)
      const attendee = await prisma.attendee.create({
        data: {
          eventId,
          name: attendeeData.name,
          email: attendeeData.email,
          ticketId: ticketInfo.id,
          status: "booked",
        },
      });

      createdAttendees.push(attendee);
    }

    // Generate tickets (for buyer, one per attendee)
    const createdTickets = await createTicketsForBooking(booking, createdAttendees);

    return {
      message: "Registration successful",
      attendees: createdAttendees,
      tickets: createdTickets,
    };
  } catch (err) {
    console.error("registerForEvent error:", err);
    throw err;
  }
};


// ========================
// GET MY BOOKINGS
// ========================
const getMyBookings = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const myTickets = await prisma.ticket.findMany({
      where: { userId },
      include: { event: true },
    });

    const bookings = myTickets.map((ticket) => {
      const event = ticket.event;
      return {
        ticketId: ticket.id,
        ticketType: ticket.ticketType,
        qrCode: ticket.qrCode,
        barcode: ticket.barcode,
        status: ticket.status,
        delivery: ticket.delivery,
        event: event
          ? {
              id: event.id,
              title: event.title,
              date: event.date,
              startDateTime: event.startDateTime,
              endDateTime: event.endDateTime,
              venue: event.venue,
              location: event.location,
              image: event.image,
              category: event.category,
            }
          : {
              id: null,
              title: "Event Deleted",
              date: null,
              startDateTime: null,
              endDateTime: null,
              venue: null,
              location: null,
              image: null,
              category: null,
            },
      };
    });

    res.status(200).json({
      message: "My bookings fetched successfully",
      data: bookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ========================
// UPDATE PROFILE
// ========================
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    const updateData = { name };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, "avatars");
      updateData.avatar = uploadResult.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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



export { updateProfile, getUserData, getAllEvents, getMyBookings, registerForEvent };
