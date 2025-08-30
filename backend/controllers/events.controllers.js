import prisma from "../db/index.js"; 
import Papa from "papaparse";
import { uploadToCloudinary } from "../config/cloudinary.js";

// DELETE EVENT
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "No such event found",
      });
    }

    // Transaction ensures all deletes succeed or rollback
    await prisma.$transaction(async (tx) => {
      // delete attendees
      await tx.attendee.deleteMany({ where: { eventId } });
      // delete tickets issued for this event
      await tx.ticket.deleteMany({ where: { eventId } });
      // delete ticket types (EventTicket)
      await tx.eventTicket.deleteMany({ where: { eventId } });
      // finally delete the event itself
      await tx.event.delete({ where: { id: eventId } });
    });

    return res.status(200).json({
      success: true,
      message: "Event and related data deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const addEvent = async (req, res) => {
  try {
    const formData = req.body;
    formData.organizerId = req.userId;

    // Dates
    if (formData.startDateTime) {
      formData.startDateTime = new Date(formData.startDateTime);
    }
    if (formData.endDateTime) {
      formData.endDateTime = new Date(formData.endDateTime);
    }

    // Tickets
    if (formData.tickets) {
      const ticketsArray =
        typeof formData.tickets === "string"
          ? JSON.parse(formData.tickets)
          : formData.tickets;

      formData.tickets = {
        create: ticketsArray.map((ticket) => ({
          ...ticket,
          price: Number(ticket.price), // ensure numeric
        })),
      };
    }

    // Location mapping
    if (formData.location && typeof formData.location === "string") {
      try {
        formData.location = JSON.parse(formData.location);
      } catch (err) {
        console.error("Failed to parse location:", err);
      }
    }

    const location = formData.location || {};
    const locationData = {
      locationVenue: location.venue || null,
      locationAddress: location.address || null,
      locationCity: location.city || null,
      locationState: location.state || null,
      locationCountry: location.country || null,
      locationPincode: location.pincode || null,
      geoLat: location.geo?.lat || null,
      geoLng: location.geo?.lng || null,
    };

    // Media upload
    let bannerUrl;
    let galleryUrls = [];

    if (req.files) {
      if (req.files.banner && req.files.banner.length > 0) {
        const bannerUpload = await uploadToCloudinary(
          req.files.banner[0].path,
          "events/banner"
        );
        bannerUrl = bannerUpload.secure_url;
      }

      if (req.files.gallery && req.files.gallery.length > 0) {
        const galleryUploads = await Promise.all(
          req.files.gallery.map((file) =>
            uploadToCloudinary(file.path, "events/gallery")
          )
        );
        galleryUrls = galleryUploads.map((p) => p.secure_url);
      }
    }

    // Save to Prisma
    const createdEvent = await prisma.event.create({
      data: {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags || [],
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        organizerId: formData.organizerId,
        ...locationData,
        mediaBannerUrl: bannerUrl,
        mediaGallery: galleryUrls,
        tickets: formData.tickets,
      },
      include: {
        tickets: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Event created successfully",
      data: createdEvent,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};




// EDIT EVENT
const editEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const eventToBeEdited = await prisma.event.findUnique({
      where: { id: eventId },
      include: { tickets: { include: { attendees: true } } },
    });

    if (!eventToBeEdited) {
      return res.status(400).json({ success: false, message: "No Event was found" });
    }

    // Parse tickets if sent as string
    let ticketsArray = [];
    if (req.body.tickets) {
      if (typeof req.body.tickets === "string") {
        try {
          ticketsArray = JSON.parse(req.body.tickets);
        } catch (err) {
          console.error("Failed to parse tickets:", err);
        }
      } else {
        ticketsArray = req.body.tickets;
      }
    }

    // Parse location if sent as string
    if (req.body.location && typeof req.body.location === "string") {
      try {
        req.body.location = JSON.parse(req.body.location);
      } catch (err) {
        console.error("Failed to parse location:", err);
      }
    }

    // Handle media
    let updatedBanner = eventToBeEdited.mediaBannerUrl;
    let updatedGallery = eventToBeEdited.mediaGallery || [];

    if (req.files) {
      if (req.files.banner && req.files.banner.length > 0) {
        const bannerUpload = await uploadToCloudinary(
          req.files.banner[0].path,
          "events/banner"
        );
        updatedBanner = bannerUpload.secure_url;
      }

      if (req.files.gallery && req.files.gallery.length > 0) {
        const galleryUploads = await Promise.all(
          req.files.gallery.map((file) =>
            uploadToCloudinary(file.path, "events/gallery")
          )
        );
        updatedGallery = [...updatedGallery, ...galleryUploads.map((p) => p.secure_url)];
      }
    }

    // --------- Ticket Handling ----------
    for (const oldTicket of eventToBeEdited.tickets) {
      const matchingNew = ticketsArray.find((nt) => nt.type === oldTicket.type);

      if (oldTicket.attendees.length > 0) {
        // if attendees exist, just update ticket instead of deleting
        if (matchingNew) {
          await prisma.eventTicket.update({
            where: { id: oldTicket.id },
            data: {
              price: Number(matchingNew.price),
              maxQuantity: parseInt(matchingNew.maxQuantity), // ✅ ensure Int
              perUserLimit: matchingNew.perUserLimit ? parseInt(matchingNew.perUserLimit) : 1, // ✅ ensure Int
            },
          });
        }
      } else {
        // no attendees → safe to delete
        await prisma.eventTicket.delete({ where: { id: oldTicket.id } });
      }
    }

    // Create new tickets that don’t exist yet
    for (const nt of ticketsArray) {
      const exists = eventToBeEdited.tickets.some((t) => t.type === nt.type);
      if (!exists) {
        await prisma.eventTicket.create({
          data: {
            eventId,
            type: nt.type,
            price: Number(nt.price),                // ensure float
            currency: nt.currency || "INR",
            maxQuantity: parseInt(nt.maxQuantity),  // ensure int
            perUserLimit: nt.perUserLimit ? parseInt(nt.perUserLimit) : 1,
          },
        });
      }
    }

    // --------- Update Event itself ----------
    const location = req.body.location || {};
    const editedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        tags: req.body.tags || [],
        startDateTime: req.body.startDateTime
          ? new Date(req.body.startDateTime)
          : eventToBeEdited.startDateTime,
        endDateTime: req.body.endDateTime
          ? new Date(req.body.endDateTime)
          : eventToBeEdited.endDateTime,
        locationVenue: location.venue || null,
        locationAddress: location.address || null,
        locationCity: location.city || null,
        locationState: location.state || null,
        locationCountry: location.country || null,
        locationPincode: location.pincode || null,
        geoLat: location.geo?.lat || null,
        geoLng: location.geo?.lng || null,
        mediaBannerUrl: updatedBanner,
        mediaGallery: updatedGallery,
      },
      include: { tickets: true },
    });

    return res.status(200).json({
      success: true,
      message: "Event edited successfully",
      data: editedEvent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// GET ALL EVENTS BY MANAGER
const getAllEventsByEventManagerId = async (req, res) => {
  try {
    const managerId = req.userId;

    const events = await prisma.event.findMany({
      where: { organizerId: managerId },
      include: {
        tickets: true,
        attendees: true, // optional, remove if not needed
      },
      orderBy: { createdAt: "desc" },
    });

    // Map Prisma flat fields back into structured JSON
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
      tickets: event.tickets,
      attendeesCount: event.attendees.length,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedEvents.length,
      data: formattedEvents,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// GET EVENT BY ID
const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const requestedEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tickets: true,
        attendees: true, // optional, gives us attendee count
      },
    });

    if (!requestedEvent) {
      return res.status(404).json({
        success: false,
        message: "No such event found",
      });
    }

    const formattedEvent = {
      id: requestedEvent.id,
      title: requestedEvent.title,
      description: requestedEvent.description,
      category: requestedEvent.category,
      tags: requestedEvent.tags,
      startDateTime: requestedEvent.startDateTime,
      endDateTime: requestedEvent.endDateTime,
      location: {
        venue: requestedEvent.locationVenue,
        address: requestedEvent.locationAddress,
        city: requestedEvent.locationCity,
        state: requestedEvent.locationState,
        country: requestedEvent.locationCountry,
        pincode: requestedEvent.locationPincode,
        geo: {
          lat: requestedEvent.geoLat,
          lng: requestedEvent.geoLng,
        },
      },
      media: {
        bannerUrl: requestedEvent.mediaBannerUrl,
        gallery: requestedEvent.mediaGallery,
      },
      status: requestedEvent.status,
      tickets: requestedEvent.tickets,
      attendeesCount: requestedEvent.attendees.length,
      createdAt: requestedEvent.createdAt,
      updatedAt: requestedEvent.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: formattedEvent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// EXPORT CSV
const exportAsCSV = async (req, res) => {
  try {
    const { eventId } = req.params;

    const attendees = await prisma.attendee.findMany({
      where: { eventId },
      include: { ticket: true },
    });

    if (!attendees.length) {
      return res.status(404).json({ message: "No attendees found" });
    }

    const csv = Papa.unparse(
      attendees.map((a) => ({
        Name: a.name,
        Email: a.email,
        TicketType: a.ticket?.ticketType || "N/A",
        Price: a.ticket?.price || 0,
        Currency: a.ticket?.currency || "N/A",
        Status: a.status,
        RegisteredAt: a.createdAt,
      }))
    );

    res.header("Content-Type", "text/csv");
    res.attachment(`attendees-${eventId}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error("Error exporting CSV:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ATTENDEES BY EVENT
const getAttendeesByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;

    const attendees = await prisma.attendee.findMany({
      where: { eventId },
      include: { ticket: true },
    });

    if (!attendees.length) {
      return res.status(404).json({
        success: false,
        message: "No attendees found for this event",
      });
    }

    const attendeeDetails = attendees.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      ticket: {
        type: a.ticket?.ticketType || "N/A",
        price: a.ticket?.price || 0,
        currency: a.ticket?.currency || "N/A",
      },
      status: a.status,
      registeredAt: a.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Attendees fetched successfully",
      data: attendeeDetails,
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export {
  deleteEvent,
  addEvent,
  editEvent,
  getAllEventsByEventManagerId,
  getEventById,
  exportAsCSV,
  getAttendeesByEventId,
};
