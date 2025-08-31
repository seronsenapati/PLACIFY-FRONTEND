// src/components/LoadingScreen.jsx
import React from "react";

const LoadingScreen = ({
  title = "Loading...",
  subtitle = "Please wait while we prepare your content...",
  steps = [
    { text: "Initializing application", color: "blue" },
    { text: "Loading data", color: "purple" },
    { text: "Preparing interface", color: "green" },
  ],
}) => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex justify-center items-center">
      <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
        {/* Loading Animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-blue-500 animate-spin"></div>
          <div
            className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-r-purple-500 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>

        {/* Loading Content */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400 text-lg">{subtitle}</p>

          {/* Progress Steps */}
          <div className="mt-8 space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-3 text-sm"
              >
                <div
                  className={`w-2 h-2 bg-${step.color}-500 rounded-full animate-pulse`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                ></div>
                <span className="text-gray-300">{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
