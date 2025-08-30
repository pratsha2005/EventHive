import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaStar } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";

const LandingPage = () => {
  const { isLoggedin, userData } = useContext(AppContext);
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      title: "Tech Innovators Summit 2025",
      description:
        "A gathering of the brightest minds in technology and innovation.",
      image:
        "https://plus.unsplash.com/premium_photo-1724753996058-6f46e8e77f0e?w=600&auto=format&fit=crop&q=60",
      venue: "Tech Park, San Francisco",
      timing: "March 5, 2025 • 10:00 AM - 5:00 PM",
    },
    {
      id: 2,
      title: "Music Fiesta Night",
      description: "An unforgettable night of live performances by top artists.",
      image:
        "https://images.unsplash.com/photo-1568036064686-b3130620ae0a?w=600&auto=format&fit=crop&q=60",
      venue: "Downtown Arena, Los Angeles",
      timing: "March 12, 2025 • 7:00 PM - 11:00 PM",
    },
    {
      id: 3,
      title: "Startup Hackathon",
      description:
        "Build innovative solutions in 24 hours with fellow developers.",
      image:
        "https://plus.unsplash.com/premium_photo-1663040543387-cb7c78c4f012?w=600&auto=format&fit=crop&q=60",
      venue: "Innovation Hub, New York",
      timing: "March 20-21, 2025",
    },
    {
      id: 4,
      title: "Design Thinking Workshop",
      description:
        "Learn how to solve problems creatively with design thinking.",
      image:
        "https://plus.unsplash.com/premium_photo-1683133927528-8075b14131a0?w=600&auto=format&fit=crop&q=60",
      venue: "Creative Hub, Boston",
      timing: "April 2, 2025 • 9:00 AM - 1:00 PM",
    },
    {
      id: 5,
      title: "Sports Carnival 2025",
      description: "A grand celebration of sports with multiple tournaments.",
      image:
        "https://images.unsplash.com/photo-1647767614484-0da59e7fc51b?w=600&auto=format&fit=crop&q=60",
      venue: "National Stadium, Chicago",
      timing: "April 10-12, 2025",
    },
  ];

  const [showAll, setShowAll] = useState(false);
  const visibleEvents = showAll ? events : events.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left space-y-6">
            <h1 className="text-5xl font-bold leading-tight text-gray-900">
              Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">EventHive</span>
            </h1>
            <p className="text-lg text-gray-700">
              Your hub for discovering, organizing, and joining amazing events. From tech conferences to music festivals, find it all in one place.
            </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            {!isLoggedin ? (
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105 flex items-center justify-center"
              >
                Get Started <FaArrowRight className="ml-2" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/events")}
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition transform hover:scale-105 flex items-center justify-center"
              >
                Explore Events
              </button>
            )}
          </div>
          </div>

          <div className="flex-1 relative">
            <img
              src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800"
              alt="Hero"
              className="rounded-3xl shadow-2xl w-full lg:h-[400px] object-cover"
            />
            <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-xl shadow-md flex items-center space-x-2">
              <FaStar className="text-yellow-400" /> <span>Top Rated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Upcoming <span className="text-blue-600">Events</span>
            </h2>
            <Link
              to="/events"
              className="text-blue-600 border border-blue-200 px-5 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2"
            >
              See All <FaArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
                <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <div className="text-sm text-gray-500 mb-1">📍 {event.venue}</div>
                  <div className="text-sm text-gray-500">🕒 {event.timing}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className={`px-6 py-3 rounded-xl font-medium shadow-lg transition transform hover:scale-105 ${showAll ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'}`}
            >
              {showAll ? 'See Less' : 'See More'}
            </button>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default LandingPage;
