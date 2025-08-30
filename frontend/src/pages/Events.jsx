import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { Link } from "react-router-dom";

const PAGE_SIZE = 9;

const categories = [
  { id: "all", label: "All Categories" },
  { id: "workshop", label: "Workshop" },
  { id: "concert", label: "Concert" },
  { id: "sports", label: "Sports" },
  { id: "hackathon", label: "Hackathon" },
];

const Events = () => {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("all");
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { backendUrl } = useContext(AppContext);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const getAllEvents = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/getAllEvents`);
        setEvents(data.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    getAllEvents();
  }, [backendUrl]);

  const filtered = events.filter((ev) => {
    const matchCategory = category === "all" || ev.category === category;
    const matchDate =
      date === "" ||
      new Date(ev.startDateTime).toISOString().split("T")[0] === date;
    const matchSearch =
      search === "" || ev.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchDate && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 md:p-10 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <input
              type="search"
              placeholder="Search events..."
              className="border rounded-xl px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {paged.map((ev) => (
            <Link to={`/events/${ev._id}`} key={ev._id}>
              <article className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-300 focus-within:shadow-2xl focus-within:scale-[1.03]">
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
                  <h3 className="font-semibold text-lg md:text-xl text-gray-800 mb-2 line-clamp-2">
                    {ev.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {ev.description}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="flex justify-center items-center gap-2 mt-12 flex-wrap"
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:text-gray-400 hover:bg-gray-100 transition"
            >
              &lt; Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg border transition ${
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:text-gray-400 hover:bg-gray-100 transition"
            >
              Next &gt;
            </button>
          </nav>
        )}
      </main>
    </>
  );
};

export default Events;
