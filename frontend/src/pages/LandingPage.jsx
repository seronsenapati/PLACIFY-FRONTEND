import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, getRole } from "../utils/auth";

export default function Landing() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [role, setRole] = useState(getRole());

  // Update auth state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setLoggedIn(isLoggedIn());
      setRole(getRole());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const scrollToAbout = () => {
    document.getElementById("about-us")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExploreJobs = () => {
    // If user is logged in as a recruiter, redirect to their job management page
    if (loggedIn && role === "recruiter") {
      navigate("/recruiter/jobs");
      return;
    }

    // For students and all other users, go to job listings
    navigate("/jobs");
  };

  return (
    <div className="relative text-white overflow-hidden">
      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6 min-h-screen bg-gradient-to-br from-gray-900 to-black overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #ffffff14 0%, rgba(255, 255, 255, 0.12) 19%, rgba(255, 255, 255, 0.05) 28%, transparent 35%, transparent 100%), linear-gradient(to bottom, #18181b, #000000)",
        }}
      >
        {/* Left Dotted Line */}
        <div
          className="absolute top-0 left-[55px] h-full w-[1px]"
          style={{
            background:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 1px, transparent 4px)",
          }}
          aria-hidden="true"
        />
        {/* Right Dotted Line */}
        <div
          className="absolute top-0 right-[55px] h-full w-[1px]"
          style={{
            background:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 1px, transparent 4px)",
          }}
          aria-hidden="true"
        />

        <h1 className="text-7xl font-bold mb-4">Your Career, Our Mission.</h1>
        <h3 className="text-lg font-medium mb-12 mt-5 text-gray-300">
          Your gateway to connecting talented students <br /> with the right
          career opportunities.
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* GET STARTED Button */}
          <button
            onClick={handleExploreJobs}
            className="bg-white text-black px-8 py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 group"
            aria-label="Jobs and Explore Jobs"
          >
            {loggedIn && role === "recruiter" ? "Manage Jobs" : "Explore Jobs"}
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>

          {/* Know More Button */}
          <button
            onClick={scrollToAbout}
            className="px-8 py-3 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition text-sm md:text-base"
            aria-label="Scroll to About Us section"
          >
            Know More
          </button>
        </div>
      </section>

      {/* About Us Section */}
      <section
        id="about-us"
        className="relative py-20 px-6 bg-black -mt-1"
        aria-describedby="about-us-desc"
      >
        {/* Left Dotted Line */}
        <div
          className="absolute top-0 left-[55px] bottom-0 w-[1px]"
          style={{
            background:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 1px, transparent 4px)",
          }}
          aria-hidden="true"
        />
        {/* Right Dotted Line */}
        <div
          className="absolute top-0 right-[55px] bottom-0 w-[1px]"
          style={{
            background:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 1px, transparent 4px)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">About Us</h2>
          <p
            id="about-us-desc"
            className="text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            We are dedicated to bridging the gap between talented students and
            leading employers. Our mission is to empower students with the
            tools, resources, and opportunities they need to launch successful
            careers. Through innovative technology and personalized guidance, we
            ensure every student can connect with the right career path.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300">
              <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
              <p className="text-gray-400 text-sm">
                To create a world where every student has equal access to career
                opportunities.
              </p>
            </div>

            <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300">
              <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
              <p className="text-gray-400 text-sm">
                Empower students by connecting them with companies seeking
                fresh, innovative talent.
              </p>
            </div>

            <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300">
              <h3 className="text-xl font-semibold mb-2">Our Approach</h3>
              <p className="text-gray-400 text-sm">
                Using AI-powered matching and personalized career support to
                ensure the best fit for both students and employers.
                hustle  - free job creation by AI for recruiters.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-6 mt-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-snug">
            You deserve to get
            <br />
            the right Opportunities
          </h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => { handleExploreJobs(); scrollToTop() }}
              className="bg-white text-black px-6 py-2 rounded-full font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 group"
              aria-label="Jobs and Explore Jobs"
            >
              {loggedIn && role === "recruiter" ? "Manage Jobs" : "Explore Jobs"}
              <svg
                className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}