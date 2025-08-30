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
    streamingLink: "",
    socialLinks: { facebook: "", instagram: "", twitter: "", whatsapp: "" },
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
        const ev = data.data;

        setForm({
          title: ev.title,
          description: ev.description,
          startDateTime: ev.startDateTime.slice(0, 16),
          endDateTime: ev.endDateTime.slice(0, 16),
          category: ev.category,
          tickets: ev.tickets || [],
          streamingLink: ev.media?.streamingLink || "",
          socialLinks: ev.socialLinks || { facebook: "", instagram: "", twitter: "", whatsapp: "" },
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

  // ---------- Handlers ----------
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [name]: value } }));
  };

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
      } catch (err) {
        console.error("Failed to fetch location from pincode:", err);
      }
    }
  };

  const handleMapClick = (e) => setLocation(prev => ({ ...prev, geo: { lat: e.latLng.lat(), lng: e.latLng.lng() } }));

 const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const formData = new FormData();

    // Append regular fields
    Object.entries(form).forEach(([k, v]) => {
      if (k === "tickets" || k === "socialLinks") {
        formData.append(k, JSON.stringify(v));
      } else if (k === "streamingLink") {
        // Put streaming link inside media
        formData.append("media.streamingLink", v);
      } else {
        formData.append(k, v);
      }
    });

    formData.append("location", JSON.stringify(location));

    if (banner instanceof File) formData.append("banner", banner);
    gallery.forEach((file) => {
      if (file instanceof File) formData.append("gallery", file);
    });

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
      <main className="max-w-4xl mx-auto p-6 md:p-8 bg-gray-50 rounded-xl mt-6 space-y-6">
        <h1 className="text-3xl font-bold text-indigo-700 text-center mb-4">Edit Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Event Info */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <input type="text" name="title" placeholder="Event Title" value={form.title} onChange={handleChange} className="w-full border p-3 rounded-md" required />
            <textarea name="description" placeholder="Event Description" value={form.description} onChange={handleChange} className="w-full border p-3 rounded-md" rows={4} required />
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
            <input type="url" name="streamingLink" placeholder="Streaming Link" value={form.streamingLink} onChange={handleChange} className="w-full border p-2 rounded-md mt-2" />
          </div>

          {/* Social Links */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["facebook","instagram","twitter","whatsapp"].map(key => (
                <input key={key} type="url" name={key} placeholder={key.charAt(0).toUpperCase() + key.slice(1)} value={form.socialLinks[key]} onChange={handleSocialChange} className="border p-2 rounded-md" />
              ))}
            </div>
          </div>

          {/* Tickets */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Tickets</h2>
            {form.tickets.map((ticket,i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                <input type="text" placeholder="Type" value={ticket.type} onChange={e=>handleTicketChange(i,"type",e.target.value)} className="border p-2 rounded-md" />
                <input type="number" placeholder="Price" value={ticket.price} onChange={e=>handleTicketChange(i,"price",e.target.value)} className="border p-2 rounded-md" />
                <input type="text" placeholder="Currency" value={ticket.currency} onChange={e=>handleTicketChange(i,"currency",e.target.value)} className="border p-2 rounded-md" />
                <input type="number" placeholder="Max Qty" value={ticket.maxQuantity} onChange={e=>handleTicketChange(i,"maxQuantity",e.target.value)} className="border p-2 rounded-md" />
              </div>
            ))}
            <button type="button" onClick={addTicket} className="px-3 py-1 bg-indigo-500 text-white rounded-md">+ Add Ticket</button>
          </div>

          {/* Banner & Gallery */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <label className="block font-semibold">Banner</label>
            <input type="file" accept="image/*" onChange={e=>setBanner(e.target.files[0])} />
            {banner && typeof banner==="string" && <img src={banner} alt="Banner" className="w-full h-48 object-cover rounded-md mt-2" />}

            <label className="block font-semibold mt-4">Gallery</label>
            <input type="file" accept="image/*" multiple onChange={e=>setGallery(Array.from(e.target.files))} />
            {gallery.length>0 && <div className="flex gap-2 mt-2 overflow-x-auto">
              {gallery.map((img,idx)=><img key={idx} src={typeof img==="string"?img:URL.createObjectURL(img)} alt="Gallery" className="w-24 h-24 object-cover rounded-md" />)}
            </div>}
          </div>

          {/* Location & Map */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["venue","address","city","state","country","pincode"].map(field => (
                <input key={field} type="text" name={field} placeholder={field.charAt(0).toUpperCase()+field.slice(1)} value={location[field]} onChange={handleLocationChange} className="border p-2 rounded-md" required={field==="venue"} />
              ))}
            </div>
            {isLoaded ? (
              <GoogleMap mapContainerStyle={containerStyle} center={location.geo} zoom={12} onClick={handleMapClick}>
                <Marker position={location.geo} draggable onDragEnd={handleMapClick} />
              </GoogleMap>
            ) : <p>Loading map...</p>}
            <p className="text-sm text-gray-500 mt-2">Lat: {location.geo.lat}, Lng: {location.geo.lng}</p>
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition">
            {submitting ? "Updating..." : "Update Event"}
          </button>
        </form>
      </main>
    </>
  );
};

export default EditEvent;
