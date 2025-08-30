import React, { useState, useContext } from "react";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { toast } from "react-toastify";

const containerStyle = { width: "100%", height: "300px" };
const defaultCenter = { lat: 28.6139, lng: 77.209 }; // Delhi

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

  const handleLocationChange = async (e) => {
    const { name, value } = e.target;
    setLocation((prev) => ({ ...prev, [name]: value }));
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
          result.address_components.forEach((comp) => {
            if (["locality","postal_town","sublocality_level_1"].some(t => comp.types.includes(t))) city = comp.long_name;
            if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
            if (comp.types.includes("country")) country = comp.long_name;
            if (["route","street_address","street_number"].some(t => comp.types.includes(t))) 
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
      } catch (err) { console.error("Failed to fetch location from pincode:", err); }
    }
  };

  const handleMapClick = (e) => setLocation(prev => ({ ...prev, geo: { lat: e.latLng.lat(), lng: e.latLng.lng() } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k,v]) => k==="tickets"?formData.append(k, JSON.stringify(v)):formData.append(k,v));
      formData.append("location", JSON.stringify(location));
      if (banner) formData.append("banner", banner);
      gallery.forEach(file => formData.append("gallery", file));
      await axios.post(`${backendUrl}/api/events/add-event`, formData, { withCredentials:true, headers: { "Content-Type": "multipart/form-data" }});
      toast.success("✅ Event created successfully!");
    } catch (err) { console.error(err); toast.error("❌ Failed to create event"); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-6 md:p-8 bg-gray-50 rounded-xl mt-6 space-y-6">
        <h1 className="text-3xl font-bold text-indigo-700 text-center mb-4">Create New Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Event Info */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Event Details</h2>
            <input type="text" name="title" placeholder="Event Title" value={form.title} onChange={handleChange} className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-400" required />
            <textarea name="description" placeholder="Event Description" value={form.description} onChange={handleChange} className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-400" rows={4} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="datetime-local" name="startDateTime" value={form.startDateTime} onChange={handleChange} className="border p-2 rounded-md" required />
              <input type="datetime-local" name="endDateTime" value={form.endDateTime} onChange={handleChange} className="border p-2 rounded-md" required />
            </div>
            <select name="category" value={form.category} onChange={handleChange} className="w-full border p-2 rounded-md" required>
              <option value="">Select Category</option>
              <option value="workshop">Workshop</option>
              <option value="concert">Concert</option>
              <option value="sports">Sports</option>
              <option value="hackathon">Hackathon</option>
            </select>
          </div>

          {/* Tickets */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Tickets</h2>
            {form.tickets.map((ticket, i) => (
              <div key={i} className="flex gap-2 flex-wrap items-center">
                <select value={ticket.type} onChange={(e)=>handleTicketChange(i,"type",e.target.value)} className="border p-2 rounded-md" required>
                  <option value="">Type</option><option>General</option><option>VIP</option><option>Student</option><option>Early Bird</option>
                </select>
                <input type="number" placeholder="Price" value={ticket.price} onChange={(e)=>handleTicketChange(i,"price",e.target.value)} className="border p-2 rounded-md" />
                <input type="text" placeholder="Currency" value={ticket.currency} onChange={(e)=>handleTicketChange(i,"currency",e.target.value)} className="border p-2 rounded-md" />
                <input type="number" placeholder="Max Qty" value={ticket.maxQuantity} onChange={(e)=>handleTicketChange(i,"maxQuantity",e.target.value)} className="border p-2 rounded-md" />
                <button type="button" onClick={()=>{setForm({...form,tickets: form.tickets.filter((_,idx)=>idx!==i)})}} className="text-red-600 hover:text-red-800" title="Delete Ticket">🗑️</button>
              </div>
            ))}
            <button type="button" onClick={addTicket} className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition">+ Add Ticket</button>
          </div>

          {/* Media */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Media</h2>
            <div>
              <label className="block mb-1 font-medium">Banner</label>
              <input type="file" accept="image/*" onChange={(e)=>setBanner(e.target.files[0])} />
            </div>
            <div>
              <label className="block mb-1 font-medium">Gallery</label>
              <input type="file" accept="image/*" multiple onChange={(e)=>setGallery(Array.from(e.target.files))} />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["venue","address","city","state","country","pincode"].map(f=>(
                <input key={f} type="text" name={f} placeholder={f.charAt(0).toUpperCase()+f.slice(1)} value={location[f]} onChange={handleLocationChange} className="border p-2 rounded-md" required={f==="venue"} />
              ))}
            </div>
            {isLoaded ? (
              <div className="mt-2 rounded-lg overflow-hidden shadow-md border">
                <GoogleMap mapContainerStyle={containerStyle} center={location.geo} zoom={12} onClick={handleMapClick}>
                  <Marker position={location.geo} draggable onDragEnd={handleMapClick} />
                </GoogleMap>
                <p className="text-sm text-gray-500 mt-2">Lat: {location.geo.lat}, Lng: {location.geo.lng}</p>
              </div>
            ) : <p>Loading map...</p>}
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition">
            {submitting ? "Submitting..." : "Create Event"}
          </button>
        </form>
      </main>
    </>
  );
};

export default AddEvent;
