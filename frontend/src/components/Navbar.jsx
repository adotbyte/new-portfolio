import React, { useState } from 'react';
// 1. Add useLocation to your imports
import { Link, useLocation } from 'react-router-dom'; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // 2. Get the current location object
  const location = useLocation();

  const navLinks = [
    { name: 'About', path: '/' },
    { name: 'Portfolio', path: '/Portfolio' },
    { name: 'Contact', path: '/Contact' },
  ];

  return (
    <nav className="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 font-bold text-2xl text-blue-600 tracking-tighter">
            Audrius Morkūnas Portfolio
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              // 3. Check if this link is the active one
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-medium transition duration-300 ${
                    isActive 
                      ? 'text-blue-600 border-b-2 border-blue-600' // Active Style
                      : 'text-gray-600 hover:text-blue-600'        // Inactive Style
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* ... Mobile Menu Button ... */}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white border-t`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-3 py-2 rounded-md font-medium ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;