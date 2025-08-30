import { Event } from "../models/events.models.js";
import { Attendee } from "../models/attendee.model.js";
import Papa from "papaparse";
import { uploadToCloudinary } from "../config/cloudinary.js";



const addEvent = async(req, res) => {
    try {
        const formData = req.body
        formData.organizerId = req.user._id
        // Handle uploaded photos from multer
        let bannerUrl;
        let galleryUrls = [];

        if (req.files) {
            if (req.files.banner && req.files.banner.length > 0) {
                const bannerUpload = await uploadToCloudinary(req.files.banner[0].path, "events/banner");
                bannerUrl = bannerUpload.secure_url;
            }

            if (req.files.gallery && req.files.gallery.length > 0) {
                const galleryUploads = await Promise.all(
                req.files.gallery.map((file) => uploadToCloudinary(file.path, "events/gallery"))
                );
                galleryUrls = galleryUploads.map((p) => p.secure_url);
            }
        }

        formData.media = {
            bannerUrl,
            gallery: galleryUrls,
        };


        const newEvent = await Event.create(
            formData
        )

        const createdEvent = await Event.findById(newEvent._id);

        if(!createdEvent){
            return res.status(400).json({
                success: false,
                message: "Something went wrong in creating the event"
            })
        }

        return res.status(200)
        .json({
            success: true,
            message: "Event created successfully",
            data: createdEvent
        })

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false, message: error.message 
        });
    }
}

const editEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventToBeEdited = await Event.findById(eventId);

    if (!eventToBeEdited) {
      return res.status(400).json({
        success: false,
        message: "No Event was found",
      });
    }

    // Handle uploaded files
    if (req.files) {
      if (req.files.banner && req.files.banner.length > 0) {
        const bannerUpload = await uploadToCloudinary(req.files.banner[0].path, "events/banner");
        req.body["media.bannerUrl"] = bannerUpload.secure_url;
      }

      if (req.files.gallery && req.files.gallery.length > 0) {
        const galleryUploads = await Promise.all(
          req.files.gallery.map((file) => uploadToCloudinary(file.path, "events/gallery"))
        );

        const newGalleryUrls = galleryUploads.map((p) => p.secure_url);
        req.body["media.gallery"] = [...(eventToBeEdited.media.gallery || []), ...newGalleryUrls];
      }
    }

    const editedEvent = await Event.findByIdAndUpdate(
      eventToBeEdited._id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!editedEvent) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong in editing the event",
      });
    }

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


const getAllEventsByEventManagerId = async(req, res) => {
  
  try {
    const managerId = req.user._id; 
    const events = await Event.find({ organizerId: managerId });

    return res.status(200).json({
        success: true, data: events 
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
        success: false, message: error.message 
    });
  }
}

const getEventById = async(req, res) => {
    try {
        const {eventId} = req.params
        const requestedEvent = await Event.findById(eventId)
        if(!requestedEvent){
            return res.status(400).json({
                success: false,
                message: "No such event found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Event fetched successfully",
            data: requestedEvent
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const exportAsCSV = async (req, res) => {
  try {
    const { eventId } = req.params;

    const attendees = await Attendee.find({ eventId: eventId });

    if (!attendees.length) {
      return res.status(404).json({ message: "No attendees found" });
    }
    const csv = Papa.unparse(
      attendees.map((a) => ({
        Name: a.name,
        Email: a.email,
        TicketType: a.ticket.type,
        Price: a.ticket.price,
        Currency: a.ticket.currency,
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
//CSV


export {
    addEvent,
    editEvent,
    getAllEventsByEventManagerId,
    getEventById,
    exportAsCSV
}