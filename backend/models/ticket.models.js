  import mongoose from 'mongoose';

  const ticketSchema = new mongoose.Schema({
    // bookingId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Bookings',
    //   required: true,
    // },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    ticketType: {
      type: String,
      enum: ['General', 'VIP', 'Student', 'Early Bird'],
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
    barcode: {
      type: String, 
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'checked-in'],
      default: 'active',
    },
    delivery: {
      sentToEmail: { type: Boolean, default: false },
      sentToWhatsApp: { type: Boolean, default: false },
      downloadUrl: { type: String }, 
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  const Ticket = mongoose.model('Tickets', ticketSchema);

  export default Ticket;
