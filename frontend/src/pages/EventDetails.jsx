import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";

const EventDetails = () => {
  const { id } = useParams();
  const { backendUrl } = useContext(AppContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  axios.defaults.withCredentials = true;

  const fetchEvent = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/events/getEventById/${id}`);
      setEvent(data.data);
    } catch (err) {
      console.error("Error fetching event:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (!event) return <p className="p-8 text-center">Event not found</p>;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6 md:p-10 bg-white rounded-2xl shadow-lg mt-6">
        <img
          src={event.media?.bannerUrl || "https://via.placeholder.com/800x400"}
          alt={event.title}
          className="w-full h-80 object-cover rounded-lg mb-6"
        />

        <h1 className="text-3xl font-bold text-gray-800 mb-4">{event.title}</h1>
        <p className="text-gray-600 mb-6">{event.description}</p>

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

        {event.tickets?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Tickets</h2>
            <ul className="divide-y border rounded-lg">
              {event.tickets.map((t) => (
                <li key={t.ticketId} className="p-3 flex justify-between">
                  <span>{t.type}</span>
                  <span className="font-medium">
                    ₹{t.price} ({t.currency})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  );
};

export default EventDetails;
