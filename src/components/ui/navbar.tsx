"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

// Placeholder components - you can replace these with your actual components
const SearchBar = () => (
  <div className="w-48">
    <input
      type="text"
      placeholder="Search..."
      className="w-full px-3 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none"
    />
  </div>
);

const WeightTypeSelector = () => (
  <select className="px-3 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none">
    <option value="lbs">lbs</option>
    <option value="kg">kg</option>
  </select>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user] = useState(null); // Replace with your actual user state management
  const navRef = useRef<HTMLElement>(null);

  const toggle = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/submit", label: "Submit Lifts" },
    { href: "/faq", label: "FAQ" },
    { href: "/profile", label: user ? "Profile" : "Sign In" },
    { href: "/feedback", label: "Feedback" },
  ];

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 w-full bg-gradient-to-r from-gray-900/90 via-gray-700/90 to-gray-900/90 text-white border-b border-gray-700/50 backdrop-blur-xs supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-gray-900/80 supports-[backdrop-filter]:via-gray-700/80 supports-[backdrop-filter]:to-gray-900/80"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center h-14 sm:h-15 md:h-16 lg:h-17 transition-all duration-300 ease-in-out">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center transition-all duration-300 ease-in-out"
          >
            <Image
              src="/Logo.svg"
              alt="Collegiate Strength Logo"
              width={150}
              height={40}
              className="h-8 w-auto sm:h-9 md:h-10 lg:h-11 transition-all duration-300 ease-in-out"
              style={{
                filter: "hue-rotate(0deg) saturate(1.5) brightness(1.1)",
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5 transition-all duration-300 ease-in-out">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 transition-all duration-300 ease-in-out">
              <WeightTypeSelector />
              <SearchBar />
            </div>
            <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 transition-all duration-300 ease-in-out">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggle}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-gray-900/95 border-b border-gray-700 shadow-lg backdrop-blur-sm">
            <div className="px-4 py-3 space-y-3">
              <div className="flex flex-col space-y-3 items-end">
                <WeightTypeSelector />
                <SearchBar />
              </div>
              <div className="border-t border-gray-700 pt-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-right text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
