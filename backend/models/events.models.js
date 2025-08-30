import mongoose from "mongoose";

const eventSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    category: {
      type: String,
      enum: ["workshop", "concert", "sports", "hackathon"],
      required: true,
    },

    tags: [{ type: String }],

    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },

    location: {
      venue: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      pincode: { type: String },
      geo: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "cancelled"],
      default: "draft",
    },

    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },

    tickets: [
      {
        ticketId: { type: mongoose.Schema.Types.ObjectId, auto: true },
        type: {
          type: String,
          enum: ["General", "VIP", "Student", "Early Bird"],
          required: true,
        },
        price: { type: Number, required: true },
        currency: { type: String, default: "USD" },
        saleStart: { type: Date },
        saleEnd: { type: Date },
        maxQuantity: { type: Number, required: true },
        perUserLimit: { type: Number, default: 1 },
        soldCount: { type: Number, default: 0 },
      },
    ],

    media: {
      bannerUrl: { type: String },
      gallery: [{ type: String }],
      streamingLink: { type: String },
    },

    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      whatsapp: { type: String },
    },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
