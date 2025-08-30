import QRCode from 'qrcode';
import Ticket from '../models/ticket.models.js';
import transporter from '../config/nodemailer.js';
import { getTicketEmailTemplate } from '../config/emailTemplates.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// 1️⃣ Generate QR Code and save temporarily
const generateQRCodeTempFile = async (ticketData) => {
  const qrData = JSON.stringify(ticketData);
  const tempPath = path.join(process.cwd(), `temp-${Date.now()}.png`);
  await QRCode.toFile(tempPath, qrData, { width: 300 });
  return tempPath;
};

// 2️⃣ Upload QR Code to Cloudinary
const uploadQRCodeToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {folder: 'event-tickets'});
  fs.unlinkSync(filePath); // remove temp file
  return result.secure_url;
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
    console.log('Ticket email sent: %s', info.messageId);
    return info;
  } catch (err) {
    console.error('Error sending ticket email:', err);
    throw err;
  }
};

// 4️⃣ Create tickets for a booking and send QR email
export const createTicketsForBooking = async (booking, user) => {
  const ticketsCreated = [];

  for (const t of booking.tickets) {
    const ticket = new Ticket({
      bookingId: booking._id,
      eventId: booking.eventId,
      userId: user._id,
      ticketType: t.type || 'General',
    });

    // Generate QR -> Upload to Cloudinary
    const tempFile = await generateQRCodeTempFile({
      ticketId: ticket._id,
      bookingId: ticket.bookingId,
      eventId: ticket.eventId,
      userId: ticket.userId,
    });
    const qrUrl = await uploadQRCodeToCloudinary(tempFile);

    ticket.qrCode = qrUrl;
    await ticket.save();
    ticketsCreated.push(ticket);

    // Send email
    await sendTicketEmail({
      email: user.email,
      name: user.name,
      eventName: booking.eventName,
      eventDate: booking.eventDate,
      venue: booking.venue,
      ticketType: ticket.ticketType,
      qrCodeUrl: qrUrl,
    });
  }

  return ticketsCreated;
};
