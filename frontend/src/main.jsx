import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Performance monitoring
if ('performance' in window) {
  // Measure initial load performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        console.log('[Performance] Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        console.log('[Performance] DOMContentLoaded time:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
      }
    }, 0);
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);