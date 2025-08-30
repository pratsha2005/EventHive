import React, { useState, useContext, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const LandingPage = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const [events, setEvents] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = ["/image1.jpg", "/image2.jpg", "/image3.jpg"]; // Public folder images

  // Automatic slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch events
  useEffect(() => {
    const getEvents = async () => {
      try {
        let response;
        if (userData?.role === "organizer") {
          response = await axios.get(
            `${backendUrl}/api/events/getAllEventByManagerId`,
            { withCredentials: true }
          );
        } else {
          response = await axios.get(`${backendUrl}/api/user/getAllEvents`, {
            withCredentials: true,
          });
        }
        if (response.data.success) setEvents(response.data.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    getEvents();
  }, [backendUrl, userData]);

  const visibleEvents = showAll ? events : events.slice(0, 5);
  const sectionTitle = userData?.role === "organizer" ? "My Events" : "Upcoming Events";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <Navbar />

      {/* Hero Section with Sliding Animation */}
      <section className="relative overflow-hidden py-24 bg-gradient-to-b from-blue-500 to-blue-200 rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left space-y-6">
            <h1 className="text-5xl font-bold leading-tight text-gray-900">
              Welcome to{" "}
              <span className="text-white">
                EventHive
              </span>
            </h1>
            <p className="text-lg text-gray-700">
              Your hub for discovering, organizing, and joining amazing events. From tech conferences to music festivals, find it all in one place.
            </p>
          </div>

          <div className="flex-1 relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl">
            <div
              className="flex transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {heroImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className="w-full flex-shrink-0 h-[400px] object-cover rounded-3xl"
                />
              ))}
            </div>

          </div>
        </div>
      </section>

{/* Quote Section */}
<section className="py-20 bg-gradient-to-b from-blue-200 to-white">
  <div className="max-w-3xl mx-auto text-center px-6">
    <p className="text-4xl md:text-5xl italic font-semibold text-gray-800 mb-6">
      "Great events create great memories; great memories create lasting connections."
    </p>
    <span className="text-lg md:text-xl text-gray-600 font-medium">– EventHive</span>
  </div>
</section>


      {/* Events Section */}
      <section className="py-20 bg-white rounded-t-3xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{sectionTitle}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
              >
                <img
                  src={event.media?.bannerUrl || "https://via.placeholder.com/400x200"}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="text-sm text-gray-500 mb-1">
                    📍 {event.location?.venue || "Online"}
                  </div>
                  <div className="text-sm text-gray-500">
                    🕒 {new Date(event.startDateTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {events.length > 5 && (
            <div className="text-center mt-10">
              <button
                onClick={() => setShowAll(!showAll)}
                className={`px-6 py-3 rounded-xl font-medium shadow-lg transition transform hover:scale-105 ${
                  showAll
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                }`}
              >
                {showAll ? "See Less" : "See More"}
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
