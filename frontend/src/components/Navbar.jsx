// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, getRole, logout } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const role = getRole();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginClick = () => {
    scrollToTop();
  };

  const handleRegisterClick = () => {
    scrollToTop();
  };

  const dashPath =
    role === "student"
      ? "/student/dashboard"
      : role === "recruiter"
      ? "/recruiter/dashboard"
      : "/admin/dashboard";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-lg border-b border-dashed border-white/20 text-white px-4 sm:px-6 md:px-15 py-2 flex justify-between items-center shadow-lg">
      <Link
        to="/"
        className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide placify-font-style"
      >
        Placify
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex gap-4 md:gap-7 items-center">
        {loggedIn ? (
          <>
            <Link to={dashPath} className="relative group">
              <span>Dashboard</span>
            </Link>
            <button
              onClick={handleLogout}
              className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-red-500/20 hover:border-red-500/50 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition text-sm md:text-base"
              onClick={handleLoginClick}
            >
              Login
            </Link>
            <Link to="/register" onClick={handleRegisterClick}>Register</Link>
          </>
        )}
      </div>

      {/* Mobile Navigation Menu - Slides in from right within navbar */}
      <div className="lg:hidden flex items-center">
        <div 
          className={`absolute top-1/2 right-16 transform -translate-y-1/2 flex transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          {loggedIn ? (
            <div className="flex gap-2">
              <Link 
                to={dashPath} 
                className="text-sm font-semibold py-1.5 px-3 text-white hover:text-white/80 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="text-sm font-semibold px-4 py-1.5 rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold px-4 py-1.5 rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition"
                onClick={() => {
                  handleLoginClick();
                  setIsMenuOpen(false);
                }}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="text-sm font-semibold py-1.5 px-3 text-white hover:text-white/80 transition"
                onClick={() => {
                  handleRegisterClick();
                  setIsMenuOpen(false);
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile menu button - moved to the right side with custom hamburger lines */}
        <button
          className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 focus:ring-2 focus:ring-white/30 transition-all duration-200 absolute right-4"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <svg 
            className={`w-5 h-5 transition-all duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              // Custom hamburger with all lines shorter on the left side
              <g strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}>
                <path d="M8 6h11" />       {/* Top line - shorter on left */}
                <path d="M11 12h8" />      {/* Middle line - shorter on left */}
                <path d="M8 18h11" />      {/* Bottom line - shorter on left */}
              </g>
            )}
          </svg>
        </button>
      </div>
    </nav>
  );
}