// import React, { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { FiMenu, FiX, FiUser, FiFilter, FiBarChart2, FiHome, FiLogOut, FiSettings } from 'react-icons/fi';

// const Navbar = ({ isLoggedIn, setIsLoggedIn, userAvatar }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const location = useLocation();

//   const navItems = [
//     { name: 'Home', href: '/', icon: FiHome },
//     { name: 'Dashboard', href: '/dashboard', icon: FiBarChart2 },
//     { name: 'Profile', href: '/profile', icon: FiUser },
//     { name: 'Filters', href: '/filters', icon: FiFilter },
//     { name: 'Admin', href: '/admin', icon: FiSettings },
//   ];

//   const handleLogin = () => {
//     setIsLoggedIn(true);
//     console.log('User logged in');
//   };

//   const handleSignup = () => {
//     setIsLoggedIn(true);
//     console.log('User signed up');
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setShowDropdown(false);
//     console.log('User logged out');
//   };

//   return (
//     <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <div className="flex items-center">
//             <Link to="/" className="flex items-center space-x-2">
//               <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
//                 <span className="text-white font-bold text-lg">B</span>
//               </div>
//               <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                 EventHive
//               </span>
//             </Link>
//           </div>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-4">
//             <div className="flex items-baseline space-x-4">
//               {navItems.map((item) => {
//                 const Icon = item.icon;
//                 const isActive = location.pathname === item.href;
//                 return (
//                   <Link
//                     key={item.name}
//                     to={item.href}
//                     className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                       isActive
//                         ? 'bg-blue-100 text-blue-700 shadow-sm'
//                         : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
//                     }`}
//                   >
//                     <Icon size={16} />
//                     <span>{item.name}</span>
//                   </Link>
//                 );
//               })}
//             </div>
            
//             {/* Auth Section */}
//             <div className="ml-6 flex items-center space-x-3">
//               {!isLoggedIn ? (
//                 <>
//                   <button
//                     onClick={handleLogin}
//                     className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
//                   >
//                     Login
//                   </button>
//                   <button
//                     onClick={handleSignup}
//                     className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
//                   >
//                     Sign Up
//                   </button>
//                 </>
//               ) : (
//                 <div className="relative">
//                   <button
//                     onClick={() => setShowDropdown(!showDropdown)}
//                     className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium hover:shadow-lg transition-all duration-200"
//                   >
//                     {userAvatar ? (
//                       <img src={userAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
//                     ) : (
//                       <FiUser size={20} />
//                     )}
//                   </button>
                  
//                   {showDropdown && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
//                       <Link
//                         to="/profile"
//                         onClick={() => setShowDropdown(false)}
//                         className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
//                       >
//                         <FiUser size={16} className="mr-2" />
//                         Profile
//                       </Link>
//                       <button
//                         onClick={handleLogout}
//                         className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
//                       >
//                         <FiLogOut size={16} className="mr-2" />
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
//             >
//               {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {isOpen && (
//           <div className="md:hidden">
//             <div className="px-2 pt-2 pb-3 space-y-1 bg-white/90 backdrop-blur-sm rounded-lg mt-2 shadow-lg border border-blue-100 mb-2">
//               {navItems.map((item) => {
//                 const Icon = item.icon;
//                 const isActive = location.pathname === item.href;
//                 return (
//                   <Link
//                     key={item.name}
//                     to={item.href}
//                     onClick={() => setIsOpen(false)}
//                     className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                       isActive
//                         ? 'bg-blue-100 text-blue-700'
//                         : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
//                     }`}
//                   >
//                     <Icon size={16} />
//                     <span>{item.name}</span>
//                   </Link>
//                 );
//               })}
              
//               {/* Mobile Auth Section */}
//               <div className="border-t border-gray-200 pt-3 mt-3">
//                 {!isLoggedIn ? (
//                   <div className="space-y-2">
//                     <button
//                       onClick={handleLogin}
//                       className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
//                     >
//                       Login
//                     </button>
//                     <button
//                       onClick={handleSignup}
//                       className="w-full text-left px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
//                     >
//                       Sign Up
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     <Link
//                       to="/profile"
//                       onClick={() => setIsOpen(false)}
//                       className="flex items-center px-3 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
//                     >
//                       <FiUser size={16} className="mr-2" />
//                       Profile
//                     </Link>
//                     <button
//                       onClick={() => {
//                         handleLogout();
//                         setIsOpen(false);
//                       }}
//                       className="w-full flex items-center px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
//                     >
//                       <FiLogOut size={16} className="mr-2" />
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;