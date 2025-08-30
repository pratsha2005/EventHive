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

const MyEvents = () => {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("all");
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { backendUrl } = useContext(AppContext);

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
      getMyEvents();
  }, []);

  // Filtering
  const filtered = events.filter((ev) => {
    const matchCategory = category === "all" || ev.category === category;
    const matchDate =
      date === "" ||
      new Date(ev.startDateTime).toISOString().split("T")[0] === date;
    const matchSearch =
      search === "" || ev.title.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchDate && matchSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <>
      <Navbar />

      <main className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📌 My Events</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
          <form
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <select
              className="border rounded-lg px-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option value={cat.id} key={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="border rounded-lg px-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <input
              type="search"
              placeholder="Search events"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </form>
        </div>

        {/* Events grid */}
        {paged.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {paged.map((ev) => (
              <Link to={`/events/${ev._id}`} key={ev._id}>
                <article className="bg-white rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition transform hover:scale-[1.04]">
                  <img
                    src={
                      ev.media?.bannerUrl || "https://via.placeholder.com/600x300"
                    }
                    alt={ev.title}
                    className="w-full h-56 rounded-t-3xl object-cover"
                    loading="lazy"
                  />
                  <div className="p-6">
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-4 py-1 rounded-2xl">
                        {ev.category}
                      </span>
                      <time
                        dateTime={ev.startDateTime}
                        className="text-sm text-gray-500"
                      >
                        {new Date(ev.startDateTime).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </time>
                    </div>

                    <h3 className="font-semibold text-xl text-gray-800 mb-3">
                      {ev.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-5 line-clamp-3">
                      {ev.description}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center mt-12">
            ❌ You haven’t created any events yet.
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="flex justify-center items-center gap-2 mt-12 flex-wrap"
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md border border-gray-300 disabled:text-gray-400 hover:bg-gray-100 transition"
            >
              &lt; Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                aria-current={currentPage === i + 1 ? "page" : undefined}
                className={`px-4 py-2 rounded-md border transition ${
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
              className="px-4 py-2 rounded-md border border-gray-300 disabled:text-gray-400 hover:bg-gray-100 transition"
            >
              Next &gt;
            </button>
          </nav>
        )}
      </main>
    </>
  );
};

export default MyEvents;
