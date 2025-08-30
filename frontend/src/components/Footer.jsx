import React from "react";
import { FaHeart, FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Branding & Socials */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">EH</span>
            </div>
            <span className="text-xl font-bold">EventHive</span>
          </div>

          <div className="flex space-x-4">
            {[FaGithub, FaTwitter, FaLinkedin].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="text-blue-300 hover:text-white p-2 rounded-lg hover:bg-blue-800/30 transition"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 className="font-semibold mb-2 text-blue-200">Quick Links</h3>
            <ul className="space-y-1">
              {["Home", "Dashboard", "Profile", "Filters"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-blue-300 hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-blue-200">Support</h3>
            <ul className="space-y-1">
              {["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"].map(
                (link) => (
                  <li key={link}>
                    <a href="#" className="text-blue-300 hover:text-white">
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-8 border-t border-blue-800 pt-4 text-sm text-blue-200 flex flex-col sm:flex-row justify-between items-center">
          <p>© 2025 EventHive. All rights reserved.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Made with <FaHeart size={14} className="mx-1 text-red-400" /> by EventHive Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
