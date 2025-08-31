// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, getRole, logout } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const role = getRole();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashPath =
    role === "student"
      ? "/student/dashboard"
      : role === "recruiter"
      ? "/recruiter/dashboard"
      : "/admin/dashboard";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-lg border-b border-dashed border-white/20 text-white px-6 md:px-15 py-2 flex justify-between items-center shadow-lg">
      <Link
        to="/"
        className="text-4xl font-bold tracking-wide placify-font-style"
      >
        Placify
      </Link>

      <div className="flex gap-4 md:gap-7 items-center">
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
            >
              Login
            </Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
