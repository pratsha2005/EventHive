import React, { useEffect, useState } from 'react';
import AttendeeNavBar from '../../components/AttendeeNavBar.jsx';
import axios from "axios"
import {AppContext} from '../../context/AppContext.jsx'
import { useContext } from 'react';

const dummyEvents = [
  {
    id: 1,
    title: "Live Music Festival",
    date: "2025-08-19",
    category: "Music",
    description: "Experience live music, local food and beverages.",
    location: "Silver Auditorium, silverauditorium@gmail.com",
    published: true,
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b",
  },
  {
    id: 2,
    title: "Jewelry Exhibition",
    date: "2025-09-11",
    category: "Exhibition",
    description: "Join us for an exclusive jewelry showcase featuring classic designs and the latest trends.",
    location: "Grace Showroom, checkindaily@gmail.com",
    published: false,
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
  },
  {
    id: 3,
    title: "Tennis Tournament",
    date: "2025-01-25",
    category: "Sports",
    description: "Start with the excitement of fast lawn matches and talented seeds. Registration not yet open.",
    location: "Moncourt Sports, tennisadmin@gmail.com",
    published: false,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  },
  {
    id: 4,
    title: "Tennis Match",
    date: "2025-01-26",
    category: "Sports",
    description: "See top tennis pros battle for the title. Registration not yet open.",
    location: "Moncourt Sports, protennisclub@gmail.com",
    published: false,
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
  },
  {
    id: 5,
    title: "Jewelry Exhibition",
    date: "2025-09-11",
    category: "Exhibition",
    description: "Join us for an exclusive jewelry showcase featuring classic designs and the latest trends.",
    location: "Grace Showroom, checkindaily@gmail.com",
    published: true,
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
  },
  {
    id: 6,
    title: "Live Music Festival",
    date: "2025-08-19",
    category: "Music",
    description: "Experience live music, local food and beverages.",
    location: "Silver Auditorium, silverauditorium@gmail.com",
    published: false,
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b",
  },
  {
    id: 7,
    title: "Jewelry Exhibition",
    date: "2025-09-11",
    category: "Exhibition",
    description: "Join us for an exclusive jewelry showcase featuring classic designs and the latest trends.",
    location: "Grace Showroom, checkindaily@gmail.com",
    published: false,
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
  },
  {
    id: 8,
    title: "Live Music Festival",
    date: "2025-08-19",
    category: "Music",
    description: "Experience live music, local food and beverages.",
    location: "Silver Auditorium, silverauditorium@gmail.com",
    published: false,
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b",
  },
  {
    id: 9,
    title: "Jewelry Exhibition",
    date: "2025-09-11",
    category: "Exhibition",
    description: "Join us for an exclusive jewelry showcase featuring classic designs and the latest trends.",
    location: "Grace Showroom, checkindaily@gmail.com",
    published: true,
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
  },
  {
    id: 10,
    title: "Live Music Festival",
    date: "2025-08-19",
    category: "Music",
    description: "Experience live music, local food and beverages.",
    location: "Silver Auditorium, silverauditorium@gmail.com",
    published: false,
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b",
  },
];



const categories = [
  { id: "all", label: "All Events" },
  { id: "Music", label: "Music" },
  { id: "Exhibition", label: "Exhibition" },
  { id: "Sports", label: "Sports" },
];

const PAGE_SIZE = 9;

const AttendeeHome = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [date, setDate] = useState('');
  const [events, setEvents] = useState(dummyEvents);
  const [currentPage, setCurrentPage] = useState(1);
  const { backendUrl} = useContext(AppContext);

  axios.defaults.withCredentials = true;
  const getAllEvents = async() => {
    const { data } = await axios.get(`${backendUrl}/api/user/getAllEvents`)
    console.log(data)
    setEvents(data.data)
  }

  useEffect(() => {
    getAllEvents()
  }, [])

  // Filtering
  const filtered = events.filter(ev =>
    (category === "all" || ev.category === category) &&
    (date === "" || ev.date === date) &&
    (search === "" || ev.title.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <AttendeeNavBar />

      {/* Mobile Search bar below navbar */}
      <div className="sm:hidden px-4 pb-4 bg-white border-b border-gray-200">
        <input
          type="search"
          placeholder="Search events"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border rounded-lg py-2 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <main className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
          

          {/* Filters */}
          <form
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            onSubmit={e => e.preventDefault()}
          >
            <select
              className="border rounded-lg px-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={category}
              onChange={e => setCategory(e.target.value)}
              aria-label="Select category"
            >
              {categories.map(cat => (
                <option value={cat.id} key={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="border rounded-lg px-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={date}
              onChange={e => setDate(e.target.value)}
              aria-label="Select date"
            />

            <input
              type="search"
              placeholder="Search events"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              aria-label="Search events"
            />
          </form>
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {paged.map(ev => (
            <article
  key={ev.id}
  className="bg-white rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl focus-within:shadow-2xl transition-shadow duration-300 transform hover:scale-[1.04] focus-within:scale-[1.04]"
  tabIndex={0}
>
  <img
    src={ev.image}
    alt={ev.title}
    className="w-full h-56 rounded-t-3xl object-cover"
    loading="lazy"
  />
  <div className="p-6">
    <div className="flex justify-between mb-3">
      <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-4 py-1 rounded-2xl select-none pointer-events-none">
        {ev.category}
      </span>
      <time dateTime={ev.date} className="text-sm text-gray-500 select-none pointer-events-none">
        {new Date(ev.date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </time>
    </div>

    <h3 className="font-semibold text-xl text-gray-800 mb-3 select-text">{ev.title}</h3>

    <p className="text-gray-600 text-sm mb-5 line-clamp-3 select-text">{ev.description}</p>

    <p className="text-xs text-gray-500 mb-6 select-text">{ev.location}</p>
  </div>
</article>

          ))}
        </div>

        {/* Pagination */}
        <nav
          aria-label="Pagination"
          className="flex justify-center items-center gap-2 mt-12 flex-wrap"
        >
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-md border border-gray-300 disabled:text-gray-400 hover:bg-gray-100 transition"
          >
            Next &gt;
          </button>
        </nav>
      </main>
    </>
  );
};

export default AttendeeHome;