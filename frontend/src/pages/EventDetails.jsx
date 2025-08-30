import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, isLoggedin } = useContext(AppContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [attendees, setAttendees] = useState([{ name: "", email: "", ticketType: "" }]);

  axios.defaults.withCredentials = true;

  // Fetch event
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

  // Add more attendees
  const addAttendee = () => {
    setAttendees([...attendees, { name: "", email: "", ticketType: "" }]);
  };

  // Remove attendee
  const removeAttendee = (index) => {
    const updated = [...attendees];
    updated.splice(index, 1);
    setAttendees(updated);
  };

  // Update attendee info
  const updateAttendee = (index, field, value) => {
    const updated = [...attendees];
    updated[index][field] = value;
    setAttendees(updated);
  };

  // Register API call
  const handleRegister = async () => {
    if (!isLoggedin) {
      toast.info("Please login to register for this event");
      navigate("/login");
      return;
    }

    // Validate attendees
    for (let a of attendees) {
      if (!a.name || !a.email || !a.ticketType) {
        toast.warn("Please fill all fields (name, email, ticket type) for all attendees");
        return;
      }
    }

    const payload = { attendees };

    try {
      setRegistering(true);
      const { data } = await axios.post(
        `${backendUrl}/api/user/register/${id}`,
        payload,
        { withCredentials: true }
      );
      toast.success(data.message || "Successfully registered!");
    } catch (err) {
      console.error("Error registering:", err);
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (!event) return <p className="p-8 text-center">Event not found</p>;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6 md:p-10 bg-white rounded-2xl shadow-lg mt-6">
        {/* Banner */}
        <img
          src={event.media?.bannerUrl || "https://via.placeholder.com/800x400"}
          alt={event.title}
          className="w-full h-80 object-cover rounded-lg mb-6"
        />

        {/* Title & Description */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{event.title}</h1>
        <p className="text-gray-600 mb-6">{event.description}</p>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold">Details</h2>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Start:</strong> {new Date(event.startDateTime).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(event.endDateTime).toLocaleString()}</p>
            <p><strong>Status:</strong> {event.status}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Location</h2>
            <p>{event.location?.venue}</p>
            <p>{event.location?.address}</p>
            <p>
              {event.location?.city}, {event.location?.state},{" "}
              {event.location?.country} - {event.location?.pincode}
            </p>
          </div>
        </div>

        {/* Tickets */}
        {event.tickets?.length > 0 && (
          <div className="mt-8">
            {!showBookingForm ? (
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
                <h2 className="text-lg font-semibold mb-4">Book Your Tickets</h2>

                {/* Attendees */}
                {attendees.map((a, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-4 mb-3 items-center">
                    <input
                      type="text"
                      placeholder="Name"
                      value={a.name}
                      onChange={(e) => updateAttendee(i, "name", e.target.value)}
                      className="border rounded-lg px-3 py-2 flex-1"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={a.email}
                      onChange={(e) => updateAttendee(i, "email", e.target.value)}
                      className="border rounded-lg px-3 py-2 flex-1"
                    />
                    <select
                      value={a.ticketType}
                      onChange={(e) => updateAttendee(i, "ticketType", e.target.value)}
                      className="border rounded-lg px-3 py-2 flex-1"
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
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {/* Add attendee button */}
                <button
                  type="button"
                  onClick={addAttendee}
                  className="mt-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                >
                  + Add Another Attendee
                </button>

                {/* Register Button */}
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
