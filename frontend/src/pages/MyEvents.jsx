import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

const PAGE_SIZE = 9;

const categories = [
  { id: "all", label: "All Categories" },
  { id: "workshop", label: "Workshop" },
  { id: "concert", label: "Concert" },
  { id: "sports", label: "Sports" },
  { id: "hackathon", label: "Hackathon" },
];

const MyEvents = () => {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, eventId: null, input: "" });
  const { backendUrl, userData } = useContext(AppContext);
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const getMyEvents = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/events/getAllEventByManagerId`);
      setEvents(data.data);
      console.log("Fetched organiser events:", data.data);
    } catch (err) {
      console.error("Error fetching organiser events:", err);
    }
  };

  useEffect(() => {
    if (userData?.role === "organizer") getMyEvents();
  }, [userData, backendUrl]);

  const confirmDelete = async () => {
    if (deleteModal.input !== "DELETE") return alert("Type DELETE to confirm deletion.");
    try {
      await axios.post(`${backendUrl}/api/events/deleteEvent/${deleteModal.eventId}`);
      setEvents(events.filter(ev => ev._id !== deleteModal.eventId));
      setDeleteModal({ show: false, eventId: null, input: "" });
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  // Extract unique cities and states
  const uniqueCities = Array.from(new Set(events.map(ev => ev.location?.city).filter(Boolean)));
  const uniqueStates = Array.from(new Set(events.map(ev => ev.location?.state).filter(Boolean)));

  // Filtering
  const filtered = events.filter(ev => {
    const matchCategory = category === "all" || ev.category === category;
    const matchDate = date === "" || new Date(ev.startDateTime).toISOString().split("T")[0] === date;
    const matchSearch = search === "" || ev.title.toLowerCase().includes(search.toLowerCase());
    const matchCity = city === "" || ev.location?.city?.toLowerCase() === city.toLowerCase();
    const matchState = state === "" || ev.location?.state?.toLowerCase() === state.toLowerCase();
    return matchCategory && matchDate && matchSearch && matchCity && matchState;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 md:p-10">
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
          
          {/* Mobile Filter Toggle */}
          <button
            className="md:hidden mb-4 px-4 py-2 bg-indigo-600 text-white rounded-xl w-fit"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {/* LEFT SIDEBAR FILTERS */}
          <aside
            className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 bg-white shadow-md rounded-2xl p-5 h-fit`}
          >
            <h2 className="text-lg font-semibold mb-4">Filters</h2>

            {/* Category */}
            <label className="block mb-2 text-sm font-medium">Category</label>
            <select
              className="w-full border rounded-xl px-3 py-2 mb-4"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>

            {/* Date */}
            <label className="block mb-2 text-sm font-medium">Date</label>
            <input
              type="date"
              className="w-full border rounded-xl px-3 py-2 mb-4"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            {/* Search */}
            <label className="block mb-2 text-sm font-medium">Search</label>
            <input
              type="search"
              placeholder="Search events..."
              className="w-full border rounded-xl px-3 py-2 mb-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* City */}
            <label className="block mb-2 text-sm font-medium">City</label>
            <select
              className="w-full border rounded-xl px-3 py-2 mb-4"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* State */}
            <label className="block mb-2 text-sm font-medium">State</label>
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="">All States</option>
              {uniqueStates.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </aside>

          {/* RIGHT CONTENT: EVENTS */}
          <section className="flex-1">
            {paged.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">No events found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {paged.map(ev => (
                  <div key={ev._id} className="relative">
                    <Link to={`/events/${ev._id}`}>
                      <article className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-300">
                        <img
                          src={ev.media?.bannerUrl || "https://via.placeholder.com/600x300"}
                          alt={ev.title}
                          className="w-full h-56 object-cover rounded-t-3xl"
                          loading="lazy"
                        />
                        <div className="p-5">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                              {ev.category}
                            </span>
                            <time
                              dateTime={ev.startDateTime}
                              className="text-sm text-gray-500"
                            >
                              {new Date(ev.startDateTime).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </time>
                          </div>
                          <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">{ev.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-3">{ev.description}</p>
                        </div>
                      </article>
                    </Link>

                    {/* Edit & Delete Icons */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => navigate(`/edit-event/${ev._id}`)} className="bg-white p-2 rounded-full shadow-md hover:bg-indigo-50">
                        <FaEdit className="text-indigo-600" />
                      </button>
                      <button onClick={() => setDeleteModal({ show: true, eventId: ev._id, input: "" })} className="bg-white p-2 rounded-full shadow-md hover:bg-red-50">
                        <FaTrash className="text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-2 mt-12 flex-wrap">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border disabled:text-gray-400 hover:bg-gray-100 transition">
                  &lt; Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg border transition ${currentPage === i + 1 ? "bg-indigo-600 text-white border-indigo-600" : "hover:bg-gray-100"}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border disabled:text-gray-400 hover:bg-gray-100 transition">
                  Next &gt;
                </button>
              </nav>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-xl w-96">
                  <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
                  <p className="mb-4">Type <span className="font-semibold">DELETE</span> to confirm deletion of this event.</p>
                  <input
                    type="text"
                    value={deleteModal.input}
                    onChange={(e) => setDeleteModal({ ...deleteModal, input: e.target.value })}
                    className="border p-2 rounded w-full mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setDeleteModal({ show: false, eventId: null, input: "" })} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
                    <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
                  </div>
                </div>
              </div>
            )}

          </section>
        </div>
      </main>
    </>
  );
};

export default MyEvents;
