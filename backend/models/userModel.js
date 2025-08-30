import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, required: true, unique: true },

    passwordHash: { type: String, required: true },

    // Possible roles: admin, organizer, attendee
    role: {
      type: String,
      enum: ["admin", "organizer", "attendee"],
      default: "attendee",
    },

    avatar: {
      type: String,
      default:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemS...", 
    },

    loyaltyPoints: { type: Number, default: 0 },

    referralCode: { type: String, unique: true },

    referredBy: { type: String, default: null }, // stores referralCode of inviter

    isAccountVerified: { type: Boolean, default: false },

    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },

    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
