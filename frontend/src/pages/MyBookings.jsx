import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";

const PAGE_SIZE = 6;

const MyBookings = () => {
  const { backendUrl } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/myBookings`, {
        withCredentials: true,
      });
      console.log("Bookings API response:", data);

      if (data.data) {
        setBookings(data.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <p className="p-6 text-center">Loading your bookings...</p>
      </>
    );
  }

  const totalPages = Math.ceil(bookings.length / PAGE_SIZE);
  const pagedBookings = bookings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <p className="text-center text-gray-600">No bookings found.</p>
        ) : (
          <>
            {/* Tickets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagedBookings.map((booking) => (
                <div
                  key={booking.ticketId}
                  className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 hover:shadow-xl transition flex flex-col"
                >
                  {/* Event Image */}
                  <img
                    src={
                      booking.event.image ||
                      "https://via.placeholder.com/600x400"
                    }
                    alt={booking.event.title}
                    className="w-full h-48 rounded-xl object-cover mb-4"
                  />

                  {/* Event Info */}
                  <h2 className="font-semibold text-lg">
                    {booking.event.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-1">
                    {new Date(
                      booking.event.startDateTime
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      booking.event.endDateTime
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    Venue: {booking.event.venue}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Category: {booking.event.category}
                  </p>

                  {/* Ticket Info */}
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Ticket Type:</span>{" "}
                    {booking.ticketType}
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    <span className="font-semibold">Status:</span>{" "}
                    {booking.status}
                  </p>

                  {/* QR Code */}
                  {booking.qrCode && (
                    <div className="flex flex-col items-center mt-auto">
                      <img
                        src={booking.qrCode}
                        alt="QR Code"
                        className="w-32 h-32 object-contain"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ticket ID: {booking.ticketId}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-2 mt-8">
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md border border-gray-300 disabled:text-gray-400 hover:bg-gray-100 transition"
                >
                  Next &gt;
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default MyBookings;
