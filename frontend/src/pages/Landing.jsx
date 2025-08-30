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
        "https://plus.unsplash.com/premium_photo-1724753996058-6f46e8e77f0e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHRlY2glMjBjb25mZXJlbmNlfGVufDB8fDB8fHww",
      venue: "Tech Park, San Francisco",
      timing: "March 5, 2025 • 10:00 AM - 5:00 PM",
    },
    {
      id: 2,
      title: "Music Fiesta Night",
      description: "An unforgettable night of live performances by top artists.",
      image:
        "https://images.unsplash.com/photo-1568036064686-b3130620ae0a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8TXVzaWMlMjBGaWVzdGElMjBOaWdodHxlbnwwfHwwfHx8MA%3D%3D",
      venue: "Downtown Arena, Los Angeles",
      timing: "March 12, 2025 • 7:00 PM - 11:00 PM",
    },
    {
      id: 3,
      title: "Startup Hackathon",
      description:
        "Build innovative solutions in 24 hours with fellow developers.",
      image:
        "https://plus.unsplash.com/premium_photo-1663040543387-cb7c78c4f012?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8U3RhcnR1cCUyMEhhY2thdGhvbnxlbnwwfHwwfHx8MA%3D%3D",
      venue: "Innovation Hub, New York",
      timing: "March 20-21, 2025",
    },
    {
      id: 4,
      title: "Design Thinking Workshop",
      description:
        "Learn how to solve problems creatively with design thinking.",
      image:
        "https://plus.unsplash.com/premium_photo-1683133927528-8075b14131a0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8RGVzaWduJTIwVGhpbmtpbmclMjBXb3Jrc2hvcHxlbnwwfHwwfHx8MA%3D%3D",
      venue: "Creative Hub, Boston",
      timing: "April 2, 2025 • 9:00 AM - 1:00 PM",
    },
    {
      id: 5,
      title: "Sports Carnival 2025",
      description: "A grand celebration of sports with multiple tournaments.",
      image:
        "https://images.unsplash.com/photo-1647767614484-0da59e7fc51b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fFNwb3J0cyUyMENhcm5pdmFsJTIwMjAyNXxlbnwwfHwwfHx8MA%3D%3D",
      venue: "National Stadium, Chicago",
      timing: "April 10-12, 2025",
    },
  ];

  const [showAll, setShowAll] = useState(false);
  const visibleEvents = showAll ? events : events.slice(0, 3);

  
  const handleGetStarted = () => {
    if (isLoggedin && userData?.role) {
      if (userData.role === "attendee") return navigate("/attend");
      if (userData.role === "organizer") return navigate("/organise");
      if (userData.role === "admin") return navigate("/admin");
    }
    navigate("/login"); 
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-800/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Welcome to EventHive
              </span>
              <br />
              <span className="text-gray-800">
                Your Hub for Events & Experiences
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover, organize, and participate in events like never before.
              From concerts to conferences, EventHive brings everything together
              in one place — making event discovery and management simple, smart,
              and seamless.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
                <FaArrowRight className="ml-2" size={20} />
              </button>
              <Link
                to="/register"
                onClick={() => navigate("/register")}
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Explore Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Upcoming{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Events
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover exciting experiences happening near you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <div className="text-sm text-gray-500 mb-1">
                    📍 {event.venue}
                  </div>
                  <div className="text-sm text-gray-500">🕒 {event.timing}</div>
                </div>
              </div>
            ))}
          </div>

          
          <div className="text-center mt-10">
            {!showAll ? (
              <button
                onClick={() => setShowAll(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                See More
              </button>
            ) : (
              <button
                onClick={() => setShowAll(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                See Less
              </button>
            )}
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-blue-200">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-blue-200">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-200">Support</div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-12">
              What Our Users Say
            </h2>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl max-w-4xl mx-auto border border-blue-100">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className="text-yellow-400 fill-current"
                    size={24}
                  />
                ))}
              </div>
              <blockquote className="text-xl text-gray-700 mb-6">
                "This platform has completely transformed our workflow. The
                intuitive design and powerful features make it a joy to use
                every day."
              </blockquote>
              <div className="text-gray-600">
                <div className="font-semibold">Sarah Johnson</div>
                <div>Product Manager at TechCorp</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
