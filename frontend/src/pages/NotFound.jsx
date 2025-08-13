// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black bg-black flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-lg text-gray-400 mb-6">Oops! The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg transition">
        Go Back Home
      </Link>
    </div>
  );
}
