import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { useParams, useNavigate } from "react-router-dom";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { toast } from "react-toastify";

const containerStyle = { width: "100%", height: "300px" };
const defaultCenter = { lat: 28.6139, lng: 77.209 };

const EditEvent = () => {
  const { backendUrl } = useContext(AppContext);
  const { eventId } = useParams();
  const navigate = useNavigate();

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
  const [location, setLocation] = useState({
    venue: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    geo: { ...defaultCenter },
  });

  const [submitting, setSubmitting] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // ---------- Fetch Event ----------
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/events/getEventById/${eventId}`, { withCredentials: true });
        console.log("Fetched event data:", data);
        const ev = data.data;

        setForm({
          title: ev.title,
          description: ev.description,
          startDateTime: ev.startDateTime.slice(0, 16),
          endDateTime: ev.endDateTime.slice(0, 16),
          category: ev.category,
          tickets: ev.tickets || [],
        });

        if (ev.media?.bannerUrl) setBanner(ev.media.bannerUrl);
        if (ev.media?.gallery) setGallery(ev.media.gallery || []);

        if (ev.location) setLocation(ev.location);
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to load event data");
      }
    };
    fetchEvent();
  }, [backendUrl, eventId]);

  // ---------- Form Handlers ----------
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleTicketChange = (index, field, value) => {
    const newTickets = [...form.tickets];
    newTickets[index][field] = value;
    setForm({ ...form, tickets: newTickets });
  };

  const addTicket = () => {
    setForm({
      ...form,
      tickets: [...form.tickets, { type: "", price: 0, currency: "INR", maxQuantity: 100 }],
    });
  };

  // ---------- Location Handlers ----------
  const handleLocationChange = async (e) => {
    const { name, value } = e.target;
    setLocation(prev => ({ ...prev, [name]: value }));

    if (name === "pincode" && value.length >= 5) {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const res = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${value}&key=${apiKey}`
        );

        if (res.data.status === "OK") {
          const result = res.data.results[0];
          const geo = result.geometry.location;

          let city = "", state = "", country = "", address = "";

          result.address_components.forEach(comp => {
            if (comp.types.includes("locality") || comp.types.includes("postal_town") || comp.types.includes("sublocality_level_1")) city = comp.long_name;
            if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
            if (comp.types.includes("country")) country = comp.long_name;
            if (comp.types.includes("route") || comp.types.includes("street_address") || comp.types.includes("street_number"))
              address = address ? `${address}, ${comp.long_name}` : comp.long_name;
          });

          setLocation(prev => ({
            ...prev,
            city: city || prev.city,
            state: state || prev.state,
            country: country || prev.country,
            address: address || prev.address,
            geo: { lat: geo.lat, lng: geo.lng },
          }));
        }
      } catch (err) {
        console.error("Failed to fetch location from pincode:", err);
      }
    }
  };

  const handleMapClick = (e) => {
    setLocation(prev => ({ ...prev, geo: { lat: e.latLng.lat(), lng: e.latLng.lng() } }));
  };

  // ---------- Submit Handler ----------
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
      formData.append("location", JSON.stringify(location));

      if (banner instanceof File) formData.append("banner", banner);
      gallery.forEach(file => { if(file instanceof File) formData.append("gallery", file); });

      await axios.post(`${backendUrl}/api/events/edit-event/${eventId}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Event updated successfully!");
      navigate("/my-events");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-6">
        <h1 className="text-2xl font-bold mb-6">Edit Event</h1>

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

          {/* Tickets */}
          <div>
            <h2 className="font-semibold mb-2">Tickets</h2>
            {form.tickets.map((ticket, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <select
                  value={ticket.type}
                  onChange={(e) => handleTicketChange(i, "type", e.target.value)}
                  className="w-1/4 border p-2 rounded-md"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="General">General</option>
                  <option value="VIP">VIP</option>
                  <option value="Student">Student</option>
                  <option value="Early Bird">Early Bird</option>
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={ticket.price}
                  onChange={(e) => handleTicketChange(i, "price", e.target.value)}
                  className="w-1/4 border p-2 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Currency"
                  value={ticket.currency}
                  onChange={(e) => handleTicketChange(i, "currency", e.target.value)}
                  className="w-1/4 border p-2 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Max Qty"
                  value={ticket.maxQuantity}
                  onChange={(e) => handleTicketChange(i, "maxQuantity", e.target.value)}
                  className="w-1/4 border p-2 rounded-md"
                />
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

          {/* Banner */}
          <div>
            <label className="block mb-1 font-semibold">Banner</label>
            <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files[0])} />
            {banner && typeof banner === "string" && (
              <img src={banner} alt="Banner" className="w-full h-48 object-cover mt-2 rounded-md" />
            )}
          </div>

          {/* Gallery */}
          <div>
            <label className="block mb-1 font-semibold">Gallery</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setGallery(Array.from(e.target.files))}
            />
            {gallery.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {gallery.map((img, idx) => (
                  <img
                    key={idx}
                    src={typeof img === "string" ? img : URL.createObjectURL(img)}
                    alt="Gallery"
                    className="w-24 h-24 object-cover rounded-md"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["venue","address","city","state","country","pincode"].map(field => (
              <input
                key={field}
                type="text"
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={location[field]}
                onChange={handleLocationChange}
                className="border p-2 rounded-md"
                required={field==="venue"}
              />
            ))}
          </div>

          {/* Map */}
          <div>
            <label className="block mb-2 font-semibold">Pick Event Location</label>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={location.geo}
                zoom={12}
                onClick={handleMapClick}
              >
                <Marker position={location.geo} draggable onDragEnd={handleMapClick} />
              </GoogleMap>
            ) : (
              <p>Loading map...</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Lat: {location.geo.lat}, Lng: {location.geo.lng}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            {submitting ? "Updating..." : "Update Event"}
          </button>
        </form>
      </main>
    </>
  );
};

export default EditEvent;
