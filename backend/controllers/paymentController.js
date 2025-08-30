import Stripe from "stripe";
import dotenv from "dotenv";
import { registerForEvent } from "./userController.js"; // ✅ We'll rewrite this in Prisma

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CREATE CHECKOUT SESSION
export const createCheckoutSession = async (req, res) => {
  try {
    const { eventId, attendees } = req.body;
    const userId = req.userId; // from auth middleware

    const url = process.env.BACKEND_URL || "http://localhost:4000";

    const session = await stripe.checkout.sessions.create({
      line_items: attendees.map((att) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: `Ticket for ${att.name} of type ${att.ticketType}`,
          },
          unit_amount: att.price * 100,
        },
        quantity: 1,
      })),
      mode: "payment",
      metadata: {
        eventId,
        attendees: JSON.stringify(attendees),
        userId,
      },
      success_url: `${url}/api/payment/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url}/api/payment/payment-cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe session creation error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// HANDLE PAYMENT SUCCESS
export const paymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;

    // ✅ fetch session details back from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const { eventId, attendees, userId } = session.metadata;
    const parsedAttendees = JSON.parse(attendees);

    console.log("Payment Success Metadata:", {
      eventId,
      parsedAttendees,
      userId,
    });

    // ✅ call registration logic (Prisma version inside userController)
    await registerForEvent(eventId, parsedAttendees, userId);

    const url = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${url}/my-bookings`);
  } catch (err) {
    console.error("Payment success error:", err);
    return res.status(500).send("Registration failed after payment");
  }
};
