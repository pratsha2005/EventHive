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
    } catch (err) {
      console.error("Error fetching organiser events:", err);
    }
  };

  useEffect(() => {
    if (userData?.role === "organizer") {
      getMyEvents();
    }
  }, [userData, backendUrl]);

  const confirmDelete = async () => {
    if (deleteModal.input !== "DELETE") return alert("Type DELETE to confirm deletion.");
    try {
      await axios.delete(`${backendUrl}/api/events/delete/${deleteModal.eventId}`);
      setEvents(events.filter(ev => ev._id !== deleteModal.eventId));
      setDeleteModal({ show: false, eventId: null, input: "" });
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  // Filtering
  const filtered = events.filter((ev) => {
    const matchCategory = category === "all" || ev.category === category;
    const matchDate = date === "" || new Date(ev.startDateTime).toISOString().split("T")[0] === date;
    const matchSearch = search === "" || ev.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchDate && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📌 My Events</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
          <form className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto" onSubmit={(e) => e.preventDefault()}>
            <select className="border rounded-lg px-4 py-2 w-full sm:w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((cat) => <option value={cat.id} key={cat.id}>{cat.label}</option>)}
            </select>
            <input type="date" className="border rounded-lg px-4 py-2 w-full sm:w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="search" placeholder="Search events" value={search} onChange={(e) => setSearch(e.target.value)} className="border rounded-lg px-4 py-2 w-full sm:w-auto" />
          </form>
        </div>

        {/* Events grid */}
        {paged.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {paged.map((ev) => (
              <div key={ev._id} className="relative">
                <Link to={`/events/${ev._id}`}>
                  <article className="bg-white rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition transform hover:scale-[1.04]">
                    <img src={ev.media?.bannerUrl || "https://via.placeholder.com/600x300"} alt={ev.title} className="w-full h-56 rounded-t-3xl object-cover" />
                    <div className="p-6">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-4 py-1 rounded-2xl">{ev.category}</span>
                        <time dateTime={ev.startDateTime} className="text-sm text-gray-500">
                          {new Date(ev.startDateTime).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </time>
                      </div>
                      <h3 className="font-semibold text-xl text-gray-800 mb-3">{ev.title}</h3>
                      <p className="text-gray-600 text-sm mb-5 line-clamp-3">{ev.description}</p>
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
        ) : (
          <p className="text-gray-600 text-center mt-12">❌ You haven’t created any events yet.</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Pagination" className="flex justify-center items-center gap-2 mt-12 flex-wrap">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-md border"> &lt; Prev </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 rounded-md border ${currentPage === i + 1 ? "bg-indigo-600 text-white border-indigo-600" : "hover:bg-gray-100"}`}>{i + 1}</button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-md border"> Next &gt; </button>
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
      </main>
    </>
  );
};

export default MyEvents;
