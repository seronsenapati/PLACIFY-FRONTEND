import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #ffffff14 0%, rgba(255, 255, 255, 0.12) 19%, rgba(255, 255, 255, 0.05) 28%, transparent 35%, transparent 100%), linear-gradient(to bottom, #18181b, #000000)",
      }}
    >
      {/* Decorative dotted lines */}
      <div
        className="absolute top-0 left-[55px] h-full w-[1px]"
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 1px, transparent 4px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-0 right-[55px] h-full w-[1px]"
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 1px, transparent 4px)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* 404 Error Code */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold tracking-tight placify-font-style">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-300 mb-2">
            Oops! The page you're looking for seems to have vanished into the digital void.
          </p>
          <p className="text-gray-400">
            Don't worry, even the best candidates sometimes take a wrong turn. Let's get you back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="bg-white text-black px-6 py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2 group"
          >
            Back to Home
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
          </Link>

          <Link 
            to="/jobs" 
            className="px-6 py-3 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition text-sm sm:text-base flex items-center justify-center gap-2 group"
          >
            Explore Jobs
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
          </Link>
        </div>

        {/* Placify Branding */}
        <div className="mt-12">
          <p className="text-gray-500 text-sm">
            <span className="placify-font-style text-xl tracking-wider">Placify</span> - Connecting Talent with Opportunity
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <div className="w-3 h-3 rounded-full bg-gray-700 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-gray-700 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 rounded-full bg-gray-700 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-xs text-gray-600 mt-2">SEARCHING FOR ALTERNATIVE PATHS</p>
      </div>
    </div>
  );
}