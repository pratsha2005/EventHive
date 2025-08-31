import QRCode from 'qrcode';
import Ticket from '../models/ticket.models.js';
import {Attendee} from '../models/attendee.models.js';
import transporter from '../config/nodemailer.js';
import { getTicketEmailTemplate } from '../config/emailTemplates.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

// 1️⃣ Generate QR Code and save temporarily
const generateQRCodeTempFile = async (ticketData) => {
  const qrData = JSON.stringify(ticketData);
  const tempPath = path.join(process.cwd(), `temp-${Date.now()}.png`);
  await QRCode.toFile(tempPath, qrData, { width: 300 });
  return tempPath;
};

// 2️⃣ Upload QR Code to Cloudinary and delete temp file
const uploadQRCodeToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder: 'event-tickets' });
    return result.secure_url;
  } finally {
    try {
      await fs.unlink(filePath);
      console.log(`Temp QR file deleted: ${filePath}`);
    } catch (err) {
      console.error(`Failed to delete temp QR file: ${filePath}`, err);
    }
  }
};

// 3️⃣ Send ticket email
export const sendTicketEmail = async ({ email, name, eventName, eventDate, venue, ticketType, qrCodeUrl }) => {
  try {
    const htmlContent = getTicketEmailTemplate(name, eventName, eventDate, venue, ticketType, qrCodeUrl);

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: `Your Ticket for ${eventName}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Ticket email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`Error sending ticket email to ${email}:`, err);
    return null; // don’t throw, continue processing other attendees
  }
};

// 4️⃣ Create tickets for a booking and send QR email to all attendees
export const createTicketsForBooking = async (booking, attendees, userId) => {
  const ticketsCreated = [];

  // Process all attendees in parallel for speed
  await Promise.all(attendees.map(async (attendee) => {
    try {
      // Create ticket
      const ticket = new Ticket({
        bookingId: booking._id,
        eventId: booking.eventId,
        userId: userId,           
        ticketType: attendee.ticket?.type || 'General',
        delivery: { sentToEmail: true },
      });

      // Generate QR code including attendeeId
      const tempFile = await generateQRCodeTempFile({
        ticketId: ticket._id,
        bookingId: ticket.bookingId,
        eventId: ticket.eventId,
        userId: userId,
        attendeeId: attendee._id,
      });

      const qrUrl = await uploadQRCodeToCloudinary(tempFile);
      ticket.qrCode = qrUrl;

      // Save ticket
      await ticket.save();
      ticketsCreated.push(ticket);

      // Link ticketId to attendee
      attendee.ticketId = ticket._id;
      await attendee.save();

      // Send email (log errors but don’t break loop)
      await sendTicketEmail({
        email: attendee.email,
        name: attendee.name,
        eventName: booking.eventName,
        eventDate: booking.eventDate,
        venue: booking.venue,
        ticketType: ticket.ticketType,
        qrCodeUrl: qrUrl,
      });
    } catch (err) {
      console.error(`Failed processing attendee ${attendee.email}:`, err);
    }
  }));

  return ticketsCreated;
};
