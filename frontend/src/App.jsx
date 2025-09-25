// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useEffect } from "react";
import api from "./services/api";
import { getRole } from "./utils/auth";
import { initializePrefetching } from "./utils/prefetch";

export default function App() {
  // Preload critical resources on app start
  useEffect(() => {
    // Preload fonts or other critical assets
    const preloadResources = () => {
      // Add any critical resources that should be preloaded
      console.log("[App] Preloading critical resources");
    };
    
    preloadResources();
    
    // Initialize prefetching for the current user role
    const userRole = getRole();
    if (userRole) {
      initializePrefetching(userRole);
    }
    
    // Clear API cache when user logs in/out
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        // Token changed, clear API cache
        api.clearAllCache();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}