import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp, FaLink } from "react-icons/fa";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, userData } = useContext(AppContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [attendees, setAttendees] = useState([{ name: "", email: "", ticketType: "", price: 0 }]);

  axios.defaults.withCredentials = true;

  const fetchEvent = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/events/getEventById/${id}`);
      setEvent(data.data);
    } catch (err) {
      console.error("Error fetching event:", err);
      toast.error("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const addAttendee = () => setAttendees([...attendees, { name: "", email: "", ticketType: "" }]);
  const removeAttendee = (index) => setAttendees(attendees.filter((_, i) => i !== index));
  const updateAttendee = (index, field, value) => {
    const updated = [...attendees];
    if (field === "ticketType") {
      const ticket = event.tickets.find((t) => t.type === value);
      updated[index].ticketType = value;
      updated[index].price = ticket ? ticket.price : 0;
    } else {
      updated[index][field] = value;
    }
    setAttendees(updated);
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const response = await axios.post(`${backendUrl}/api/payment/checkout`, {
        eventId: id,
        attendees,
      });
      window.location.href = response.data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Failed to proceed with registration");
      setRegistering(false);
    }
  };

  if (loading) return <p className="p-8 text-center text-gray-600">Loading...</p>;
  if (!event) return <p className="p-8 text-center text-gray-600">Event not found</p>;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6 md:p-10 bg-white rounded-2xl shadow-lg mt-6 space-y-6">
        {/* Banner */}
        <img
          src={event.media?.bannerUrl || "https://via.placeholder.com/800x400"}
          alt={event.title}
          className="w-full h-80 object-cover rounded-xl mb-6 shadow-md"
        />

        {/* Gallery */}
        {event.media?.gallery?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {event.media.gallery.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-40 object-cover rounded-lg shadow-sm hover:scale-105 transition-transform duration-200 cursor-pointer"
                />
              ))}
            </div>
          </div>
        )}

        {/* Event Title & Description */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{event.title}</h1>
        <p className="text-gray-600 mb-6">{event.description}</p>

        {/* Event Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700">Details</h2>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Start:</strong> {new Date(event.startDateTime).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(event.endDateTime).toLocaleString()}</p>
            <p><strong>Status:</strong> {event.status}</p>
            {event.media?.streamingLink && (
              <p className="flex items-center gap-2">
                <FaLink /> 
                <a href={event.media?.streamingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Streaming Link
                </a>
              </p>
            )}
            {event.socialLinks && (
              <div className="flex gap-4 mt-2">
                {event.socialLinks.facebook && (
                  <a href={event.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xl">
                    <FaFacebook />
                  </a>
                )}
                {event.socialLinks.instagram && (
                  <a href={event.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 text-xl">
                    <FaInstagram />
                  </a>
                )}
                {event.socialLinks.twitter && (
                  <a href={event.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xl">
                    <FaTwitter />
                  </a>
                )}
                {event.socialLinks.whatsapp && (
                  <a href={event.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-green-500 text-xl">
                    <FaWhatsapp />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700">Location</h2>
            <p>{event.location?.venue}</p>
            <p>{event.location?.address}</p>
            <p>{event.location?.city}, {event.location?.state}, {event.location?.country} - {event.location?.pincode}</p>
          </div>
        </div>

        {/* Ticket Booking / Attendees */}
        {event.tickets?.length > 0 && (
          <div className="mt-8">
            {userData?.role === "organizer" ? (
              <div className="text-center">
                <button
                  onClick={() => navigate(`/events/attendees/${id}`)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
                >
                  View Attendees
                </button>
              </div>
            ) : !showBookingForm ? (
              <div className="text-center">
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md"
                >
                  Book Tickets
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Book Your Tickets</h2>
                {attendees.map((a, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-3 mb-3 items-center">
                    <input
                      type="text"
                      placeholder="Name"
                      value={a.name}
                      onChange={(e) => updateAttendee(i, "name", e.target.value)}
                      className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={a.email}
                      onChange={(e) => updateAttendee(i, "email", e.target.value)}
                      className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <select
                      value={a.ticketType}
                      onChange={(e) => updateAttendee(i, "ticketType", e.target.value)}
                      className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">Select Ticket Type</option>
                      {event.tickets.map((t) => (
                        <option key={t._id} value={t.type}>
                          {t.type} – ₹{t.price} {t.currency} ({t.maxQuantity - t.soldCount} left)
                        </option>
                      ))}
                    </select>
                    {attendees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttendee(i)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAttendee}
                  className="mt-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition font-medium"
                >
                  + Add Another Attendee
                </button>
                <div className="text-center mt-6">
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md disabled:opacity-50"
                  >
                    {registering ? "Registering..." : "Register"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default EventDetails;
