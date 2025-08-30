import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import { FiArrowLeft, FiSearch, FiDownload } from "react-icons/fi";

const AttendeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  axios.defaults.withCredentials = true;

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${backendUrl}/api/events/getAttendeesByEventId/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Attendees API response:", data);

      if (!data.success)
        throw new Error(data.message || "Failed to fetch attendees");

      setEvent({ id, name: data.eventName || "Event" });
      setAttendees(data.data || []);
    } catch (err) {
      console.error("Error fetching attendees:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch attendees"
      );
      toast.error(err.response?.data?.message || "Failed to fetch attendees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [id]);

  // Filtered attendees
  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Total revenue calculation
  const totalRevenue = filteredAttendees.reduce(
    (sum, attendee) => sum + (attendee.ticket?.price || 0),
    0
  );

  // CSV Download
  const handleDownloadCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Ticket Type",
      "Price",
      "Currency",
      "Status",
      "Registered At",
    ];
    const rows = filteredAttendees.map((a) => [
      a.name,
      a.email,
      a.ticket?.type || "",
      a.ticket?.price || "",
      a.ticket?.currency || "",
      a.status,
      new Date(a.registeredAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event?.name || "event"}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6 md:p-10 bg-white rounded-2xl shadow-lg mt-6">
        {loading ? (
          <p className="text-center p-8">Loading attendees...</p>
        ) : error ? (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p>{error}</p>
          </div>
        ) : !event ? (
          <p className="text-center p-8">Event not found</p>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 mb-6"
            >
              <FiArrowLeft />
              <span>Back</span>
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  Attendees Details
                </h1>
                <p className="text-gray-500 mb-2">
                  {event.name} – {filteredAttendees.length} Attendees
                </p>

                {/* Total Revenue */}
                <div className="inline-block bg-green-100 text-green-800 font-bold text-xl px-4 py-2 rounded-lg shadow-md">
                  Total Revenue: ₹{totalRevenue}
                </div>
              </div>

              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 mt-4 md:mt-0"
              >
                <FiDownload />
                Download CSV
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search attendees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Ticket Type</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Currency</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.length > 0 ? (
                    filteredAttendees.map((attendee, index) => (
                      <tr
                        key={attendee.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4 font-medium text-gray-700">
                          {index + 1}.
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          {attendee.name}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {attendee.email}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {attendee.ticket?.type || "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {attendee.ticket?.price || "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {attendee.ticket?.currency || "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-700 capitalize">
                          {attendee.status}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {new Date(attendee.registeredAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="py-6 text-center text-gray-500 italic"
                      >
                        No attendees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default AttendeeDetails;
