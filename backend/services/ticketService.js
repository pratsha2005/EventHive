import QRCode from "qrcode";
import prisma from "../db/index.js";
import transporter from "../config/nodemailer.js";
import { getTicketEmailTemplate } from "../config/emailTemplates.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";

// Generate QR Code temp file
const generateQRCodeTempFile = async (ticketData) => {
  const qrData = JSON.stringify(ticketData);
  const tempPath = path.join(process.cwd(), `temp-${Date.now()}.png`);
  await QRCode.toFile(tempPath, qrData, { width: 300 });
  return tempPath;
};

// Upload QR Code to Cloudinary + cleanup
const uploadQRCodeToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "event-tickets",
    });
    return result.secure_url;
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error("Failed to delete temp QR file:", err);
    }
  }
};

// Send ticket email
const sendTicketEmail = async ({
  email,
  name,
  eventName,
  eventDate,
  venue,
  ticketType,
  qrCodeUrl,
}) => {
  const htmlContent = getTicketEmailTemplate(
    name,
    eventName,
    eventDate,
    venue,
    ticketType,
    qrCodeUrl
  );

  await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: `Your Ticket for ${eventName}`,
    html: htmlContent,
  });
};

// Main function
export const createTicketsForBooking = async (booking, attendees) => {
  const ticketsCreated = [];

  for (const attendee of attendees) {
    // Generate QR Code
    const tempFile = await generateQRCodeTempFile({
      eventId: booking.eventId,
      userId: booking.userId, // Always buyer
      attendeeId: attendee.id,
    });
    const qrUrl = await uploadQRCodeToCloudinary(tempFile);

    // Save ticket for buyer
    const ticket = await prisma.ticket.create({
      data: {
        eventId: booking.eventId,
        userId: booking.userId, // Buyer
        ticketType: attendee.ticket?.type || "General",
        qrCode: qrUrl,
        sentToEmail: true,
      },
    });

    ticketsCreated.push(ticket);

    // Send email to attendee
    await sendTicketEmail({
      email: attendee.email,
      name: attendee.name,
      eventName: booking.eventName,
      eventDate: booking.eventDate,
      venue: booking.venue,
      ticketType: ticket.ticketType,
      qrCodeUrl: qrUrl,
    });
  }

  return ticketsCreated;
};
