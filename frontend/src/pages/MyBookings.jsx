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
      setBookings(data.data || []);
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

  if (loading)
    return (
      <>
        <Navbar />
        <p className="p-6 text-center">Loading your bookings...</p>
      </>
    );

  const totalPages = Math.ceil(bookings.length / PAGE_SIZE);
  const pagedBookings = bookings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Bookings</h1>

        {bookings.length === 0 ? (
          <p className="text-center text-gray-600">No bookings found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagedBookings.map((booking) => (
                <div
                  key={booking.ticketId}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 hover:shadow-2xl transition flex flex-col"
                >
                  {/* Event Info */}
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-lg text-gray-800">
                      {booking.event.title}
                    </h2>
                    <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                      {booking.event.category}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-1">
                    {new Date(booking.event.startDateTime).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" }
                    )}{" "}
                    -{" "}
                    {new Date(booking.event.endDateTime).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Venue: {booking.event.venue || "Not specified"}
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
                        className="w-36 h-36 object-contain border border-gray-200 rounded-lg shadow-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Ticket ID: {booking.ticketId}
                      </p>
                    </div>
                  )}

                  {/* Delivery Status */}
                  <div className="mt-2 text-xs text-gray-500 flex flex-col gap-1">
                    <p>
                      Email Sent:{" "}
                      {booking.delivery?.sentToEmail ? "Yes" : "No"}
                    </p>
                    <p>
                      WhatsApp Sent:{" "}
                      {booking.delivery?.sentToWhatsApp ? "Yes" : "No"}
                    </p>
                  </div>
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
