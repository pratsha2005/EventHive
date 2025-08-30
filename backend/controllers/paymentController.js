import Stripe from "stripe";
import dotenv from "dotenv";
import { registerForEvent } from "./userController.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    const { eventId, attendees } = req.body;
    const userId = req.userId; // from userAuth

    const session = await stripe.checkout.sessions.create({
      line_items: attendees.map(att => ({
        price_data: {
          currency: "inr",
          product_data: { 
          name: `Ticket for ${att.name} of type ${att.ticketType}`
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
      success_url: `http://localhost:4000/api/payment/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:4000/api/payment/payment-cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Handle payment success
export const paymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;

    // fetch session back from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const { eventId, attendees, userId } = session.metadata;

    const parsedAttendees = JSON.parse(attendees);

    console.log({
      eventId,
      parsedAttendees,
      userId
    })
    // call your registration logic
    await registerForEvent(eventId, parsedAttendees, userId);
    res.redirect("http://localhost:5173/my-bookings");
  } catch (err) {
    console.error("Payment success error:", err);
    res.status(500).send("Registration failed after payment");
  }
};

