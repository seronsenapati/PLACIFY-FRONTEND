import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative bg-black text-white overflow-hidden">
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col">
        {/* Footer Section */}
        <footer className="px-6 sm:px-12 lg:px-20 py-8 text-sm ">
          <div className="max-w-7xl mx-auto w-full">
            {/* Top Footer Content */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-8">
              {/* Left Side - Brand */}
              <div className="flex flex-col gap-3 max-w-xs">
                <Link
                  to="/"
                  onClick={scrollToTop}
                  className="text-4xl font-bold tracking-tight placify-font-style"
                >
                  Placify
                </Link>
                <p className="text-gray-400 text-base">
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
                <p className="text-gray-500 text-xs">
                  © 2025 Placify. All rights reserved.
                </p>
              </div>

              {/* Right Side - Links */}
              <div className="flex flex-wrap gap-12 text-base">
                {/* Socials Column */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Socials</h3>
                  <ul className="flex flex-col gap-2">
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
                  <h3 className="text-white font-semibold mb-3">Legal</h3>
                  <ul className="flex flex-col gap-2">
                    <li>
                      <Link
                        to="/privacy-policy"
                        className="text-gray-400 hover:text-white transition-colors duration-200"s
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

            {/* Large Background Text */}
            <div
              aria-hidden="true"
              className="relative flex justify-center items-center h-24 sm:h-32 lg:h-40 overflow-hidden"
            >
              <div
                className=" placify-font-style text-[2.5rem] xs:text-[4rem] sm:text-[6rem] md:text-[7rem] lg:text-[9rem] font-black tracking-tighter select-none bg-gradient-to-b from-[#555] to-[#1a1a1a] bg-clip-text text-transparent"
                style={{
                  fontWeight: "750",
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
