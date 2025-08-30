import React, { useState, useContext } from "react";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px",
};

const center = {
  lat: 28.6139, // default Delhi
  lng: 77.209,
};

const AddEvent = () => {
  const { backendUrl } = useContext(AppContext);

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    category: "",
    tickets: [],
  });

  const [banner, setBanner] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [location, setLocation] = useState(center);
  const [submitting, setSubmitting] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // add in .env
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTicketChange = (index, field, value) => {
    const newTickets = [...form.tickets];
    newTickets[index][field] = value;
    setForm({ ...form, tickets: newTickets });
  };

  const addTicket = () => {
    setForm({
      ...form,
      tickets: [
        ...form.tickets,
        { type: "", price: 0, currency: "INR", maxQuantity: 100 },
      ],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("startDateTime", form.startDateTime);
      formData.append("endDateTime", form.endDateTime);
      formData.append("category", form.category);
      formData.append("tickets", JSON.stringify(form.tickets));
      formData.append(
        "location",
        JSON.stringify({
          lat: location.lat,
          lng: location.lng,
        })
      );

      if (banner) formData.append("banner", banner);
      gallery.forEach((file) => formData.append("gallery", file));

      const { data } = await axios.post(
        `${backendUrl}/api/events/add-event`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("✅ Event created successfully!");
      console.log("Event created:", data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-6">
        <h1 className="text-2xl font-bold mb-6">Add New Event</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={form.title}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
            required
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Event Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
            rows={4}
            required
          />

          {/* Dates */}
          <div className="flex gap-4">
            <input
              type="datetime-local"
              name="startDateTime"
              value={form.startDateTime}
              onChange={handleChange}
              className="w-1/2 border p-2 rounded-md"
              required
            />
            <input
              type="datetime-local"
              name="endDateTime"
              value={form.endDateTime}
              onChange={handleChange}
              className="w-1/2 border p-2 rounded-md"
              required
            />
          </div>

            {/* Category */}
            <div>
            <label className="block mb-1 font-semibold">Category</label>
            <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
                required
            >
                <option value="">Select Category</option>
                <option value="workshop">Workshop</option>
                <option value="concert">Concert</option>
                <option value="sports">Sports</option>
                <option value="hackathon">Hackathon</option>
            </select>
            </div>

          {/* Tickets */}
          <div>
            <h2 className="font-semibold mb-2">Tickets</h2>
            {form.tickets.map((ticket, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                {/* Ticket Type Dropdown */}
                <select
                  value={ticket.type}
                  onChange={(e) =>
                    handleTicketChange(i, "type", e.target.value)
                  }
                  className="w-1/4 border p-2 rounded-md"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="General">General</option>
                  <option value="VIP">VIP</option>
                  <option value="Student">Student</option>
                  <option value="Early Bird">Early Bird</option>
                </select>

                {/* Price */}
                <input
                  type="number"
                  placeholder="Price"
                  value={ticket.price}
                  onChange={(e) =>
                    handleTicketChange(i, "price", e.target.value)
                  }
                  className="w-1/4 border p-2 rounded-md"
                />

                {/* Currency */}
                <input
                  type="text"
                  placeholder="Currency"
                  value={ticket.currency}
                  onChange={(e) =>
                    handleTicketChange(i, "currency", e.target.value)
                  }
                  className="w-1/4 border p-2 rounded-md"
                />

                {/* Max Quantity */}
                <input
                  type="number"
                  placeholder="Max Qty"
                  value={ticket.maxQuantity}
                  onChange={(e) =>
                    handleTicketChange(i, "maxQuantity", e.target.value)
                  }
                  className="w-1/4 border p-2 rounded-md"
                />

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => {
                    const newTickets = form.tickets.filter(
                      (_, idx) => idx !== i
                    );
                    setForm({ ...form, tickets: newTickets });
                  }}
                  className="text-red-600 hover:text-red-800 ml-2"
                  title="Delete Ticket"
                >
                  🗑️
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addTicket}
              className="px-3 py-1 bg-indigo-500 text-white rounded-md"
            >
              + Add Ticket
            </button>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block mb-1 font-semibold">Banner</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBanner(e.target.files[0])}
            />
          </div>

          {/* Gallery Upload */}
          <div>
            <label className="block mb-1 font-semibold">Gallery</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setGallery(Array.from(e.target.files))}
            />
          </div>

          {/* Google Map */}
          <div>
            <label className="block mb-2 font-semibold">
              Pick Event Location
            </label>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={location}
                zoom={12}
                onClick={(e) =>
                  setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() })
                }
              >
                <Marker position={location} />
              </GoogleMap>
            ) : (
              <p>Loading map...</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Lat: {location.lat}, Lng: {location.lng}
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            {submitting ? "Submitting..." : "Create Event"}
          </button>
        </form>
      </main>
    </>
  );
};

export default AddEvent;
