import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative bg-black text-white overflow-hidden">
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col">
        {/* Footer Section */}
        <footer className="px-4 sm:px-6 md:px-12 lg:px-20 py-6 sm:py-8 text-sm">
          <div className="max-w-7xl mx-auto w-full">
            {/* Top Footer Content - Adjusted for mobile */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6 sm:gap-8">
              {/* Left Side - Brand */}
              <div className="flex flex-col gap-2 sm:gap-3 max-w-xs">
                <Link
                  to="/"
                  onClick={scrollToTop}
                  className="text-3xl sm:text-4xl font-bold tracking-tight placify-font-style"
                >
                  Placify
                </Link>
                <p className="text-gray-400 text-sm sm:text-base">
                  Built by{" "}
                  <a
                    href="https://www.linkedin.com/in/seronsenapati/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    @seronsenapati
                  </a>
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  © {new Date().getFullYear()} Placify. All rights reserved.
                </p>
              </div>

              {/* Right Side - Links */}
              <div className="flex flex-wrap gap-8 sm:gap-12 text-sm sm:text-base">
                {/* Socials Column */}
                <div>
                  <h3 className="text-white font-semibold mb-2 sm:mb-3">Socials</h3>
                  <ul className="flex flex-col gap-1.5 sm:gap-2">
                    <li>
                      <a
                        href="https://github.com/seronsenapati"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        Github
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.linkedin.com/in/seronsenapati/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        LinkedIn
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.instagram.com/seron.senapati/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        Instagram
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://x.com/seron_senapati"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        X
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Legal Column */}
                <div>
                  <h3 className="text-white font-semibold mb-2 sm:mb-3">Legal</h3>
                  <ul className="flex flex-col gap-1.5 sm:gap-2">
                    <li>
                      <Link
                        to="/privacy-policy"
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                        onClick={scrollToTop}
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/terms-of-service"
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                        onClick={scrollToTop}
                      >
                        Terms of Service
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Larger Background Text - Adjusted for mobile */}
            <div
              aria-hidden="true"
              className="relative flex justify-center items-center h-44 sm:h-32 md:h-40 lg:h-48 overflow-hidden"
            >
              <div
                className="placify-font-style text-[7rem] xs:text-[5rem] sm:text-[5rem] md:text-[8rem] lg:text-[13rem] font-black tracking-tighter select-none bg-gradient-to-b from-[#555] to-[#0a0a0a] bg-clip-text text-transparent"
                style={{
                  fontWeight: "900",
                  letterSpacing: "0.1em",
                }}
              >
                PLACIFY
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}