import mongoose from "mongoose";

const attendeeSchema = mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: { type: String, required: true },   
    email: { type: String, required: true },

    ticket: {
      ticketId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
      },
      type: {
        type: String,
        enum: ["General", "VIP", "Student", "Early Bird"],
        required: true,
      },
      price: { type: Number, required: true },
      currency: { type: String, default: "INR" },
    },

    status: {
      type: String,
      enum: ["booked", "checked-in", "cancelled"],
      default: "booked",
    },
  },
  { timestamps: true }
);

export const Attendee = mongoose.model("Attendee", attendeeSchema);
