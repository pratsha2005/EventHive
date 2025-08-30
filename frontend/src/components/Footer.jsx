import React from "react";
import { FaHeart, FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">EH</span>
              </div>
              <span className="text-xl font-bold">EventHive</span>
            </div>
            <p className="text-blue-200 mb-6 max-w-md">
              Building beautiful, modern web experiences with cutting-edge
              technology and thoughtful design.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-blue-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-blue-800/30"
              >
                <FaGithub size={20} />
              </a>
              <a
                href="#"
                className="text-blue-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-blue-800/30"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                className="text-blue-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-blue-800/30"
              >
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4 text-blue-100">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "Dashboard", "Profile", "Filters"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-blue-100">Support</h3>
            <ul className="space-y-2">
              {[
                "Help Center",
                "Contact Us",
                "Privacy Policy",
                "Terms of Service",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-blue-200 text-sm">
            © 2025 EventHive. All rights reserved.
          </p>
          <p className="text-blue-200 text-sm flex items-center mt-2 sm:mt-0">
            Made with <FaHeart size={14} className="mx-1 text-red-400" /> by
            EventHive Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
