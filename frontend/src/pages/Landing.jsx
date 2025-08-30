// src/pages/Landing.jsx
import React, { useState, useContext, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaStar,
  FaMapMarkerAlt,
  FaSearch,
  FaBolt,
  FaUsers,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";

// Dummy stats fetch
const getPlatformStats = async () => {
  return { events: 85, attendees: 12000, categories: 12 };
};

// Dummy top events fetch
const getTopEventsByLocation = async (location, limit = 4) => {
  return [
    {
      id: 1,
      title: "Tech Innovation Summit 2025",
      image:
        "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800",
      rating: 4.9,
      reviews: 230,
      location,
      category: "Technology",
      date: "Sep 15, 2025",
      availability: "Open",
      registrations: 256,
    },
    {
      id: 2,
      title: "Startup Networking Meetup",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
      rating: 4.7,
      reviews: 180,
      location,
      category: "Business",
      date: "Oct 10, 2025",
      availability: "Open",
      registrations: 180,
    },
    {
      id: 3,
      title: "AI & Machine Learning Workshop",
      image:
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800",
      rating: 4.8,
      reviews: 210,
      location,
      category: "Education",
      date: "Nov 5, 2025",
      availability: "Closed",
      registrations: 320,
    },
    {
      id: 4,
      title: "Music Fest 2025",
      image:
        "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800",
      rating: 4.6,
      reviews: 350,
      location,
      category: "Entertainment",
      date: "Dec 20, 2025",
      availability: "Open",
      registrations: 540,
    },
  ];
};

const LandingPage = () => {
  const { isLoggedin, userData } = useContext(AppContext);
  const navigate = useNavigate();

  const [location, setLocation] = useState("Mohali");
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({ events: 0, attendees: 0, categories: 0 });

  const [eventsLoading, setEventsLoading] = useState(true);
  const [topEvents, setTopEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const fetchPlatformStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const platformStats = await getPlatformStats();
      setStats(platformStats);
    } catch {
      setStats({ events: 0, attendees: 0, categories: 0 });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchTopEvents = useCallback(async (selectedLocation) => {
    setEventsLoading(true);
    try {
      const events = await getTopEventsByLocation(selectedLocation, 4);
      setTopEvents(events);
    } catch {
      setTopEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatformStats();
    fetchTopEvents(location);
  }, [fetchPlatformStats, fetchTopEvents, location]);

  const nextEvents = () => {
    setCurrentEventIndex(
      (prev) => (prev + 1) % Math.max(1, topEvents.length - 3)
    );
  };

  const prevEvents = () => {
    setCurrentEventIndex(
      (prev) =>
        (prev - 1 + Math.max(1, topEvents.length - 3)) %
        Math.max(1, topEvents.length - 3)
    );
  };

  const handleGetStarted = () => {
    if (isLoggedin && userData?.role) {
      if (userData.role === "attendee") return navigate("/attend");
      if (userData.role === "organizer") return navigate("/organise");
      if (userData.role === "admin") return navigate("/admin");
    }
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center border border-blue-200 bg-blue-100 px-4 py-2 text-blue-800 rounded-lg font-medium">
                  <FaBolt className="mr-2" /> Join Exciting Events
                </span>
                <h1 className="text-4xl leading-tight font-bold text-gray-900 lg:text-6xl">
                  DISCOVER &{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    BOOK EVENTS
                  </span>{" "}
                  NEAR YOU
                </h1>
                <p className="text-xl leading-relaxed text-gray-600">
                  Explore top-rated events and experiences around you. Connect,
                  learn, and enjoy unforgettable moments.
                </p>
              </div>

              {/* Location Search */}
              <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-xl">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <FaMapMarkerAlt className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-blue-600" />
                    <input
                      placeholder="Enter your location..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-14 w-full border border-blue-200 pl-12 pr-4 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(/events?location=${location})}
                    disabled={!location.trim()}
                    className="h-14 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 text-lg font-semibold text-white rounded-lg hover:from-blue-700 hover:to-indigo-700"
                  >
                    <FaSearch className="inline mr-2" />
                    Find Events
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {statsLoading ? "..." : ${stats.events}+}
                  </div>
                  <div className="text-gray-600">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {statsLoading ? "..." : ${stats.attendees}+}
                  </div>
                  <div className="text-gray-600">Attendees</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {statsLoading ? "..." : ${stats.categories}+}
                  </div>
                  <div className="text-gray-600">Categories</div>
                </div>
              </div>
            </div>

            {/* Hero Right Image */}
            <div className="relative hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800"
                alt="Event"
                className="h-96 w-full object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute -top-4 -right-4 animate-bounce rounded-2xl bg-white p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <FaStar className="h-6 w-6 text-yellow-500" />
                  <div>
                    <div className="text-sm font-semibold">Top Rated</div>
                    <div className="text-xs text-gray-500">4.8★ Average</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-2xl bg-blue-600 p-4 text-white shadow-lg">
                <div className="flex items-center space-x-2">
                  <FaUsers className="h-6 w-6" />
                  <div>
                    <div className="text-sm font-semibold">Attendees</div>
                    <div className="text-xs text-blue-200">2.3K+ Joined</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
                Upcoming Events
              </h2>
              <p className="text-lg text-gray-600">
                Top rated events in {location}
              </p>
            </div>
            <Link
              to="/events"
              className="border border-blue-200 text-blue-700 px-6 py-3 rounded-lg hover:bg-blue-50"
            >
              See all events <FaArrowRight className="ml-2 inline" />
            </Link>
          </div>

          <div className="relative">
            {!eventsLoading && topEvents.length > 4 && (
              <>
                <button
                  onClick={prevEvents}
                  className="absolute top-1/2 -left-4 z-10 -translate-y-1/2 border border-blue-200 bg-white p-2 rounded-full shadow-lg hover:bg-blue-50"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={nextEvents}
                  className="absolute top-1/2 -right-4 z-10 -translate-y-1/2 border border-blue-200 bg-white p-2 rounded-full shadow-lg hover:bg-blue-50"
                >
                  <FaChevronRight />
                </button>
              </>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {eventsLoading ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Loading events...
                </div>
              ) : topEvents.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No events found in {location}
                </div>
              ) : (
                topEvents
                  .slice(currentEventIndex, currentEventIndex + 4)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="bg-white border border-blue-100 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                    >
                      <div className="relative">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="h-48 w-full object-cover"
                        />
                        <span className="absolute top-3 right-3 bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-lg flex items-center">
                          <FaClock className="mr-1" /> {event.availability}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-bold">{event.title}</h3>
                          <div className="flex items-center text-sm">
                            <FaStar className="text-yellow-400 mr-1" />
                            {event.rating} ({event.reviews})
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <FaMapMarkerAlt className="mr-1" /> {event.location}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <FaCalendarAlt className="mr-1" /> {event.date}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="border border-blue-200 px-2 py-1 text-xs rounded-lg text-blue-700">
                            {event.category}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Register ({event.registrations})
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;